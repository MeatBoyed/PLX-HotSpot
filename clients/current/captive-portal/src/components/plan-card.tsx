"use client";
import { XCircleIcon } from "lucide-react";
import { useTheme } from "./theme-provider";
import { NetworkFreeConnectButton, NetworkLoginForm, NetworkVoucherConnectForm, NetworkPhoneNameForm } from "./ui/login-form-button";
import React from "react";
import Link from "next/link";
import type { GatewayConfig } from "@/lib/types";

export type PlanVariant = 'free' | 'paid' | 'voucher' | 'pu-login' | 'pu-phonename';

interface PlanCardProps {
    name?: string
    variant: PlanVariant;
    tag?: string;
    price?: string;
    totalData?: string;
    onDismiss?: () => void;
    className?: string;
    gatewayConfig?: GatewayConfig;
}

// Shimmer wrapper — wraps any button with the sweep animation
function ShimmerButton({ children, style, className }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
    return (
        <div className={`relative overflow-hidden rounded-full ${className || ''}`} style={style}>
            {children}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)',
                    animation: 'shimmer 2.5s infinite',
                    borderRadius: 'inherit',
                }}
            />
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}

const EMPTY_GATEWAY: GatewayConfig = { loginUrl: '', freeUsername: '', freePassword: '' };

export function PlanCard({ name, variant, tag, price, totalData, onDismiss, className, gatewayConfig = EMPTY_GATEWAY }: PlanCardProps) {
    const { theme } = useTheme();

    const isPaid = variant === 'paid';
    const isFree = variant === 'free';
    const isVoucher = variant === 'voucher';
    const isPULogin = variant === 'pu-login';
    const isPUPhone = variant === 'pu-phonename';

    const btnStyle = { backgroundColor: theme.buttonPrimary, color: theme.buttonPrimaryText };
    const btnClass = "text-white rounded-full px-8 py-2 font-semibold mt-2 text-sm w-full";

    return (
        <div className={[
            "bg-gray-100 rounded-xl p-4 flex flex-col w-full text-center",
            isVoucher ? "items-center w-full" : "items-center min-w-[140px] justify-between",
            className || ""
        ].join(" ").trim()}>
            {tag && (
                <span className="bg-gray-200 text-xs px-2 py-1 rounded mb-2 text-gray-500">{tag}</span>
            )}

            {isFree && <span className="mb-2 font-bold text-lg">Connect for Free</span>}
            {isPaid && <span className="text-black font-bold text-xl mb-1">{price}</span>}
            {isVoucher && (
                <div className="flex justify-between items-center w-full mb-1">
                    <span className="font-bold text-lg">Enter your Wifi Code</span>
                    {onDismiss && <XCircleIcon onClick={onDismiss} size={20} className="cursor-pointer" />}
                </div>
            )}
            {isPULogin && <span className="mb-2 font-bold text-lg">Login to connect</span>}
            {isPUPhone && <span className="mb-2 font-bold text-lg">Login with your Phone & Name</span>}

            {totalData && !isVoucher && (
                <span className="text-gray-500 text-xs mb-2">{totalData}</span>
            )}
            {isVoucher && (
                <span className="mb-2 text-sm">Please enter your wifi code to connect to the internet</span>
            )}

            {isPaid && (
                <ShimmerButton style={btnStyle}>
                    <Link
                        href={`/checkout/${name}?ssid=${encodeURIComponent(theme.ssid)}`}
                        className="text-white rounded-full w-full py-3 font-semibold mt-2 text-sm block"
                        style={btnStyle}
                    >
                        Buy now
                    </Link>
                </ShimmerButton>
            )}

            {isFree && (
                <ShimmerButton style={btnStyle} className="mt-2 w-full">
                    <NetworkFreeConnectButton
                        style={btnStyle}
                        className={btnClass}
                        gatewayConfig={gatewayConfig}
                    />
                </ShimmerButton>
            )}

            {isVoucher && (
                <NetworkVoucherConnectForm
                    className={btnClass}
                    style={btnStyle}
                    label="Connect"
                    gatewayConfig={gatewayConfig}
                />
            )}

            {isPULogin && (
                <NetworkLoginForm
                    className={btnClass}
                    style={btnStyle}
                    gatewayConfig={gatewayConfig}
                />
            )}

            {isPUPhone && (
                <NetworkPhoneNameForm
                    className={btnClass}
                    style={btnStyle}
                    gatewayConfig={gatewayConfig}
                />
            )}
        </div>
    );
}
