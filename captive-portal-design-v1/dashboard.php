<?php

function h($v)
{
    return htmlspecialchars((string)$v ?? '', ENT_QUOTES, 'UTF-8');
}

// Get client IP (best-effort; X-Forwarded-For if behind proxy)
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

// Try resolve MAC from ARP table if server is L2-adjacent to client
function try_get_mac_from_arp(?string $ip): ?string
{
    if (!$ip) return null;
    $path = '/proc/net/arp';
    if (!is_readable($path)) return null;
    $rows = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if (!$rows || count($rows) < 2) return null;
    // Skip header
    for ($i = 1; $i < count($rows); $i++) {
        $cols = preg_split('/\s+/', trim($rows[$i]));
        // Expected columns: IP address, HW type, Flags, HW address, Mask, Device
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

// Optionally pick up a default username from query (?username=...)
$initial_username = isset($_GET['username']) ? (string)$_GET['username'] : '';

// Server-side fetch of usage from hotspot API for initial render
$usage_used_formatted = '—';
$usage_limit_formatted = 'Loading…';
$usage_error = '';
$user_profile = "Free Plan";
$qs = [];
if ($initial_username !== '') $qs['username'] = $initial_username;
// Call API via public endpoint since API access is now opened - API will auto-detect client IP
$usage_url = 'https://hotspot.pluxnet.co.za/api/usage' . (!empty($qs) ? '?' . http_build_query($qs) : '');

// Try to fetch usage data - API will auto-detect client IP from request headers
try {
    $ch = curl_init($usage_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 4);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['User-Agent: PLX-Dashboard/1.0']);
    $resp = curl_exec($ch);
    $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($resp !== false && $http >= 200 && $http < 300) {
        $json = json_decode($resp, true);
        if (is_array($json) && isset($json['status']) && $json['status'] === 'success') {
            $session = $json['data']['session'] ?? null;
            $limits = $json['data']['limits'] ?? null;
            $bytesOut = isset($session['bytes_out']) ? (int)$session['bytes_out'] : null;
            $capBytes = isset($limits['data_cap_bytes']) && $limits['data_cap_bytes'] !== null ? (int)$limits['data_cap_bytes'] : null;
            // Format helpers (simple)
            $fmt = function (?int $bytes): string {
                if ($bytes === null) return '-';
                $units = ['B', 'KB', 'MB', 'GB', 'TB'];
                $i = 0;
                $val = (float)$bytes;
                while ($val >= 1024 && $i < count($units) - 1) {
                    $val /= 1024;
                    $i++;
                }
                return ($i === 0 ? (string)round($val) : number_format($val, 2)) . ' ' . $units[$i];
            };
            $usage_used_formatted = $fmt($bytesOut);
            $usage_limit_formatted = ($capBytes === null ? 'Unlimited' : $fmt($capBytes));
            // its in json.data.profile.name
            $user_profile = $json['data']['profile']['name'] ?? 'asdkajsd';
        } else {
            $usage_error = 'API returned a non-success status';
        }
    } else {
        $usage_error = 'API unreachable';
    }
} catch (Throwable $e) {
    $usage_error = 'Failed to query usage';
}

?>
<!DOCTYPE html>
<html lang="en" data-theme="theme-light">

<head>
    <title>PluxNet</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta name="author" content="PluxNet">
    <meta name="description" content="PluxNet">
    <meta name="keywords" content="PluxNet">

    <link rel="apple-touch-icon" sizes="180x180" href="assets/images/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/images/favicon-16x16.png">
    <link rel="manifest" href="assets/images/site.webmanifest">
    <link rel="mask-icon" href="assets/images/safari-pinned-tab.svg" color="#5bbad5">
    <link rel="shortcut icon" href="assets/images/favicon.ico" type="image/x-icon">
    <meta name="theme-color" content="#5B3393">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@100..900&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="assets/css/main.min.css">

    <style>
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 12px;
        }

        .status-item {
            background: var(--bg-secondary, #F7F8FA);
            border-radius: 10px;
            padding: 12px 14px;
        }

        .status-kv {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .status-kv .k {
            color: #6A7780;
            font-size: 14px;
        }

        .status-kv .v {
            color: #17232A;
            font-weight: 600;
            font-size: 14px;
        }

        .error {
            color: #B00020;
            padding: 8px 0;
        }
    </style>
</head>

<body>

    <main>
        <section class="welcome-section">
            <div class="container-fluid">
                <div class="welcome-container bg-gradient">
                    <div class="container">
                        <a href="index.php" class="logo d-flex align-items-center">
                            <img src="assets/images/plusnet-logo-white.svg" alt="PluxNet logo" width="auto" height="auto">
                        </a>
                        <h3 class="welcome-title font-title-large">Welcome 👋🏼</h3>
                        <p class="welcome-desc">
                            View your connection details below
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section class="plans-section">
            <div class="plans-section-wrapper container-fluid">
                <div class="container plans-block-conatiner">
                    <div class="plans-block">
                        <h4 class="plans-section-title font-body-normal font-color-tertiary">Current plan</h4>
                        <div class="plan-info bg-secondary">
                            <div class="plan-list d-flex align-items-center pnt-column-gap-20 pnt-pt-8">
                                <div class="plan-item">
                                    <h3 class="plan-item-title">Plan</h3>
                                    <h5 class="plan-item-name"> <?php echo h($user_profile); ?></h5>
                                </div>
                                <div class="plan-item">
                                    <h3 class="plan-item-title">Data used</h3>
                                    <h5 class="plan-item-name"><span id="data-used-value"><?php echo h($usage_used_formatted); ?></span>/<span class="plan-item-text" id="data-limit-value"><?php echo h($usage_limit_formatted); ?></span></h5>
                                </div>
                            </div>
                            <div class="error" id="plan-error" style="<?php echo $usage_error ? '' : 'display:none;'; ?> margin-top:8px;"><?php echo h($usage_error); ?></div>
                            <div class="font-body-normal" id="poll-status" style="display:none; margin-top:6px; color:#6A7780; font-size:12px;">
                                Next update in <span id="poll-countdown">--</span>s
                            </div>
                            <!-- Depleted alert (non-actionable) -->
                            <div class="plan-info bg-secondary" id="depleted-alert" style="display:none; border-left:4px solid #B00020; margin-top:12px;">
                                <div class="status-kv">
                                    <div class="k">Account status</div>
                                    <div class="v" style="color:#B00020;">Depleted</div>
                                </div>
                                <div class="font-body-normal" style="margin-top:6px;">
                                    You have reached your data cap. Please top up to continue browsing.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        <section class="add-section w-100">
            <div class="container-fluid">
                <div class="add-wrapper w-100">
                    <!-- <img src="assets/images/add-img-2.png" class="img-fluid" alt="add image"> -->
                    <!-- Revive Adserver Hosted edition Asynchronous JS Tag - Static banner placement -->
                    <!-- Start: Revive Ad Tag -->
                    <ins data-revive-zoneid="20641" data-revive-id="727bec5e09208690b050ccfc6a45d384"></ins>
                    <script async src="//servedby.revive-adserver.net/asyncjs.php"></script>
                    <!-- End: Revive Ad Tag -->
                    <span class="add-close-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z" stroke="white" stroke-width="1.5" stroke-linejoin="round" />
                            <path d="M14.8289 9.1709L9.17188 14.8279M9.17188 9.1709L14.8289 14.8279" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </span>
                </div>
            </div>
        </section>
    </main>
    <!-- main-content -->

    <script src="assets/js/jquery/jquery.min.js"></script>
    <script src="assets/js/custom/validation.js"></script>
    <script>
        (function() {
            const POLL_INTERVAL_SECONDS = 15;
            const usedEl = document.getElementById('data-used-value');
            const limitEl = document.getElementById('data-limit-value');
            const planErr = document.getElementById('plan-error');
            const pollStatusEl = document.getElementById('poll-status');
            const pollCountdownEl = document.getElementById('poll-countdown');
            const depletedAlertEl = document.getElementById('depleted-alert');

            const usageUrl = <?php echo json_encode(isset($usage_url) ? $usage_url : ''); ?>;

            function showPlanError(msg) {
                if (planErr) {
                    planErr.textContent = msg;
                    planErr.style.display = 'block';
                }
            }

            function formatBytes(bytes) {
                if (bytes === null || bytes === undefined || isNaN(bytes)) return '-';
                const units = ['B', 'KB', 'MB', 'GB', 'TB'];
                let i = 0;
                let val = Number(bytes);
                while (val >= 1024 && i < units.length - 1) {
                    val /= 1024;
                    i++;
                }
                return (i === 0 ? Math.round(val) : val.toFixed(2)) + ' ' + units[i];
            }

            async function fetchAndRender() {
                if (!usageUrl) {
                    showPlanError('Missing usage API URL');
                    return;
                }
                try {
                    const r = await fetch(usageUrl, {
                        credentials: 'omit',
                        cache: 'no-store'
                    });
                    const text = await r.text();
                    if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + text.slice(0, 200));
                    const payload = JSON.parse(text);
                    if (!payload || payload.status !== 'success') throw new Error('API returned non-success');
                    const session = payload.data && payload.data.session ? payload.data.session : {};
                    const limits = payload.data && payload.data.limits ? payload.data.limits : {};
                    const bytesOut = (session && session.bytes_out != null) ? Number(session.bytes_out) : null;
                    const capBytes = (limits && limits.data_cap_bytes != null) ? Number(limits.data_cap_bytes) : null;
                    const usedFormatted = formatBytes(bytesOut);
                    const limitFormatted = (capBytes === null ? 'Unlimited' : formatBytes(capBytes));
                    if (planErr) planErr.style.display = 'none';
                    if (usedEl) usedEl.textContent = usedFormatted;
                    if (limitEl) limitEl.textContent = limitFormatted;
                    if (depletedAlertEl) depletedAlertEl.style.display = 'none';
                } catch (e) {
                    if (limitEl) limitEl.textContent = 'Unavailable';
                    showPlanError(e && e.message ? e.message : 'Failed to fetch usage');
                    if (depletedAlertEl) depletedAlertEl.style.display = 'none';
                }
            }

            let countdown = POLL_INTERVAL_SECONDS;

            function resetCountdown() {
                countdown = POLL_INTERVAL_SECONDS;
            }

            function tickCountdown() {
                if (!pollStatusEl || !pollCountdownEl) return;
                pollStatusEl.style.display = 'block';
                pollCountdownEl.textContent = String(countdown);
                countdown = Math.max(0, countdown - 1);
            }

            fetchAndRender();
            resetCountdown();
            tickCountdown();
            setInterval(tickCountdown, 1000);
            setInterval(async () => {
                await fetchAndRender();
                resetCountdown();
            }, POLL_INTERVAL_SECONDS * 1000);
        })();
    </script>
</body>

</html>