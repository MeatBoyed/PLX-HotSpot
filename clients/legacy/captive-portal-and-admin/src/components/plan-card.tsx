"use client"
import { useTheme } from "./theme-provider"

interface props {
    tag: string,
    price: string,
    total_data: string,
}

export function PlanCard({ tag, price, total_data }: props) {
    const { theme } = useTheme()
    return (
        <div className="bg-gray-100 rounded-xl p-4 min-w-[140px] flex flex-col items-center">
            <span className="bg-gray-200 text-xs px-2 py-1 rounded mb-2 text-gray-500">{tag}</span>
            <span className="text-black font-bold text-xl mb-1">{price}</span>
            <span className="text-gray-500 text-xs mb-2">{total_data}</span>
            <button className={`text-white rounded-full px-8 py-2 font-semibold mt-2 text-sm`}
                style={{
                    backgroundColor: theme.buttonPrimary,
                    color: theme.buttonPrimaryText,
                }}
            >Claim</button>
        </div>
    )
}