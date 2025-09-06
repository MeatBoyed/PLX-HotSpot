import { useTheme } from "@/components/theme-provider"

export default function VoucherCTA() {
    const { theme } = useTheme()

    return (
        <div className="bg-white border rounded-xl flex items-center justify-between px-4 py-3 mt-4 mb-4">
            <div className="flex items-center gap-2">
                <div className={`text-white rounded-full p-2`} style={{ backgroundColor: theme.brandPrimary }}>
                    {/* Icon: use a placeholder */}
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" /></svg>
                </div>
                <span className="text-gray-700 text-sm font-medium">Got a voucher? Redeem now.</span>
            </div>
            <span className={`text-xl`} style={{ color: theme.brandPrimary }} >&#8594;</span>
        </div>
    )
}