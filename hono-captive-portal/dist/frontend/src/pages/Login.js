import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "hono/jsx/jsx-runtime";
import React, { useCallback, useEffect, useRef, useState } from 'react';
export default function LoginPage() {
    // Defaults scoped to component per request
    const DEFAULTS = {
        LINK_LOGIN: 'https://gateway.pluxnet.co.za/login',
        DST: 'https://hotspot.pluxnet.co.za/dashboard.php',
        USERNAME: 'click_to_connect',
        PASSWORD: 'click_to_connect'
    };
    const serverCtx = (typeof window !== 'undefined' ? window.serverUsageCtx : undefined) || {};
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const linkLogin = getQueryParam('link-login') || DEFAULTS.LINK_LOGIN;
    const dst = getQueryParam('dst') || DEFAULTS.DST;
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const formRef = useRef(null);
    useEffect(() => {
        try {
            // eslint-disable-next-line no-console
            console.debug('serverUsageCtx', serverCtx);
        }
        catch { }
    }, [serverCtx]);
    const applyCredentials = useCallback(() => {
        if (!usernameRef.current || !passwordRef.current)
            return;
        usernameRef.current.value = DEFAULTS.USERNAME;
        passwordRef.current.value = DEFAULTS.PASSWORD;
    }, [DEFAULTS]);
    const onSubmit = useCallback((e) => {
        if (submitting)
            return;
        if (!termsAccepted) {
            e.preventDefault();
            alert('Please accept terms & conditions to continue.');
            return;
        }
        applyCredentials();
        setSubmitting(true);
    }, [applyCredentials, submitting, termsAccepted]);
    return (_jsx(_Fragment, { children: _jsxs("main", { children: [_jsx("section", { className: "logo-section", children: _jsx("div", { className: "container", children: _jsx("a", { href: "/", className: "logo d-flex align-items-center", children: _jsx("img", { src: "/assets/images/plusnet-logo.svg", alt: "PluxNet logo" }) }) }) }), _jsx("section", { className: "internet-section", children: _jsx("div", { className: "container", children: _jsx("div", { className: "internet-claim", children: _jsxs("div", { className: "internet-claim-wrapper text-center", children: [_jsx("span", { className: "internet-claim-icon d-flex", children: _jsx("img", { src: "/assets/images/wifi-icon.svg", alt: "wifi icon" }) }), _jsx("h6", { className: "internet-claim-title font-body-normal pnt-pt-15 pnt-pb-32", children: "Get 1.5 GB of internet free of cost, provided by pluxnet" }), _jsx("div", { className: "form-check form-checkbox d-flex align-items-center pnt-pb-24", children: _jsxs("div", { className: "custom-control custom-checkbox", children: [_jsx("input", { type: "checkbox", className: "custom-control-input", id: "check-1", checked: termsAccepted, onChange: (e) => setTermsAccepted(e.target.checked) }), _jsx("label", { className: "custom-control-label", htmlFor: "check-1", children: "Accept terms & conditions to continue" })] }) }), _jsxs("form", { id: "loginForm", ref: formRef, method: "post", action: linkLogin, onSubmit: onSubmit, children: [_jsx("input", { ref: usernameRef, type: "hidden", name: "username", defaultValue: "" }), _jsx("input", { ref: passwordRef, type: "hidden", name: "password", defaultValue: "" }), _jsx("input", { type: "hidden", name: "dst", value: dst }), _jsx("div", { className: "pnt-pt-16", children: _jsx("button", { type: "submit", className: "btn btn-primary w-100", disabled: submitting, children: submitting ? 'Submitting…' : 'Connect Now' }) })] })] }) }) }) }), _jsx("section", { className: "news-section", children: _jsxs("div", { className: "container", children: [_jsxs("h4", { className: "news-section-top d-flex align-items-center justify-content-between", children: [_jsx("span", { className: "news-section-title font-title-medium", children: "Latest news" }), _jsx("a", { href: "#", className: "news-section-link btn-link", children: "View all" })] }), _jsxs("div", { className: "swiper latest-news-slider swiper-horizontal", children: [_jsx("div", { className: "swiper-wrapper", children: Array.from({ length: 4 }).map((_, i) => (_jsx("div", { className: "swiper-slide", children: _jsxs("div", { className: "news-slide-container", children: [_jsx("div", { className: "news-slide-img", children: _jsx("img", { src: "/assets/images/news-img-1.png", alt: "news" }) }), _jsx("div", { className: "news-slide-info", children: _jsx("h6", { className: "nees-slide-title font-body-medium", children: "Bond Market Shudders as Tax Bill Deepens Deficit Worries" }) })] }) }, i))) }), _jsxs("div", { className: "slider-navigation pagination", children: [_jsx("div", { className: "page-item page-item-prev swiper-button-prev swiper-button-disabled", children: _jsx("button", { className: "btn btn-secondary page-link", "aria-label": "Previous slide", children: _jsx("svg", { width: 8, height: 12, viewBox: "0 0 8 12", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M6.5 11L1.5 6L6.5 1", stroke: "#17232A", strokeWidth: "1.875", strokeLinecap: "round", strokeLinejoin: "round" }) }) }) }), _jsx("div", { className: "page-item page-item-next swiper-button-next", children: _jsx("button", { className: "btn btn-secondary page-link", "aria-label": "Next slide", children: _jsx("svg", { width: 8, height: 12, viewBox: "0 0 8 12", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: _jsx("path", { d: "M1.5 11L6.5 6L1.5 1", stroke: "#17232A", strokeWidth: "1.875", strokeLinecap: "round", strokeLinejoin: "round" }) }) }) })] })] })] }) }), _jsx("section", { className: "add-section w-100", children: _jsx("div", { className: "container-fluid", children: _jsxs("div", { className: "add-wrapper w-100", children: [_jsx("img", { src: "/assets/images/add-img-1.png", className: "img-fluid", alt: "ad" }), _jsx("span", { className: "add-close-icon", children: _jsxs("svg", { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z", stroke: "white", strokeWidth: "1.5", strokeLinejoin: "round" }), _jsx("path", { d: "M14.8289 9.1709L9.17188 14.8279M9.17188 9.1709L14.8289 14.8279", stroke: "white", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" })] }) })] }) }) })] }) }));
}
