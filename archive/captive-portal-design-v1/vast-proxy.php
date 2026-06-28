<?php
// Simple, restricted VAST proxy to avoid CORS issues.
// Allows only servedby.revive-adserver.net URLs over http/https.

error_reporting(E_ALL);
ini_set('log_errors', '1');
ini_set('error_log', '/tmp/vast_proxy_error.log');
ini_set('display_errors', '0');

header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store');

$url   = isset($_GET['url']) ? trim((string)$_GET['url']) : '';
$debug = isset($_GET['debug']) ? (int)$_GET['debug'] : 0;
if ($url === '') {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Missing url']);
    exit;
}

$parts = parse_url($url);
$scheme = $parts['scheme'] ?? '';
$host   = $parts['host'] ?? '';
if (!in_array($scheme, ['http', 'https'], true) || $host !== 'servedby.revive-adserver.net') {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Disallowed host or scheme']);
    exit;
}

function fetch_via_curl(string $url): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS      => 3,
        CURLOPT_TIMEOUT        => 8,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_USERAGENT      => 'PLX-HotSpot-VAST-Proxy/1.0',
        CURLOPT_HEADER         => false,
    ]);
    $body = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE) ?: 0;
    $ct   = curl_getinfo($ch, CURLINFO_CONTENT_TYPE) ?: '';
    curl_close($ch);
    return ['ok' => ($body !== false && $code >= 200 && $code < 300), 'code' => $code, 'body' => $body, 'err' => $err, 'ct' => $ct, 'via' => 'curl'];
}

function fetch_via_stream(string $url): array {
    $ctx = stream_context_create([
        'http' => [
            'method'  => 'GET',
            'timeout' => 8,
            'header'  => "User-Agent: PLX-HotSpot-VAST-Proxy/1.0\r\n",
        ],
        'ssl' => [
            'verify_peer'      => true,
            'verify_peer_name' => true,
        ],
    ]);
    $body = @file_get_contents($url, false, $ctx);
    $headers = isset($http_response_header) ? $http_response_header : [];
    $code = 0; $ct = '';
    if ($headers && isset($headers[0]) && preg_match('#\s(\d{3})\s#', $headers[0], $m)) {
        $code = (int)$m[1];
    }
    foreach ($headers as $h) {
        if (stripos($h, 'Content-Type:') === 0) { $ct = trim(substr($h, 13)); break; }
    }
    $ok = ($body !== false && $code >= 200 && $code < 300);
    return ['ok' => $ok, 'code' => $code, 'body' => $body, 'err' => $ok ? '' : 'stream_fetch_failed', 'ct' => $ct, 'via' => 'stream'];
}

$result = null;
if (function_exists('curl_init')) {
    $result = fetch_via_curl($url);
} else {
    // cURL missing, fallback to streams
    $result = fetch_via_stream($url);
}

if (!$result['ok']) {
    http_response_code(502);
    header('Content-Type: application/json');
    $payload = ['error' => 'Upstream fetch failed', 'code' => $result['code'], 'via' => $result['via']];
    if ($debug) { $payload['detail'] = $result['err']; }
    echo json_encode($payload);
    exit;
}

// Force XML content-type for VAST (some servers send text/xml or application/xml)
header('Content-Type: application/xml; charset=utf-8');
echo $result['body'];
