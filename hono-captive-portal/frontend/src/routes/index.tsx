import { createFileRoute } from '@tanstack/react-router'
import VideoAd from "../components/revive-video-ad"
import logo from '../logo.svg'
import Head from '@/components/head'
import ConnectCard from '@/components/connect-card'

export const Route = createFileRoute('/')({
    component: App,
})

function App() {
    const onAdComplete = () => {
        return
    }

    const adUrl = "http://"

    return (
        <>
            <main>
                <section className="logo-section">
                    <div className="container">
                        <Head />
                    </div>
                </section>

                <section className="internet-section">
                    <div className="container">
                        <div className="internet-claim">
                            <div className="internet-claim-wrapper text-center">
                                <span className="internet-claim-icon d-flex">
                                    <img src="assets/images/wifi-icon.svg" alt="wifi icon" />
                                </span>
                                <h6 className="internet-claim-title font-body-normal pnt-pt-15 pnt-pb-32">Get 1.5 GB of internet
                                    free of cost, provided by pluxnet</h6>
                                <div className="form-check form-checkbox d-flex align-items-center pnt-pb-24">
                                    <div className="custom-control custom-checkbox">
                                        <input type="checkbox" className="custom-control-input" id="check-1" />
                                        <label className="custom-control-label" htmlFor="check-1">Accept terms & conditions to
                                            continue</label>
                                    </div>
                                </div>
                                {/* <!-- <h3 className="title-head font-body-xs pnt-pb-24">Accept terms & conditions to continue</h3> --> */}
                                <button type="submit" id="openVideo" className="btn btn-secondary w-100">
                                    <span className="btn-icon">
                                        <img src="assets/images/watch-video-icon.svg" alt="watch video" />
                                    </span>
                                    Watch video to claim
                                </button>
                                {/* <!-- <button type="submit" className="btn btn-primary">
                                Select
                            </button> --> */}
                            </div>
                            <ConnectCard />
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

                                <div className="swiper-slide">
                                    <div className="news-slide-container">
                                        <div className="news-slide-img">
                                            <img src="assets/images/news-img-1.png" alt="news image" />
                                        </div>
                                        <div className="news-slide-info">
                                            <h6 className="nees-slide-title font-body-medium">Bond Market Shudders as Tax Bill
                                                Deepens Deficit Worries</h6>
                                        </div>
                                    </div>
                                </div>
                                <div className="swiper-slide">
                                    <div className="news-slide-container">
                                        <div className="news-slide-img">
                                            <img src="assets/images/news-img-1.png" alt="news image" />
                                        </div>
                                        <div className="news-slide-info">
                                            <h6 className="nees-slide-title font-body-medium">Bond Market Shudders as Tax Bill
                                                Deepens Deficit Worries</h6>
                                        </div>
                                    </div>
                                </div>
                                <div className="swiper-slide">
                                    <div className="news-slide-container">
                                        <div className="news-slide-img">
                                            <img src="assets/images/news-img-1.png" alt="news image" />
                                        </div>
                                        <div className="news-slide-info">
                                            <h6 className="nees-slide-title font-body-medium">Bond Market Shudders as Tax Bill
                                                Deepens Deficit Worries</h6>
                                        </div>
                                    </div>
                                </div>
                                <div className="swiper-slide">
                                    <div className="news-slide-container">
                                        <div className="news-slide-img">
                                            <img src="assets/images/news-img-1.png" alt="news image" />
                                        </div>
                                        <div className="news-slide-info">
                                            <h6 className="nees-slide-title font-body-medium">Bond Market Shudders as Tax Bill
                                                Deepens Deficit Worries</h6>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="slider-navigation pagination">
                                <div className="page-item page-item-prev swiper-button-prev swiper-button-disabled">
                                    <button className="btn btn-secondary page-link" aria-label="Previous slide">
                                        <svg width="8" height="12" viewBox="0 0 8 12" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6.5 11L1.5 6L6.5 1" stroke="#17232A" strokeWidth="1.875"
                                                strokeLinecap="round" strokeLinejoin="round"></path>
                                        </svg>
                                    </button>
                                </div>
                                <div className="page-item page-item-next swiper-button-next">
                                    <button className="btn btn-secondary page-link" aria-label="Next slide">
                                        <svg width="8" height="12" viewBox="0 0 8 12" fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1.5 11L6.5 6L1.5 1" stroke="#17232A" strokeWidth="1.875"
                                                strokeLinecap="round" strokeLinejoin="round"></path>
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
            {/* <VideoAd vastUrl={adUrl} onComplete={onAdComplete} /> */}
        </>
    );
}

function ad() {
    return (

        <div id="showVideoPopup" className="show-Video-popup">
            <button type="submit" id="showVideoPopupClose"
                className="btn popup-close d-flex align-items-center justify-content-center">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M11 21C16.523 21 21 16.523 21 11C21 5.477 16.523 1 11 1C5.477 1 1 5.477 1 11C1 16.523 5.477 21 11 21Z"
                        stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M13.8289 8.1709L8.17188 13.8279M8.17188 8.1709L13.8289 13.8279" stroke="white"
                        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            <div className="popup-content-wrapper">
                <div className="video-box">
                    <iframe id="showVideoVideo" height="100%" width="100%" src="https://www.youtube.com/embed/tgbNymZ7vqY"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen></iframe>
                </div>
            </div>
        </div>
    )
}