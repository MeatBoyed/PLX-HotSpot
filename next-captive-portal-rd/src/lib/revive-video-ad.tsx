'use client';

import { useEffect, useRef, useState } from 'react';
import { cn, parseVastXml } from './utils';
import { VastAdData } from './types';

interface VideoAdProps {
    vastUrl: string;
    className?: string;
}

export default function VideoAd({ vastUrl, className }: VideoAdProps) {
    const [adData, setAdData] = useState<VastAdData | null>(null)

    useEffect(() => {
        fetch(vastUrl)
            .then((res) => res.text())
            .then((text) => setAdData(parseVastXml(text)))
        console.log("Media File: ", adData)
    }, [vastUrl]);

    useEffect(() => {
        if (adData?.impressionUrls) {
            adData.impressionUrls.forEach((url) => {
                // Fire impression trackers as soon as the ad is loaded
                new Image().src = url
            })
        }
    }, [adData])

    return (
        <div className='relative w-full max-w-xl aspect-video'>
            {adData ? (
                <video
                    className={cn('w-full h-auto', className)}
                    src={adData.mediaFileUrl}
                    autoPlay
                    muted
                    controls={false}
                    playsInline
                    onClick={() => window.open(adData.clickThroughUrl, '_blank')}
                // style={{ width: '100%', height: 'auto' }}
                />
            ) : (
                <p>Loading video...</p>
            )}
        </div>
    );
}

//     {/* <source src={videoSrc} type="video/mp4" /> */}
//     {/* Your browser does not support the video tag. */}
// {/* </video> */}