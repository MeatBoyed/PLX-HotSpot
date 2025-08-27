'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface VastAdData {
    mediaFileUrl: string;
    clickThroughUrl?: string;
    impressionUrls: string[];
    duration?: number;
    title?: string;
}

interface VideoAdProps {
    vastUrl: string;
    onComplete?: () => void;
    className?: string
}

export default function VideoAd({ vastUrl, onComplete, className }: VideoAdProps) {
    const [adData, setAdData] = useState<VastAdData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Fetch VAST data from backend API
    useEffect(() => {
        const fetchVastData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                console.log('Fetching VAST data from:', vastUrl);
                const response = await fetch(`/api/vast?url=${encodeURIComponent(vastUrl)}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
                }

                const data: VastAdData = await response.json();

                if (!data.mediaFileUrl) {
                    throw new Error('No video URL found in ad data');
                }

                setAdData(data);
                console.log("Ad data loaded successfully:", data);
            } catch (err) {
                console.error('Error fetching VAST data:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to load ad';
                setError(errorMessage);

                // Auto-close after 10 seconds if there's an error
                setTimeout(() => {
                    if (onComplete) {
                        console.log('Auto-closing ad due to error after 10 seconds');
                        onComplete();
                    }
                }, 10000);
            } finally {
                setIsLoading(false);
            }
        };

        if (vastUrl) {
            fetchVastData();
        }
    }, [vastUrl, onComplete]);

    // Fire impression trackers when ad loads
    useEffect(() => {
        if (adData?.impressionUrls && isVideoLoaded) {
            adData.impressionUrls.forEach((url) => {
                console.log('Firing impression:', url);
                fetch(url, { method: 'GET', mode: 'no-cors' }).catch(() => {
                    // Fallback to image pixel tracking
                    const img = new Image();
                    img.src = url;
                });
            });
        }
    }, [adData, isVideoLoaded]);

    // Update progress
    const handleTimeUpdate = () => {
        if (videoRef.current && adData?.duration) {
            const currentTime = videoRef.current.currentTime;
            const duration = adData.duration;
            setCurrentTime(currentTime);
            setProgress((currentTime / duration) * 100);
        }
    };

    const handleVideoLoad = () => {
        setIsVideoLoaded(true);
        console.log('Video loaded successfully');
    };

    const handleVideoError = () => {
        console.error('Video failed to load');
        setError('Video failed to load. Please try again.');
    };

    const handleVideoEnd = () => {
        setProgress(100);
        console.log('Video ended, calling onComplete');
        onComplete?.();
    };

    const handleVideoClick = () => {
        if (adData?.clickThroughUrl) {
            window.open(adData.clickThroughUrl, '_blank');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Ad Loading Failed</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={onComplete}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            {/* Close button */}
            <button
                onClick={onComplete}
                className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold z-10"
                aria-label="Close ad"
            >
                ✕
            </button>

            <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                        <div className="text-center text-white">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <p className="text-lg">Loading advertisement...</p>
                        </div>
                    </div>
                )}

                {adData && (
                    <>
                        <video
                            ref={videoRef}
                            className={cn('w-full h-full object-contain', className)}
                            src={adData.mediaFileUrl}
                            autoPlay
                            muted={false}
                            loop={false}
                            controls={false}
                            playsInline
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedData={handleVideoLoad}
                            onError={handleVideoError}
                            onEnded={handleVideoEnd}
                            onClick={handleVideoClick}
                            style={{ cursor: adData.clickThroughUrl ? 'pointer' : 'default' }}
                        />

                        {/* Progress bar and info overlay */}
                        {isVideoLoaded && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                {/* Progress bar */}
                                <div className="w-full bg-white/20 rounded-full h-1 mb-3">
                                    <div
                                        className="bg-white h-1 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>

                                {/* Ad info */}
                                <div className="flex items-center justify-between text-white text-sm">
                                    <div className="flex items-center space-x-2">
                                        {adData.title && (
                                            <span className="font-medium">{adData.title}</span>
                                        )}
                                        {adData.clickThroughUrl && (
                                            <span className="text-white/80">• Click to learn more</span>
                                        )}
                                    </div>
                                    {adData.duration && (
                                        <span className="text-white/80">
                                            {formatTime(currentTime)} / {formatTime(adData.duration)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Skip button (appears after 5 seconds) */}
                        {currentTime > 5 && (
                            <button
                                onClick={onComplete}
                                className="absolute top-4 right-16 bg-black/60 text-white px-3 py-1 rounded text-sm hover:bg-black/80 transition-colors"
                            >
                                Skip Ad
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}