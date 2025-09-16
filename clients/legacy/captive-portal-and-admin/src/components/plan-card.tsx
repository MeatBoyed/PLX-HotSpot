"use client"
import { XCircleIcon } from "lucide-react"
import { useTheme } from "./theme-provider"
import { FreeLoginFormButton, VoucherLoginForm } from "./ui/login-form-button"

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
            {/* <LoginFormButton
                style={{
                    backgroundColor: theme.buttonPrimary,
                    color: theme.buttonPrimaryText,
                }}
                className={`text-white rounded-full px-8 py-2 font-semibold mt-2 text-sm`} /> */}
        </div>
    )
}


export function FreePlanCard({ tag, total_data }: { tag: string, total_data: string }) {
    const { theme } = useTheme()
    return (
        <div className="bg-gray-100 rounded-xl p-4 w-full flex flex-col items-center">
            <span className="bg-gray-200 text-xs px-2 py-1 rounded mb-2 text-gray-500">{tag}</span>
            <span className="mb-2 font-bold text-lg">Connect for Free</span>
            {/* <span className="text-black font-bold text-xl mb-1">{price}</span> */}
            <span className="text-gray-500 text-xs mb-2">{total_data}</span>
            {/* <button className={`text-white rounded-full px-8 py-2 font-semibold mt-2 text-sm`}
                style={{
                    backgroundColor: theme.buttonPrimary,
                    color: theme.buttonPrimaryText,
                }}
            >Claim</button> */}
            <FreeLoginFormButton
                style={{
                    backgroundColor: theme.buttonPrimary,
                    color: theme.buttonPrimaryText,
                }}
                className={`text-white rounded-full px-8 py-2 font-semibold mt-2 text-sm w-full`} />
        </div>
    )
}

export function VoucherPlanCard({ setOpen }: { setOpen?: () => void }) {
    const { theme } = useTheme()
    return (
        <div className="rounded-xl w-full flex flex-col items-start ">
            <div className="flex justify-between items-center w-full">
                <span className="mb-2 font-bold text-lg">Redeem your voucher</span>
                <XCircleIcon onClick={setOpen} size={20} />
            </div>
            <span className="mb-2 text-sm">Please enter your voucher code to connect to the internet</span>
            {/* <span className="text-black font-bold text-xl mb-1">{price}</span> */}
            <VoucherLoginForm
                style={{
                    backgroundColor: theme.buttonPrimary,
                    color: theme.buttonPrimaryText,
                }}
                label="Redeem voucher"
                className={`text-white rounded-full px-8 py-2 font-semibold mt-2 text-sm w-full`} />
        </div>
    )
}