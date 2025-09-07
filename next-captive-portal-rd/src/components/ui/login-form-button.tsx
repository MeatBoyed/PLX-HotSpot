
import { env } from "@/env";

type LoginFormButtonProps = {
    label?: string;
    className: string;
    /** Optional destination/redirect. Defaults to env.MIKROTIK_REDIRECT_URL if set. */
    dst?: string;
    style: React.CSSProperties
};

/**
 * Static login form button that posts hidden credentials to the Mikrotik login endpoint.
 * - No JS handlers (pure <form> submit)
 * - Username/password (and optional dst) sent as hidden inputs
 * - Action targets `${MIKROTIK_BASE_URL}/login` using POST
 */
export function LoginFormButton({
    label = "Connect Now",
    style,
    className,
    dst,
}: LoginFormButtonProps) {
    const action = `${env.NEXT_PUBLIC_MIKROTIK_BASE_URL}/login`;
    // const destVal = dst ?? env.MIKROTIK_REDIRECT_URL ?? "";
    const destVal = ""

    return (
        <form method="post" action={action} className="inline-block">
            {/* Hidden required credentials */}
            <input type="hidden" name="username" value={env.NEXT_PUBLIC_MIKROTIK_DEFAULT_USERNAME} />
            <input type="hidden" name="password" value={env.NEXT_PUBLIC_MIKROTIK_DEFAULT_PASSWORD} />
            {destVal && <input type="hidden" name="dst" value={destVal} />}

            {/* Only visible control */}
            <button
                type="submit"
                className={className}
                style={style}
            >
                {label}
            </button>
        </form>
    );
}

export default LoginFormButton;
