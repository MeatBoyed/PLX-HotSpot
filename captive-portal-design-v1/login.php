<?php
// --- Simple config (hardcoded) ---
$RADIUS_DESK_BASE_URL = 'https://radiusdesk.pluxnet.co.za';
//$MIKROTIK_DEFAULT_USERNAME = 'click_to_connect@dev';
//$MIKROTIK_DEFAULT_PASSWORD = 'click_to_connect';
$MIKROTIK_DEFAULT_USERNAME = 'mahmut1';
$MIKROTIK_DEFAULT_PASSWORD = '1234';
$DEFAULT_LINK_LOGIN = 'https://gateway.pluxnet.co.za/login';
// $DEFAULT_DST = 'http://neverssl.com/';
$DEFAULT_DST = 'https://hotspot.pluxnet.co.za/dashboard.php';

// Mikrotik-style params often provide link-login and dst
$link_login = $_GET['link-login'] ?? $DEFAULT_LINK_LOGIN;
// $dst = $_GET['dst'] ?? $DEFAULT_DST;
$dst =  $DEFAULT_DST;

// Helpers to resolve client IP and MAC (best-effort; ARP table if L2-adjacent)
function get_client_ip(): ?string
{
    $keys = ['HTTP_X_FORWARDED_FOR', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
    foreach ($keys as $k) {
        if (!empty($_SERVER[$k])) {
            $val = $_SERVER[$k];
            if ($k === 'HTTP_X_FORWARDED_FOR') {
                $parts = array_map('trim', explode(',', $val));
                $val = $parts[0] ?? $val;
            }
            if (filter_var($val, FILTER_VALIDATE_IP)) {
                return $val;
            }
        }
    }
    return null;
}
function try_get_mac_from_arp(?string $ip): ?string
{
    if (!$ip) return null;
    $path = '/proc/net/arp';
    if (!is_readable($path)) return null;
    $rows = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!$rows || count($rows) < 2) return null;
    for ($i = 1; $i < count($rows); $i++) {
        $cols = preg_split('/\s+/', trim($rows[$i]));
        if (count($cols) >= 4 && $cols[0] === $ip) {
            $mac = $cols[3];
            if (preg_match('/^([0-9A-Fa-f]{2}[:\-]){5}([0-9A-Fa-f]{2})$/', $mac)) {
                return strtoupper(str_replace('-', ':', $mac));
            }
        }
    }
    return null;
}
$client_ip  = get_client_ip();
$client_mac = try_get_mac_from_arp($client_ip);

// Extract username & MAC from MT request (prefer POST > GET), normalize MAC
$incoming_username = isset($_POST['username']) ? trim((string)$_POST['username']) : (isset($_GET['username']) ? trim((string)$_GET['username']) : $MIKROTIK_DEFAULT_USERNAME);
$incoming_mac_raw = isset($_POST['mac']) ? trim((string)$_POST['mac']) : (isset($_GET['mac']) ? trim((string)$_GET['mac']) : '');
$incoming_mac_norm = strtoupper(str_replace('-', ':', $incoming_mac_raw));
$incoming_mac = $incoming_mac_norm ?: (is_string($client_mac) ? $client_mac : '');

// Optionally query RadiusDesk Cake4 for depleted flag (server-side hint)
$server_depleted = null; // null = unknown
// Use hotspot API instead of Cake4. If no username from MT, default to the profile const (mahmut1).
$api_username = $incoming_username ?: $MIKROTIK_DEFAULT_USERNAME;
if ($api_username && $incoming_mac) {
    $hotspot_url = 'https://hotspot.pluxnet.co.za/api/depleted?username=' . urlencode($api_username) . '&mac=' . urlencode($incoming_mac);
    try {
        $ch = curl_init($hotspot_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 4);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
        // Optional: identify this caller
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['User-Agent: PLX-Portal/1.0']);
        $resp = curl_exec($ch);
        $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($resp !== false && $http >= 200 && $http < 300) {
            $json = json_decode($resp, true);
            if (is_array($json) && isset($json['data']) && array_key_exists('depleted', $json['data'])) {
                $server_depleted = (bool)$json['data']['depleted'];
            }
        }
    } catch (Throwable $e) {
        // leave as null on error
    }
}

