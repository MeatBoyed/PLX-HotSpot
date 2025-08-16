<?php
// --- Simple config (hardcoded) ---
$RADIUS_DESK_BASE_URL = 'https://radiusdesk.pluxnet.co.za';
$MIKROTIK_DEFAULT_USERNAME = 'click_to_connect@dev';
$MIKROTIK_DEFAULT_PASSWORD = 'click_to_connect';
$DEFAULT_LINK_LOGIN = 'https://gateway.pluxnet.co.za/login';
// $DEFAULT_DST = 'http://neverssl.com/';
$DEFAULT_DST = 'https://hotspot.pluxnet.co.za/dashboard.php';

// Mikrotik-style params often provide link-login and dst
$link_login = $_GET['link-login'] ?? $DEFAULT_LINK_LOGIN;
// $dst = $_GET['dst'] ?? $DEFAULT_DST;
$dst =  $DEFAULT_DST;

// Probe endpoint: when called via AJAX, post to the gateway from the server to
// infer success/failure and return a small JSON payload with the outcome.
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['mode']) && $_POST['mode'] === 'probe_login') {
    header('Content-Type: application/json');

    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $dstPost  = $_POST['dst'] ?? $dst;

    if ($username === '' || $password === '') {
        echo json_encode(['ok' => false, 'status' => 400, 'error' => 'Missing credentials']);
        exit;
    }

    $data = [
        'username' => $username,
        'password' => $password,
        'dst'      => $dstPost,
    ];

    $ch = curl_init($link_login);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_HEADER, true); // capture headers + body
    // Do not follow location; we just want to inspect the response
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);

    $raw = curl_exec($ch);
    $errno = curl_errno($ch);
    $err  = curl_error($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE) ?: 0;
    curl_close($ch);

    $headers = substr($raw ?: '', 0, $headerSize);
    $body    = substr($raw ?: '', $headerSize);

    // Extract Location header if present
    $location = null;
    if ($headers && preg_match('/\r?\nLocation:\s*(.*?)\r?\n/i', $headers."\n", $m)) {
        $location = trim($m[1]);
    }

    // Heuristics for success: HTTP 30x with Location header (typical Mikrotik redirect)
    $success = false;
    if ($errno === 0) {
        if (in_array($status, [301,302,303,307,308], true) && $location) {
            $success = true;
        } else {
            // Fallback: look for common success strings in body
            $lower = strtolower(strip_tags($body));
            if (str_contains($lower, 'login ok') || str_contains($lower, 'you are logged in')) {
                $success = true;
            }
        }
    }

    if ($success) {
        echo json_encode(['ok' => true, 'status' => $status, 'location' => $location]);
    } else {
        // Construct a short error snippet
        $snippet = '';
        if ($err) {
            $snippet = $err;
        } else {
            $text = trim(preg_replace('/\s+/', ' ', strip_tags($body)));
            $snippet = substr($text, 0, 300);
        }
        echo json_encode([
            'ok' => false,
            'status' => $status ?: 0,
            'error' => $snippet ?: 'Unknown error',
        ]);
    }
    exit;
}

