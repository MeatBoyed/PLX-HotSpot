import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main>
        <section class="welcome-section">
            <div class="container-fluid">
                <div class="welcome-container bg-gradient">
                    <div class="container">
                    <a href="index.html" class="logo d-flex align-items-center">
                        <img src="assets/images/plusnet-logo-white.svg" alt="PluxNet logo" width="auto" height="auto" />
                    </a>
                    <h3 class="welcome-title font-title-large">Welcome 👋🏼</h3>
                    <p class="welcome-desc">View your connection details below</p>
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
                        <h5 class="warning-text font-title-small">You’re out of internet!</h5>
                        <p class="plan-desc font-body-xs font-color-primary pnt-pt-4">For uninterrupted internet usage, use your voucher code below or select a top up plan.</p>
                    
                        <div class="plan-list d-flex align-items-center pnt-column-gap-20">
                            <div class="plan-item">
                                <h3 class="plan-item-title">Plan</h3>
                                <h5 class="plan-item-name">Free plan</h5>
                            </div>
                            <div class="plan-item">
                                <h3 class="plan-item-title">Data used</h3>
                                <h5 class="plan-item-name">1.41 GB/<span class="plan-item-text">2GB</span></h5>
                            </div>
                        </div>
                        <div class="voucher-block">
                            <h5 class="voucher-title font-title-xs pnt-pb-12">Apply voucher</h5>
                            <div class="form-group d-flex align-items-center justify-content-between">
                                <input type="text" id="voucherCode" class="form-control" placeholder="Enter voucher code" />
                                <button type="button" class="btn btn-link apply-btn" onclick="validateVoucher()">
                                Apply
                                </button>
                            </div>
                            <div id="error-msg" class="errror-msg">This voucher is expired</div>
                        </div>
                        </div>
                </div>
                <div class="plans-block">
                    <h4 class="plans-section-title font-body-normal font-color-tertiary">Plans</h4>
                    <div class="plan-price-list  d-flex align-items-center">
                        <div class="plan-price-item bg-secondary">
                            <div class="badge">Mini</div>
                            <h5 class="plan-price">$8.00<span class="plan-price-text">/month</span></h5>
                            <div class="plan-detail d-flex">
                                <h6 class="plan-detail-info">50 Hrs</h6>
                                <h6 class="plan-detail-info">2GB</h6>
                            </div>
                            <button type="submit"class="btn btn-primary w-100 pnt-mt-8">Select</button>
                        </div>
                        <div class="plan-price-item bg-secondary">
                            <div class="badge">Mega</div>
                            <h5 class="plan-price">$16.00<span class="plan-price-text">/month</span></h5>
                            <div class="plan-detail d-flex">
                                <h6 class="plan-detail-info">200 Hrs</h6>
                                <h6 class="plan-detail-info">5GB</h6>
                            </div>
                            <button type="submit"class="btn btn-primary w-100 pnt-mt-8">Select</button>
                        </div>
                    </div>

                </div>
            </div>
            </div>
        </section>

        <section className="add-section w-100">
            <div className="container-fluid">
                <div className="add-wrapper w-100">
                    {/* <!-- Revive Adserver Hosted edition Asynchronous JS Tag - Static banner placement -->
                    <!-- Start: Revive Ad Tag --> */}
                    <ins data-revive-zoneid="20641" data-revive-id="727bec5e09208690b050ccfc6a45d384"></ins>
                    <script async src="//servedby.revive-adserver.net/asyncjs.php"></script>
                    {/* <!-- End: Revive Ad Tag --> */}
                    <span className="add-close-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z"
                                stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                            <path d="M14.8289 9.1709L9.17188 14.8279M9.17188 9.1709L14.8289 14.8279" stroke="white"
                                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </div>
            </div>
        </section>
    </main>
  )
}
