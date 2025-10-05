"use client";
import { XCircleIcon } from "lucide-react";
import { useTheme } from "./theme-provider";
import { FreeLoginFormButton, VoucherLoginForm } from "./ui/login-form-button";
import React from "react";
import Link from "next/link";

export type PlanVariant = 'free' | 'paid' | 'voucher';

interface PlanCardProps {
    name?: string
    variant: PlanVariant;
    tag?: string;
    price?: string; // required for paid variant
    totalData?: string;
    onDismiss?: () => void; // voucher only
    className?: string;
}

export function PlanCard({ name, variant, tag, price, totalData, onDismiss, className }: PlanCardProps) {
    const { theme } = useTheme();

    const isPaid = variant === 'paid';
    const isFree = variant === 'free';
    const isVoucher = variant === 'voucher';

    return (
        <div className={[
            "bg-gray-100 rounded-xl p-4 flex flex-col w-full",
            isVoucher ? "items-start w-full" : "items-center min-w-[140px]",
            className || ""
        ].join(" ").trim()}>
            {tag && (
                <span className="bg-gray-200 text-xs px-2 py-1 rounded mb-2 text-gray-500">{tag}</span>
            )}

            {isFree && <span className="mb-2 font-bold text-lg">Connect for Free</span>}
            {isPaid && (
                <span className="text-black font-bold text-xl mb-1">{price}</span>
            )}
            {isVoucher && (
                <div className="flex justify-between items-center w-full mb-1">
                    <span className="font-bold text-lg">Redeem your voucher</span>
                    {onDismiss && <XCircleIcon onClick={onDismiss} size={20} className="cursor-pointer" />}
                </div>
            )}

            {totalData && !isVoucher && (
                <span className="text-gray-500 text-xs mb-2">{totalData}</span>
            )}
            {isVoucher && (
                <span className="mb-2 text-sm">Please enter your voucher code to connect to the internet</span>
            )}

            {isPaid && (
                <Link
                    href={`/checkout/${name}`}
                    className="text-white rounded-full px-8 py-2 font-semibold mt-2 text-sm"
                    style={{ backgroundColor: theme.buttonPrimary, color: theme.buttonPrimaryText }}
                >
                    Buy now
                </Link>
            )}

            {isFree && (
                <FreeLoginFormButton
                    style={{ backgroundColor: theme.buttonPrimary, color: theme.buttonPrimaryText }}
                    className="text-white rounded-full px-8 py-2 font-semibold mt-2 text-sm w-full"
                />
            )}

            {isVoucher && (
                <VoucherLoginForm
                    // className={'hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed  '}
                    className={"text-white rounded-full px-8 py-2 font-semibold mt-2 text-sm w-full"}
                    style={{ backgroundColor: theme.buttonPrimary, color: theme.buttonPrimaryText }}
                    label="Redeem"
                />
            )}
        </div>
    );
}