// PHP handler: decide credentials based on depleted/voucher
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
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
    $raw = curl_exec($ch);
    $errno = curl_errno($ch);
    $err  = curl_error($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE) ?: 0;
    curl_close($ch);

    $headers = substr($raw ?: '', 0, $headerSize);
    $body    = substr($raw ?: '', $headerSize);
    $location = null;
    if ($headers && preg_match('/\r?\nLocation:\s*(.*?)\r?\n/i', $headers."\n", $m)) {
        $location = trim($m[1]);
    }
    $success = ($errno === 0) && ((in_array($status, [301,302,303,307,308], true) && $location) || str_contains(strtolower(strip_tags($body)), 'login ok'));

    // Render a tiny page that shows an alert and then redirects (or not)
    ?><!DOCTYPE html><html><head><meta charset="utf-8"><title>Login Result</title></head><body>
    <script>
    (function(){
        <?php if ($success): ?>
        alert('Login Successful redirecting to dashbaord');
        window.location.replace(<?php echo json_encode($dstPost); ?>);
        <?php else: ?>
        alert('Login failed, error: ' + <?php
            $snippet = $err ?: substr(trim(preg_replace('/\s+/', ' ', strip_tags($body))), 0, 300);
            echo json_encode($snippet ?: 'Unknown error');
        ?>);
        // Stay on the page so the user can try again
        window.location.replace(<?php echo json_encode($_SERVER['PHP_SELF']); ?>);
        <?php endif; ?>
    })();
    </script>
    </body></html><?php
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
                        <!-- Login form (auto-submitted after video if terms accepted) -->
                        <form id="loginForm" method="post" action="https://gateway.pluxnet.co.za/login.html">
                            <!-- Shown only when usage is depleted -->
                            <div id="voucher-group" class="form-group pnt-pb-16" style="display:none;">
                                <input type="text" class="form-control" name="voucher" id="voucher" placeholder="Enter Voucher Code" autocomplete="off">
                            </div>
                            <!-- Credentials will be set just-in-time before submit -->
                            <input type="hidden" name="username" id="username" value="">
                            <input type="hidden" name="password" id="password" value="">
                            <!-- <input type="hidden" name="depleted" id="depleted" value="0"> -->
                            <input type="hidden" name="dst" value="<?php echo htmlspecialchars($dst); ?>">
                        </form>
                        <!-- <h3 class="title-head font-body-xs pnt-pb-24">Accept terms & conditions to continue</h3> -->
                        <button type="submit" id="openVideo" class="btn btn-secondary w-100">
                            <span class="btn-icon">
                                <img src="assets/images/watch-video-icon.svg" alt="watch video">
                            </span>
                            Watch video to claim</button>
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
                    <img src="assets/images/add-img-1.png" class="img-fluid" alt="add image">
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
                <iframe id="showVideoVideo" height="100%" width="100%" src="https://www.youtube.com/embed/tgbNymZ7vqY"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen></iframe>
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
                mac: '00:11:22:33:44:55',       // TODO: replace with real MAC if available
                username: 'click_to_connect@dev' // Username to check usage for
            };

            $(function () {
                var isDepleted = false;
                var submitted = false;

                // Default creds for non-depleted flow (must match server config)
                const loginDefaults = {
                    username: 'click_to_connect@dev',
                    password: 'click_to_connect'
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

                function fetchUsage() {
                    try {
                        const url = new URL(`${appConfig.mikrotik.radiusDeskBaseUrl}/cake4/rd_cake/radaccts/get-usage.json`);
                        url.searchParams.set('mac', appConfig.mac);
                        url.searchParams.set('username', appConfig.username);
                        fetch(url.toString(), { credentials: 'omit' })
                            .then(r => r.json())
                            .then((resp) => {
                                // Expecting { success: boolean, data?: { depleted: boolean } }
                                if (resp && resp.success && resp.data && resp.data.depleted === true) {
                                    isDepleted = true;
                                } else {
                                    isDepleted = false;
                                }
                                updateUI();
                            })
                            .catch(() => { isDepleted = false; updateUI(); });
                    } catch (e) {
                        isDepleted = false;
                        updateUI();
                    }
                }

                fetchUsage();

                function termsAccepted() { return $('#check-1').is(':checked'); }
                function hasVoucher() { return ($('#voucher').val() || '').length > 0; }

                $('#openVideo').on('click', function (e) {
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
                    // video.js shows popup
                });

                $('#showVideoPopupClose').on('click', function () {
                    if (submitted) return;
                    if (!termsAccepted()) return;
                    if (isDepleted && !hasVoucher()) { $('#voucher').focus(); return; }
                    // Set credentials based on depletion/voucher before submit
                    const voucherVal = ($('#voucher').val() || '').trim();
                    const userVal = isDepleted ? voucherVal : loginDefaults.username;
                    const passVal = isDepleted ? voucherVal : loginDefaults.password;
                    $('#username').val(userVal);
                    $('#password').val(passVal);
                    // Probe first on the server to detect clear success/failure and alert accordingly
                    try {
                        const formData = new FormData();
                        formData.append('mode', 'probe_login');
                        formData.append('username', userVal);
                        formData.append('password', passVal);
                        formData.append('dst', $('input[name="dst"]').val() || '');
                        fetch(window.location.href, { method: 'POST', body: formData, credentials: 'same-origin' })
                            .then(r => r.json()).then(resp => {
                                if (resp && resp.ok) {
                                    alert('Login Successful redirecting to dashbaord');
                                    submitted = true;
                                    $('#loginForm').trigger('submit');
                                } else {
                                    const err = (resp && (resp.error || resp.status)) ? (resp.error || ('HTTP ' + resp.status)) : 'Unknown error';
                                    alert('Login failed, error: ' + err);
                                }
                            }).catch(e => {
                                alert('Login failed, error: ' + (e && e.message ? e.message : 'Network error'));
                            });
                    } catch (e) {
                        alert('Login failed, error: ' + (e && e.message ? e.message : 'Unexpected error'));
                    }
                });
            });
        </script>
</body>

</html>