"use client";

import React from "react";
import { env } from "@/env";

interface PureHtmlConnectCardProps {
    backgroundImage?: string;
    mikrotikLoginUrl?: string; // Pass this as a prop from the parent
}

const Default_Username = env.MIKROTIK_DEFAULT_USERNAME;
const Default_Password = env.MIKROTIK_DEFAULT_PASSWORD;

export default function PureHtmlConnectCard({ backgroundImage, mikrotikLoginUrl }: PureHtmlConnectCardProps) {
    // Fallback URL if not provided
    const loginUrl = mikrotikLoginUrl || "http://10.5.50.1/login";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        const form = e.currentTarget;
        const formData = new FormData(form);
        const voucherCode = (formData.get('voucherCode') as string)?.trim() || "";

        // Determine credentials
        const username = voucherCode || Default_Username;
        const password = voucherCode || Default_Password;

        // Construct the final URL manually
        const finalUrl = `${loginUrl}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

        console.log("Pure HTML form navigating to:", finalUrl);

        // Navigate directly to the URL
        window.location.href = finalUrl;

        // Prevent the default form submission
        e.preventDefault();
    };

    return (
        <div className="relative rounded-3xl w-full max-w-md mx-auto bg-gradient-to-br from-purple-600 to-blue-600">
            {backgroundImage && (
                <img
                    src={backgroundImage}
                    alt="Background overlay"
                    className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                />
            )}

            <div className="relative rounded-sm p-6 text-white overflow-hidden">
                <div className="flex justify-center mb-4">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                    </svg>
                </div>

                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold leading-tight">
                        Pure HTML Form Login
                    </h2>
                    <p className="text-sm opacity-90 mt-2">
                        Direct browser navigation to MikroTik
                    </p>
                </div>

                {/* Pure HTML Form - no fetch, just browser navigation */}
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col justify-center items-center space-y-4"
                >
                    {/* Voucher Code Input */}
                    <div className="w-full p-3 bg-white rounded-lg">
                        <input
                            type="text"
                            name="voucherCode"
                            className="text-base font-normal w-full outline-none text-gray-800"
                            placeholder="Enter voucher code (optional)"
                        />
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-center justify-center space-x-3">
                        <input
                            id="terms-html"
                            type="checkbox"
                            required
                            className="w-4 h-4 text-white border-2 border-white rounded focus:ring-white focus:ring-2"
                        />
                        <label htmlFor="terms-html" className="text-sm leading-relaxed cursor-pointer">
                            Accept terms & conditions to continue
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        <span>Connect with Pure HTML</span>
                    </button>
                </form>

                {/* Debug Info */}
                <div className="mt-4 p-3 bg-black bg-opacity-50 rounded text-xs">
                    <p><strong>Login URL:</strong> {loginUrl}</p>
                    <p><strong>Default Username:</strong> {Default_Username}</p>
                    <p><strong>Default Password:</strong> {Default_Password}</p>
                    <p><strong>Method:</strong> Direct browser navigation (window.location.href)</p>
                </div>
            </div>
        </div>
    );
}
