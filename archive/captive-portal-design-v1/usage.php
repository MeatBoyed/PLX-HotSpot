<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

error_reporting(E_ALL);
ini_set('log_errors', '1');
ini_set('error_log', '/tmp/rd_api_error.log');

$dsn  = 'mysql:host=localhost;dbname=rd;charset=utf8mb4';
$user = 'captive_portal';
$pass = 'TgLlNp9utQ1W8x';
$RADIUS_DESK_BASE = 'https://radiusdesk.pluxnet.co.za';

$nasip = isset($_GET['nasipaddress']) ? trim((string)$_GET['nasipaddress']) : (isset($_GET['nas']) ? trim((string)$_GET['nas']) : '');
$username = isset($_GET['username']) ? trim((string)$_GET['username']) : '';
$debug    = isset($_GET['debug']) ? (int)$_GET['debug'] : 0;

if ($nasip === '') {
    http_response_code(400);
    echo json_encode(['status'=>'error','message'=>'nasipaddress is required']);
    exit;
}

function dump_stmt(PDOStatement $st): string {
    ob_start();
    $st->debugDumpParams();
    return ob_get_clean();
}

function format_bytes($bytes): string {
    if (!is_numeric($bytes)) return '-';
    $bytes = (float)$bytes;
    $units = ['B','KB','MB','GB','TB'];
    $i = 0;
    while ($bytes >= 1024 && $i < count($units)-1) {
        $bytes /= 1024;
        $i++;
    }
    return ($i === 0 ? (string)round($bytes) : number_format($bytes, 2)) . ' ' . $units[$i];
}

/**
 * Fetch usage/depleted from RadiusDesk Cake4 endpoint using username & mac
 * Returns array: [
 *   'success' => bool,
 *   'depleted' => bool|null,
 *   'data' => array|null,
 *   'http' => int|null,
 *   'url' => string,
 *   'error' => string|null,
 * ]
 */
function fetch_cake_usage(string $baseUrl, string $username, string $mac, int $debug = 0): array {
    $result = [
        'success' => false,
        'depleted' => null,
        'data' => null,
        'http' => null,
        'url' => '',
        'error' => null,
    ];
    // Normalize MAC (uppercase, colons)
    $macNorm = strtoupper(str_replace('-', ':', trim($mac)));
    $url = rtrim($baseUrl, '/') . '/cake4/rd_cake/radaccts/get-usage.json?username=' . urlencode($username) . '&mac=' . urlencode($macNorm);
    $result['url'] = $url;

    try {
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            $body = curl_exec($ch);
            $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err  = curl_error($ch);
            curl_close($ch);
            $result['http'] = $http;
            if ($body !== false && $http >= 200 && $http < 300) {
                $json = json_decode($body, true);
                if (is_array($json)) {
                    $result['success'] = !empty($json['success']);
                    $result['data'] = $json['data'] ?? null;
                    if (isset($json['data']['depleted'])) {
                        $result['depleted'] = (bool)$json['data']['depleted'];
                    }
                } else {
                    $result['error'] = 'Invalid JSON';
                }
            } else {
                $result['error'] = $err ?: ('HTTP ' . (string)$http);
            }
        } else {
            $ctx = stream_context_create([
                'http' => [
                    'method' => 'GET',
                    'timeout' => 5,
                    'ignore_errors' => true,
                ],
            ]);
            $body = @file_get_contents($url, false, $ctx);
            if (isset($http_response_header) && is_array($http_response_header)) {
                foreach ($http_response_header as $h) {
                    if (preg_match('#^HTTP/\S+\s+(\d{3})#', $h, $m)) { $result['http'] = (int)$m[1]; break; }
                }
            }
            if ($body !== false && ($result['http'] === null || ($result['http'] >= 200 && $result['http'] < 300))) {
                $json = json_decode($body, true);
                if (is_array($json)) {
                    $result['success'] = !empty($json['success']);
                    $result['data'] = $json['data'] ?? null;
                    if (isset($json['data']['depleted'])) {
                        $result['depleted'] = (bool)$json['data']['depleted'];
                    }
                } else {
                    $result['error'] = 'Invalid JSON';
                }
            } else {
                $result['error'] = 'HTTP ' . (string)($result['http'] ?? '');
            }
        }
    } catch (Throwable $e) {
        $result['error'] = $e->getMessage();
    }

    return $result;
}

