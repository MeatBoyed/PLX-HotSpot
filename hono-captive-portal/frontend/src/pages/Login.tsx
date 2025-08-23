
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Optional interface if server injects context
interface ServerUsageCtx {
    username?: string;
    mac?: string;
    clientIp?: string | null;
}

declare global {
    interface Window {
        serverUsageCtx?: ServerUsageCtx;
    }
}

export default function LoginPage() {
    // Defaults scoped to component per request
    const DEFAULTS = {
        LINK_LOGIN: 'https://gateway.pluxnet.co.za/login',
        DST: 'https://hotspot.pluxnet.co.za/dashboard.php',
        USERNAME: 'click_to_connect',
        PASSWORD: 'click_to_connect'
    } as const;

    const serverCtx = (typeof window !== 'undefined' ? window.serverUsageCtx : undefined) || {};

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const linkLogin = getQueryParam('link-login') || DEFAULTS.LINK_LOGIN;
    const dst = getQueryParam('dst') || DEFAULTS.DST;

    const usernameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);

    useEffect(() => {
        try {
            // eslint-disable-next-line no-console
            console.debug('serverUsageCtx', serverCtx);
        } catch { }
    }, [serverCtx]);

    const applyCredentials = useCallback(() => {
        if (!usernameRef.current || !passwordRef.current) return;
        usernameRef.current.value = DEFAULTS.USERNAME;
        passwordRef.current.value = DEFAULTS.PASSWORD;
    }, [DEFAULTS]);

    const onSubmit = useCallback<React.FormEventHandler<HTMLFormElement>>(
        (e) => {
            if (submitting) return;
            if (!termsAccepted) {
                e.preventDefault();
                alert('Please accept terms & conditions to continue.');
                return;
            }
            applyCredentials();
            setSubmitting(true);
        },
        [applyCredentials, submitting, termsAccepted]
    );

    return (
        <>
            <main>
                <section className="logo-section">
                    <div className="container">
                        <a href="/" className="logo d-flex align-items-center">
                            <img src="/assets/images/plusnet-logo.svg" alt="PluxNet logo" />
                        </a>
                    </div>
                </section>

                <section className="internet-section">
                    <div className="container">
                        <div className="internet-claim">
                            <div className="internet-claim-wrapper text-center">
                                <span className="internet-claim-icon d-flex">
                                    <img src="/assets/images/wifi-icon.svg" alt="wifi icon" />
                                </span>
                                <h6 className="internet-claim-title font-body-normal pnt-pt-15 pnt-pb-32">
                                    Get 1.5 GB of internet free of cost, provided by pluxnet
                                </h6>
                                <div className="form-check form-checkbox d-flex align-items-center pnt-pb-24">
                                    <div className="custom-control custom-checkbox">
                                        <input
                                            type="checkbox"
                                            className="custom-control-input"
                                            id="check-1"
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                        />
                                        <label className="custom-control-label" htmlFor="check-1">
                                            Accept terms & conditions to continue
                                        </label>
                                    </div>
                                </div>
                                <form
                                    id="loginForm"
                                    ref={formRef}
                                    method="post"
                                    action={linkLogin}
                                    onSubmit={onSubmit}
                                >
                                    <input ref={usernameRef} type="hidden" name="username" defaultValue="" />
                                    <input ref={passwordRef} type="hidden" name="password" defaultValue="" />
                                    <input type="hidden" name="dst" value={dst} />
                                    <div className="pnt-pt-16">
                                        <button
                                            type="submit"
                                            className="btn btn-primary w-100"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Submitting…' : 'Connect Now'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="news-section">
                    <div className="container">
                        <h4 className="news-section-top d-flex align-items-center justify-content-between">
                            <span className="news-section-title font-title-medium">Latest news</span>
                            <a href="#" className="news-section-link btn-link">View all</a>
                        </h4>
                        <div className="swiper latest-news-slider swiper-horizontal">
                            <div className="swiper-wrapper">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div className="swiper-slide" key={i}>
                                        <div className="news-slide-container">
                                            <div className="news-slide-img">
                                                <img src="/assets/images/news-img-1.png" alt="news" />
                                            </div>
                                            <div className="news-slide-info">
                                                <h6 className="nees-slide-title font-body-medium">
                                                    Bond Market Shudders as Tax Bill Deepens Deficit Worries
                                                </h6>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="slider-navigation pagination">
                                <div className="page-item page-item-prev swiper-button-prev swiper-button-disabled">
                                    <button className="btn btn-secondary page-link" aria-label="Previous slide">
                                        <svg width={8} height={12} viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6.5 11L1.5 6L6.5 1"
                                                stroke="#17232A"
                                                strokeWidth="1.875"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <div className="page-item page-item-next swiper-button-next">
                                    <button className="btn btn-secondary page-link" aria-label="Next slide">
                                        <svg width={8} height={12} viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M1.5 11L6.5 6L1.5 1"
                                                stroke="#17232A"
                                                strokeWidth="1.875"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="add-section w-100">
                    <div className="container-fluid">
                        <div className="add-wrapper w-100">
                            <img src="/assets/images/add-img-1.png" className="img-fluid" alt="ad" />
                            <span className="add-close-icon">
                                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M14.8289 9.1709L9.17188 14.8279M9.17188 9.1709L14.8289 14.8279"
                                        stroke="white"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </span>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}