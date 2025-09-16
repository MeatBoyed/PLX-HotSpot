
import { env } from "@/env";
import { useState } from "react";
import { cn } from "@/lib/utils"

type LoginFormButtonProps = {
    label?: string;
    className: string;
    /** Optional destination/redirect. Defaults to env.MIKROTIK_REDIRECT_URL if set. */
    style: React.CSSProperties
};

/**
 * Static login form button that posts hidden credentials to the Mikrotik login endpoint.
 * - No JS handlers (pure <form> submit)
 * - Username/password (and optional dst) sent as hidden inputs
 * - Action targets `${MIKROTIK_BASE_URL}/login` using POST
 */
export function FreeLoginFormButton({
    label = "Connect Now",
    style,
    className,
}: LoginFormButtonProps) {
    const action = `${env.NEXT_PUBLIC_MIKROTIK_BASE_URL}/login`;
    const username = env.NEXT_PUBLIC_MIKROTIK_DEFAULT_PASSWORD
    const password = env.NEXT_PUBLIC_MIKROTIK_DEFAULT_PASSWORD

    return (
        <form method="GET" action={action} className="inline-block w-full">
            {/* Hidden required credentials */}
            <input type="hidden" name="username" value={username} />
            <input type="hidden" name="password" value={password} />

            {/* Only visible control */}
            <button
                type="submit"
                className={cn(className, "hover:cursor-pointer")}
                style={style}
            >
                {label}
            </button>
        </form>
    );
}


export function VoucherLoginForm({
    label = "Connect Now",
    style,
    className,
}: LoginFormButtonProps) {
    const [voucherCode, setVoucherCode] = useState("")
    const action = `${env.NEXT_PUBLIC_MIKROTIK_BASE_URL}/login`;
    // const username = env.NEXT_PUBLIC_MIKROTIK_DEFAULT_PASSWORD
    // const password = env.NEXT_PUBLIC_MIKROTIK_DEFAULT_PASSWORD

    return (
        <div className="inline-block w-full">
            <input type="text" className="w-full border border-gray-500 rounded p-2 mb-3" placeholder="Enter your voucher code" onChange={(e) => setVoucherCode(e.target.value)} />
            <form method="GET" action={action} className="inline-block w-full">
                {/* <span className="text-red-500 text-xs mb-2">Oops! That voucher code isn't valid. Please try again</span> */}
                {/* Hidden required credentials */}
                <input type="hidden" name="username" value={voucherCode} />
                <input type="hidden" name="password" value={voucherCode} />

                {/* Only visible control */}
                <button
                    type="submit"
                    className={cn(className, "hover:cursor-pointer")}
                    style={style}
                >
                    {label}
                </button>
            </form>
        </div>
    );
}