/**
 * Resolve profile details and limits (steps 3 & 4)
 * - If profileId provided, fetch profiles by id
 * - Else if profileName provided, fetch profiles by name to get id
 * - Then fetch radgroupcheck for SimpleAdd_<id> to build limits
 * Returns: [profile|null, profileId|null, limits(array), debug(array)]
 */
function resolve_profile_and_limits(PDO $pdo, ?int $profileId, ?string $profileName, int $debug = 0): array {
    $profile = null;
    $pid = $profileId;
    $dbg = ['sql3'=>null,'stmt3'=>null,'sql4'=>null,'stmt4'=>null];

    // If no id but have name, look up id by name
    if ($pid === null && $profileName !== null && $profileName !== '') {
        $sql3n = "SELECT id, name, created, modified FROM profiles WHERE name = :pname LIMIT 1";
        $st3n  = $pdo->prepare($sql3n);
        $st3n->execute([':pname'=>$profileName]);
        $row3n = $st3n->fetch() ?: null;
        if ($debug) { $dbg['sql3'] = $sql3n; $dbg['stmt3'] = dump_stmt($st3n); }
        if ($row3n && isset($row3n['id'])) {
            $pid = (int)$row3n['id'];
            $profile = $row3n;
        }
    }

    // If we have an id, ensure we have profile details
    if ($pid !== null && $profile === null) {
        $sql3 = "SELECT id, name, created, modified FROM profiles WHERE id = :pid LIMIT 1";
        $st3  = $pdo->prepare($sql3);
        $st3->execute([':pid'=>$pid]);
        $profile = $st3->fetch() ?: null;
        if ($debug) { $dbg['sql3'] = $sql3; $dbg['stmt3'] = dump_stmt($st3); }
    }

    // Build limits
    $limits = ['data_cap_bytes'=>null,'reset_type'=>null,'cap_type'=>null,'mac_counter'=>null,'raw'=>[]];
    if ($pid !== null) {
        $sql4 = <<<SQL
SELECT id, groupname, attribute, op, value, created, modified
FROM radgroupcheck
WHERE groupname = CONCAT('SimpleAdd_', :pid)
ORDER BY id
SQL;
        $st4 = $pdo->prepare($sql4);
        $st4->execute([':pid'=>$pid]);
        $rows4 = $st4->fetchAll();
        if ($debug) { $dbg['sql4'] = $sql4; $dbg['stmt4'] = dump_stmt($st4); }
        foreach ($rows4 as $r) {
            if ($r['attribute'] === 'Rd-Total-Data') {
                $limits['data_cap_bytes'] = is_numeric($r['value']) ? (int)$r['value'] : null;
            } elseif ($r['attribute'] === 'Rd-Reset-Type-Data') {
                $limits['reset_type'] = $r['value'];
            } elseif ($r['attribute'] === 'Rd-Cap-Type-Data') {
                $limits['cap_type'] = $r['value'];
            } elseif ($r['attribute'] === 'Rd-Mac-Counter-Data') {
                $limits['mac_counter'] = $r['value'];
            }
        }
        $limits['raw'] = $rows4;
    }

    return [$profile, $pid, $limits, $dbg];
}

// Off-hand to Function that runs this process....
// Do you need the screen Mahmut?

// For Voucher (most login) follow the process below
// 1. Check Active users (radacct) by IP/Username/MAC 
//      => Get the Username
// 2. Check Vouchers (vouchers) where name=<username> (if provided)
//      => Get related Profile
// 3. Check the Profile (profiles) where name=<profile> 
//      => Get ID into 'SimpleAdd_<id>' format (Profile's Groupname)
// 4. check radgroupcheck (SimpleAdd_<id>) where groupname=<groupname> 
//      => Get limits/settings
try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);


    // 1) Latest active session by nasipaddress (and username if provided)
    $sql1 = <<<SQL
SELECT
  ra.username,
  ra.callingstationid AS mac,
  ra.framedipaddress   AS ip,
  COALESCE(ra.acctinputoctets, 0)  AS bytes_in,
  COALESCE(ra.acctoutputoctets, 0) AS bytes_out,
  ra.groupname,
  ra.nasipaddress,
  ra.acctstarttime,
  ra.acctsessiontime
FROM radacct ra
WHERE ra.acctstoptime IS NULL
  AND ra.nasipaddress = :nas
  AND (:username IS NULL OR ra.username = :username)