// PHP handler: decide credentials based on depleted/voucher
// Is this not a POST Req, or is the one listening TO the MT's POST-Back? 
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $isDepleted = isset($_POST['depleted']) && $_POST['depleted'] === '1';
    $voucher = trim($_POST['voucher'] ?? '');
    $dstPost  = $_POST['dst'] ?? $dst;

    if ($isDepleted && $voucher !== '') {
        $username = $voucher;
        $password = $voucher;
    } else {
        $username = $MIKROTIK_DEFAULT_USERNAME;
        $password = $MIKROTIK_DEFAULT_PASSWORD;
    }

    $data = [
        'username' => $username,
        'password' => $password,
        'dst'      => $dstPost,
    ];

    // Forward credentials to hotspot gateway
    $ch = curl_init($link_login);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    $response = curl_exec($ch);
    curl_close($ch);

    // Redirect user to destination
    header("Location: $dstPost");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en" data-theme="theme-light">

<head>
    <title>PluxNet</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- The above 2 meta tags *must* come first in the <head>
      to consistently ensure proper document rendering.
      Any other head element should come *after* these tags. -->


    <!-- <meta name="theme-color" content="#ffffff">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="msapplication-config" content="assets/images/browserconfig.xml"> -->

    <!-- SEO -->
    <meta name="author" content="PluxNet">
    <meta name="description" content="PluxNet">
    <meta name="keywords" content="PluxNet">
    <!-- meta data preview image -->
    <!-- <meta property="og:image" content="assets/images/metadata-preview.jpg">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="300">
    <meta property="og:image:height" content="300"> -->

    <link rel="apple-touch-icon" sizes="180x180" href="assets/images/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/images/favicon-16x16.png">
    <link rel="manifest" href="assets/images/site.webmanifest">
    <link rel="mask-icon" href="assets/images/safari-pinned-tab.svg" color="#5bbad5">
    <link rel="shortcut icon" href="assets/images/favicon.ico" type="image/x-icon">
    <!-- <meta name="msapplication-TileColor" content="#da532c"> -->
    <meta name="theme-color" content="#5B3393">

    <!-- <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"> -->

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@100..900&display=swap" rel="stylesheet">


    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
    <link rel="stylesheet" href="assets/css/main.min.css">

    <script>
        // Expose server-derived context to the client
        window.serverUsageCtx = {
            username: <?php echo json_encode($incoming_username, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>,
            mac: <?php echo json_encode($incoming_mac, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>,
            depleted: <?php echo $server_depleted === null ? 'null' : ($server_depleted ? 'true' : 'false'); ?>,
            clientIp: <?php echo json_encode($client_ip, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>
        };
    </script>

</head>

<body>
    <main>

        <section class="logo-section">
            <div class="container">
                <a href="index.html" class="logo d-flex align-items-center">
                    <img src="assets/images/plusnet-logo.svg" alt="PluxNet logo" width="auto" height="auto">
                </a>
            </div>
        </section>

        <section class="internet-section">
            <div class="container">
                <div class="internet-claim">
                    <div class="internet-claim-wrapper text-center">
                        <span class="internet-claim-icon d-flex">
                            <img src="assets/images/wifi-icon.svg" alt="wifi icon">
                        </span>
                        <h6 class="internet-claim-title font-body-normal pnt-pt-15 pnt-pb-32">Get 1.5 GB of internet
                            free of cost, provided by pluxnet</h6>
                        <div class="form-check form-checkbox d-flex align-items-center pnt-pb-24">
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="check-1">
                                <label class="custom-control-label" for="check-1">Accept terms & conditions to
                                    continue</label>
                            </div>
                        </div>
                        <!-- Login form: rendered based on server-side depleted flag -->
                        <form id="loginForm" method="post" action="<?php echo htmlspecialchars($link_login); ?>">
                            <?php
                            // Decide behaviour: if depleted is true, ask user for credentials.
                            // If depleted is false or unknown, use default profile credentials.
                            $is_depleted = ($server_depleted === true);
                            if ($is_depleted): ?>
                                <div class="form-group pnt-pb-16">
                                    <input type="text" class="form-control" name="username" placeholder="Username" autocomplete="off" required>
                                </div>
                                <div class="form-group pnt-pb-16">
                                    <input type="password" class="form-control" name="password" placeholder="Password" autocomplete="off" required>
                                </div>
                            <?php else: ?>
                                <!-- Non-depleted: use default credentials silently -->
                                <input type="hidden" name="username" value="<?php echo htmlspecialchars($MIKROTIK_DEFAULT_USERNAME); ?>">
                                <input type="hidden" name="password" value="<?php echo htmlspecialchars($MIKROTIK_DEFAULT_PASSWORD); ?>">
                            <?php endif; ?>
                            <input type="hidden" name="dst" value="<?php echo htmlspecialchars($dst); ?>">
                            <div class="pnt-pt-16">
                                <button type="submit" class="btn btn-primary w-100"><?php echo $is_depleted ? 'Login' : 'Connect Now'; ?></button>
                            </div>
                        </form>
                        <!-- <h3 class="title-head font-body-xs pnt-pb-24">Accept terms & conditions to continue</h3> -->
                        <!-- <button type="submit" id="openVideo" class="btn btn-secondary w-100">
                            <span class="btn-icon">
                                <img src="assets/images/watch-video-icon.svg" alt="watch video">
                            </span>
                            Watch video to claim</button> -->
                        <!-- <button type="submit" class="btn btn-primary">
                            Select
                        </button> -->
                        <noscript>
                            <div class="pnt-pt-16">
                                <button type="submit" form="loginForm" class="btn btn-primary w-100">Login</button>
                            </div>
                        </noscript>
                    </div>
                </div>
            </div>
        </section>

        <section class="news-section">
            <div class="container">
                <h4 class="news-section-top d-flex align-items-center justify-content-between">
                    <span class="news-section-title font-title-medium">Latest news</span>
                    <a href="#" class="news-section-link btn-link">View all</a>
                </h4>

                <div class="swiper latest-news-slider swiper-horizontal">
                    <div class="swiper-wrapper">

                        <div class="swiper-slide">
                            <div class="news-slide-container">
                                <div class="news-slide-img">
                                    <img src="assets/images/news-img-1.png" alt="news image">
                                </div>
                                <div class="news-slide-info">
                                    <h6 class="nees-slide-title font-body-medium">Bond Market Shudders as Tax Bill
                                        Deepens Deficit Worries</h6>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="news-slide-container">
                                <div class="news-slide-img">
                                    <img src="assets/images/news-img-1.png" alt="news image">
                                </div>
                                <div class="news-slide-info">
                                    <h6 class="nees-slide-title font-body-medium">Bond Market Shudders as Tax Bill
                                        Deepens Deficit Worries</h6>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="news-slide-container">
                                <div class="news-slide-img">
                                    <img src="assets/images/news-img-1.png" alt="news image">
                                </div>
                                <div class="news-slide-info">
                                    <h6 class="nees-slide-title font-body-medium">Bond Market Shudders as Tax Bill
                                        Deepens Deficit Worries</h6>
                                </div>
                            </div>
                        </div>
                        <div class="swiper-slide">
                            <div class="news-slide-container">
                                <div class="news-slide-img">
                                    <img src="assets/images/news-img-1.png" alt="news image">
                                </div>
                                <div class="news-slide-info">
                                    <h6 class="nees-slide-title font-body-medium">Bond Market Shudders as Tax Bill
                                        Deepens Deficit Worries</h6>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="slider-navigation pagination">
                        <div class="page-item page-item-prev swiper-button-prev swiper-button-disabled">
                            <button class="btn btn-secondary page-link" aria-label="Previous slide">
                                <svg width="8" height="12" viewBox="0 0 8 12" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.5 11L1.5 6L6.5 1" stroke="#17232A" stroke-width="1.875"
                                        stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </button>
                        </div>
                        <div class="page-item page-item-next swiper-button-next">
                            <button class="btn btn-secondary page-link" aria-label="Next slide">
                                <svg width="8" height="12" viewBox="0 0 8 12" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.5 11L6.5 6L1.5 1" stroke="#17232A" stroke-width="1.875"
                                        stroke-linecap="round" stroke-linejoin="round"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <section class="add-section w-100">
            <div class="container-fluid">
                <div class="add-wrapper w-100">
                    <!-- Revive Adserver Hosted edition Asynchronous JS Tag - Static banner placement -->
                    <!-- Start: Revive Ad Tag -->
                    <ins data-revive-zoneid="20641" data-revive-id="727bec5e09208690b050ccfc6a45d384"></ins>
                    <script async src="//servedby.revive-adserver.net/asyncjs.php"></script>
                    <!-- End: Revive Ad Tag -->
                    <span class="add-close-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z"
                                stroke="white" stroke-width="1.5" stroke-linejoin="round" />
                            <path d="M14.8289 9.1709L9.17188 14.8279M9.17188 9.1709L14.8289 14.8279" stroke="white"
                                stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </span>
                </div>
            </div>
        </section>

    </main>
    <!-- main-content -->

    <div id="showVideoPopup" class="show-Video-popup">
        <button type="submit" id="showVideoPopupClose"
            class="btn popup-close d-flex align-items-center justify-content-center">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M11 21C16.523 21 21 16.523 21 11C21 5.477 16.523 1 11 1C5.477 1 1 5.477 1 11C1 16.523 5.477 21 11 21Z"
                    stroke="white" stroke-width="1.5" stroke-linejoin="round" />
                <path d="M13.8289 8.1709L8.17188 13.8279M8.17188 8.1709L13.8289 13.8279" stroke="white"
                    stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>
        <div class="popup-content-wrapper">
            <div class="video-box">
                <!-- <iframe id="showVideoVideo" height="100%" width="100%" src="https://www.youtube.com/embed/tgbNymZ7vqY"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen></iframe> -->
                <!-- Native HTML5 video element for VAST media playback -->
                <video id="vastVideo" controls playsinline preload="metadata" style="width:100%; max-height:60vh; background:#000;">
                    Sorry, your browser doesn't support embedded videos.
                </video>
                <div id="vastStatus" class="font-body-normal" style="margin-top:8px; color:#6A7780; font-size:12px;"></div>
            </div>
        </div>
    </div>

    <script src="assets/js/jquery/jquery.min.js"></script>
    <!-- <script defer src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script> -->
    <script defer src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
    <script src="assets/js/custom/slider.js"></script>
    <script src="assets/js/custom/video.js"></script>
    <script>
        // Simple hardcoded config used on the client
        const appConfig = {
            mikrotik: {
                radiusDeskBaseUrl: 'https://radiusdesk.pluxnet.co.za',
            },
            mac: (window.serverUsageCtx && window.serverUsageCtx.mac) || '',
            username: (window.serverUsageCtx && window.serverUsageCtx.username) || <?php echo json_encode($MIKROTIK_DEFAULT_USERNAME); ?>,
            clientIp: (window.serverUsageCtx && window.serverUsageCtx.clientIp) || ''
        };
        try {
            console.debug('serverUsageCtx:', window.serverUsageCtx, 'appConfig:', appConfig);
        } catch (e) {}

        $(function() {
            var isDepleted = (window.serverUsageCtx && typeof window.serverUsageCtx.depleted === 'boolean') ? window.serverUsageCtx.depleted : false;
            var submitted = false;

            // Default creds for non-depleted flow (must match server config)
            const loginDefaults = {
                username: 'mahmut1',
                password: '1234'
            };

            function updateUI() {
                if (isDepleted) {
                    $('#voucher-group').show();
                    $('#depleted').val('1');
                } else {
                    $('#voucher-group').hide();
                    $('#depleted').val('0');
                }
            }

            async function ensureIdentity() {
                // If we already have username and MAC, nothing to do
                if (appConfig.username && appConfig.mac) return;
                // Try derive via hotspot API using client IP (will auto-detect)
                try {
                    const usageUrl = `https://hotspot.pluxnet.co.za/api/usage`;
                    const r = await fetch(usageUrl, {
                        credentials: 'omit',
                        cache: 'no-store',
                        mode: 'cors'
                    });
                    const text = await r.text();
                    if (!r.ok) return;
                    const payload = JSON.parse(text);
                    if (!payload || payload.status !== 'success') return;
                    const session = payload.data && payload.data.session ? payload.data.session : {};
                    const sUser = session && (session.username || session.user_name || session.name || session.UserName || session.USERNAME);
                    const sMac = session && (session.callingstationid || session.calling_station_id || session.mac || session.mac_address || session.MAC);
                    if (!appConfig.username && sUser) appConfig.username = String(sUser);
                    if (!appConfig.mac && sMac) appConfig.mac = String(sMac).replace(/-/g, ':').toUpperCase();
                    try {
                        console.debug('Resolved identity from hotspot API', {
                            username: appConfig.username,
                            mac: appConfig.mac
                        });
                    } catch (e) {}
                } catch (e) {
                    // ignore
                }
            }

            async function fetchUsage() {
                try {
                    await ensureIdentity();
                    if (!appConfig.mac || !appConfig.username) {
                        updateUI();
                        return;
                    }
                    const url = new URL(`${appConfig.mikrotik.radiusDeskBaseUrl}/cake4/rd_cake/radaccts/get-usage.json`);
                    url.searchParams.set('mac', String(appConfig.mac).replace(/-/g, ':').toUpperCase());
                    url.searchParams.set('username', appConfig.username);
                    try {
                        console.debug('Fetching Cake4 usage:', url.toString());
                    } catch (e) {}
                    const res = await fetch(url.toString(), {
                        credentials: 'omit',
                        mode: 'cors',
                        cache: 'no-store'
                    });
                    const resp = await res.json();
                    try {
                        console.debug('Cake4 response:', resp);
                    } catch (e) {}
                    if (resp && resp.success && resp.data && resp.data.depleted === true) {
                        isDepleted = true;
                    } else {
                        isDepleted = false;
                    }
                    updateUI();
                } catch (e) {
                    try {
                        console.warn('Usage fetch failed', e);
                    } catch (x) {}
                    updateUI();
                }
            }

            // Initialize UI based on server hint, then confirm with client fetch
            updateUI();
            fetchUsage();

            function termsAccepted() {
                return $('#check-1').is(':checked');
            }

            function hasVoucher() {
                return ($('#voucher').val() || '').length > 0;
            }

            // Minimal VAST2 handler: fetch VAST XML via local proxy, pick an MP4 MediaFile, play it
            let vastLoaded = false;
            const VAST_URL = 'https://servedby.revive-adserver.net/fc.php?script=apVideo:vast2&zoneid=24615';
            const vastVideoEl = document.getElementById('vastVideo');
            const vastStatusEl = document.getElementById('vastStatus');

            function setVastStatus(msg) {
                if (vastStatusEl) vastStatusEl.textContent = msg || '';
            }

            async function fetchVastXml() {
                const proxied = `vast-proxy.php?url=${encodeURIComponent(VAST_URL)}`;
                const res = await fetch(proxied, {
                    credentials: 'omit',
                    cache: 'no-store'
                });
                if (!res.ok) throw new Error(`VAST fetch failed: ${res.status}`);
                return await res.text();
            }

            function parseVastForMp4(vastXmlString) {
                const parser = new DOMParser();
                const xml = parser.parseFromString(vastXmlString, 'application/xml');
                const errorNode = xml.querySelector('parsererror');
                if (errorNode) throw new Error('Invalid VAST XML');

                // Collect impression trackers
                const impressions = Array.from(xml.querySelectorAll('Impression'))
                    .map(n => n.textContent?.trim())
                    .filter(Boolean);

                // Collect linear tracking URLs
                const tracking = {};
                Array.from(xml.querySelectorAll('Tracking')).forEach(t => {
                    const ev = t.getAttribute('event') || 'other';
                    const url = t.textContent?.trim();
                    if (!url) return;
                    if (!tracking[ev]) tracking[ev] = [];
                    tracking[ev].push(url);
                });

                // Pick first MP4 MediaFile
                const mediaFiles = Array.from(xml.querySelectorAll('MediaFile'));
                const mp4 = mediaFiles.find(m => (m.getAttribute('type') || '').toLowerCase().includes('mp4'));
                const src = mp4 ? (mp4.textContent || '').trim() : '';
                if (!src) throw new Error('No MP4 MediaFile found in VAST');

                return {
                    src,
                    impressions,
                    tracking
                };
            }

            function pingUrls(urls = []) {
                urls.forEach(u => {
                    try {
                        fetch(u, {
                            mode: 'no-cors'
                        });
                    } catch {}
                });
            }

            async function loadAndPlayVastOnce() {
                if (vastLoaded) return;
                vastLoaded = true;
                try {
                    setVastStatus('Loading ad…');
                    const xml = await fetchVastXml();
                    const {
                        src,
                        impressions,
                        tracking
                    } = parseVastForMp4(xml);

                    // Fire impressions
                    pingUrls(impressions);

                    // Wire basic tracking
                    if (vastVideoEl) {
                        vastVideoEl.src = src;
                        vastVideoEl.onplay = () => {
                            pingUrls(tracking['start']);
                        };
                        vastVideoEl.onended = () => {
                            pingUrls(tracking['complete']);
                        };
                        vastVideoEl.onerror = () => {
                            setVastStatus('Ad failed to play');
                        };
                        vastVideoEl.load();
                        // slight delay to ensure element is visible
                        setTimeout(() => vastVideoEl.play().catch(() => setVastStatus('Click to play ad')), 150);
                    }
                    setVastStatus('');
                } catch (e) {
                    console.error(e);
                    setVastStatus('Unable to load ad');
                }
            }

            $('#openVideo').on('click', function(e) {
                if (!termsAccepted()) {
                    e.preventDefault();
                    alert('Please accept terms & conditions to continue.');
                    return false;
                }
                if (isDepleted && !hasVoucher()) {
                    e.preventDefault();
                    alert('Please enter your voucher code.');
                    $('#voucher').focus();
                    return false;
                }
                // video.js shows popup; start VAST load after popup is shown
                loadAndPlayVastOnce();
            });

            $('#showVideoPopupClose').on('click', function() {
                if (submitted) return;
                if (!termsAccepted()) return;
                if (isDepleted && !hasVoucher()) {
                    $('#voucher').focus();
                    return;
                }
                // Set credentials based on depletion/voucher before submit
                const voucherVal = ($('#voucher').val() || '').trim();
                const userVal = isDepleted ? voucherVal : loginDefaults.username;
                const passVal = isDepleted ? voucherVal : loginDefaults.password;
                $('#username').val(userVal);
                $('#password').val(passVal);
                submitted = true;
                $('#loginForm').trigger('submit');
            });
        });
    </script>
</body>

</html>