ORDER BY ra.acctstarttime DESC
LIMIT 1
SQL;

    $st1 = $pdo->prepare($sql1);
    $st1->bindValue(':nas', $nasip, PDO::PARAM_STR);
    if ($username === '') {
        $st1->bindValue(':username', null, PDO::PARAM_NULL);
    } else {
        $st1->bindValue(':username', $username, PDO::PARAM_STR);
    }
    $st1->execute();
    $session = $st1->fetch() ?: null;
    $dbg1 = $debug ? dump_stmt($st1) : null;

    // Step 2) Voucher lookup by username (prefer this path for voucher logins)
    $dbg2 = null; $sql2 = null; $voucherProfileId = null; $voucherProfileName = null;
    $effectiveUsername = $username !== '' ? $username : ($session['username'] ?? '');
    if ($effectiveUsername !== '') {
        $sql2 = "SELECT profile_id FROM vouchers WHERE name = :u LIMIT 1";
        $st2  = $pdo->prepare($sql2);
        $st2->execute([':u'=>$effectiveUsername]);
        $row2 = $st2->fetch();
        $dbg2 = $debug ? dump_stmt($st2) : null;
        if ($row2 && isset($row2['profile_id']) && is_numeric($row2['profile_id'])) {
            $voucherProfileId = (int)$row2['profile_id'];
        }
    }

    // Steps 3 & 4) Resolve profile and limits using a helper (prefer voucher result, else fallback to groupname)
    $profile = null; $profileId = null; $limits = ['data_cap_bytes'=>null,'reset_type'=>null,'cap_type'=>null,'mac_counter'=>null,'raw'=>[]];
    $dbg34 = ['sql3'=>null,'stmt3'=>null,'sql4'=>null,'stmt4'=>null];
    if ($voucherProfileId !== null) {
        [$profile, $profileId, $limits, $dbg34] = resolve_profile_and_limits($pdo, $voucherProfileId, null, $debug);
    } else if ($session && !empty($session['groupname']) && preg_match('/^SimpleAdd_(\d+)$/', $session['groupname'], $m)) {
        [$profile, $profileId, $limits, $dbg34] = resolve_profile_and_limits($pdo, (int)$m[1], null, $debug);
    }

    // Add formatted values for direct display
    if ($session) {
        $session['bytes_in_formatted']  = format_bytes($session['bytes_in'] ?? 0);
        $session['bytes_out_formatted'] = format_bytes($session['bytes_out'] ?? 0);
    }
    $limits['data_cap_formatted'] = ($limits['data_cap_bytes'] === null)
        ? 'Unlimited'
        : format_bytes($limits['data_cap_bytes']);

    $resp = [
        'status' => 'success',
        'params' => ['nasipaddress'=>$nasip, 'username'=>($username !== '' ? $username : null)],
        'data'   => [
            'session'    => $session,
            'profile'    => $profile,
            'profile_id' => $profileId,
            'limits'     => $limits
        ]
    ];

    // After DB steps, query Cake4 to get depleted flag using username & mac from session
    $cakeUsername = $username !== '' ? $username : ($session['username'] ?? '');
    $cakeMac      = $session['mac'] ?? '';
    if ($cakeUsername !== '' && $cakeMac !== '') {
        $cake = fetch_cake_usage($RADIUS_DESK_BASE, $cakeUsername, $cakeMac, $debug);
        $resp['data']['cake'] = [
            'query'    => ['username'=>$cakeUsername, 'mac'=>$cakeMac],
            'success'  => $cake['success'],
            'depleted' => $cake['depleted'],
            'data'     => $cake['data'],
        ];
        // Convenience: surface depleted at this level too
        $resp['data']['depleted'] = $cake['depleted'];
        if ($debug) {
            $resp['debug']['cake'] = [
                'url'   => $cake['url'],
                'http'  => $cake['http'],
                'error' => $cake['error']
            ];
        }
    }
    if ($debug) {
        $resp['debug'] = [
            'sql1'=>$sql1,'stmt1'=>$dbg1,
            'sql2'=>$sql2,'stmt2'=>$dbg2,
            'sql3'=>$dbg34['sql3'],'stmt3'=>$dbg34['stmt3'],
            'sql4'=>$dbg34['sql4'],'stmt4'=>$dbg34['stmt4']
        ];
    }

    echo json_encode($resp);
} catch (Throwable $e) {
    error_log($e);
    http_response_code(500);
    echo json_encode(['status'=>'error','message'=>$e->getMessage()]);
}