// "use client"
// import { Button } from "../ui/button"
// import { useRouter } from "next/navigation"
// import Form from "next/form"
// import { loginToHotspot } from "@/lib/mikrotik/mikrotik-service"
// import { useFormState } from "react-dom"
// import { toast } from "sonner"
// import { LoginFormState, MikroTikData } from "@/lib/mikrotik/mikrotik-types"

// interface ConnectCardProps {
//     backgroundImage?: string
//     mikrotikData: MikroTikData
// }
// const initialState = { success: false, message: "" };

// export default function ConnectCard({ backgroundImage, mikrotikData }: ConnectCardProps) {
//     const router = useRouter()
//     // const [voucherCode, setVoucherCode] = useState<string>("");
//     const [state, formAction] = useFormState(handleSubmit, initialState);

//     function handleSubmit(): LoginFormState {
//         let res: LoginFormState = { success: false, message: "" };
//         // toast.promise(loginToHotspot(mikrotikData, voucherCode === "" ? undefined : voucherCode), {
//         toast.promise(loginToHotspot(mikrotikData), {
//             loading: "Connecting to PluxNet Fibre Hotspot...",
//             success: (data) => {
//                 res = data
//                 return "Connected to PluxNet Fibre Hotspot"
//             },
//             error: (error) => {
//                 res = error
//                 return "Oops! Something went wrong. Please try again."
//             }
//         })
//         router.push("/welcome")
//         return res
//     }

//     return (
//         //   {/* <VideoAd vastUrl="https://servedby.revive-adserver.net/fc.php?script=apVideo:vast2&zoneid=24615" /> */}
//         <div className="relative bg-[#301358] rounded-3xl w-full max-w-md mx-auto">
//             {/* Background image overlay if provided */}
//             {backgroundImage && (
//                 //    /* eslint-disable @next/next/no-img-element */
//                 <img
//                     src={backgroundImage || "/placeholder.svg"}
//                     alt="Background overlay"
//                     className="absolute inset-0 w-full h-full object-cover rounded-3xl "
//                 />
//             )}

//             {/* Main card */}
//             <div className="relative rounded-sm p-4 text-white overflow-hidden">
//                 {/* WiFi Icon */}
//                 <div className="flex justify-center mb-2">
//                     {/* <Wifi className="w-12 h-12 text-white" strokeWidth={2.5} /> */}
//                     <img src="wifi-icon.svg" alt="wifi icon" width="70px" height="70px" />
//                 </div>

//                 {/* Main text */}
//                 <div className="text-center mb-10">
//                     <h2 className="text-xl font-bold leading-tight">
//                         Get 1.5 GB of internet free of cost, provided by PluxNet Fibre
//                     </h2>
//                 </div>

//                 {/* Checkbox */}
//                 <Form action={formAction} className="flex flex-col justify-center items-center">
//                     {/* <div className="flex items-center justify-between mb-4 gap-4 w-full p-3 bg-white border border-[#CECECE] rounded-lg text-black">
//                         <input type="text" id="voucherCode" className="text-base font-normal w-full" placeholder="Enter voucher code" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} />
//                         <button type="button" className="text-base font-semibold text-[#5B3393]" onClick={() => {

//                         }} >
//                             Apply
//                         </button>
//                     </div> */}
//                     <div className="flex items-center justify-center space-x-3 mb-4">
//                         <input
//                             id="terms"
//                             type="checkbox"
//                             required
//                             className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#301358] mt-0.5"
//                         />
//                         <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
//                             Accept terms & conditions to continue
//                         </label>
//                     </div>

//                     {/* Connect Button */}
//                     <Button
//                         className="w-full bg-white rounded-4xl hover:bg-gray-100 text-[#301358] font-medium py-6  text-base hover:cursor-pointer"
//                         type="submit"
//                         disabled={state.success}
//                     >
//                         {/* eslint-disable @next/next/no-img-element  */}
//                         <img src="watch-video-icon.svg" alt="watch video" width={"auth"} height={"auto"} />
//                         Watch video to claim
//                     </Button>
//                 </Form>
//             </div>
//         </div>
//     )
// }


"use client";

import { Button } from "../ui/button";
import { useFormState } from "react-dom";
import Form from "next/form";
import { MikroTikData, LoginFormState } from "@/lib/mikrotik/mikrotik-types";
import { useConnect } from "./ConnectContext";

interface ConnectCardProps {
    backgroundImage?: string;
    mikrotikData: MikroTikData;
}

const initialState: LoginFormState = { success: false, message: "" };

export default function ConnectCard({ backgroundImage, mikrotikData }: ConnectCardProps) {
    const { connect } = useConnect();
    const [state, formAction] = useFormState(handleSubmit, initialState);

    async function handleSubmit(): Promise<LoginFormState> {
        return await connect(mikrotikData);
    }

    return (
        <div className="relative bg-[#301358] rounded-3xl w-full max-w-md mx-auto">
            {backgroundImage && (
                <img
                    src={backgroundImage || "/placeholder.svg"}
                    alt="Background overlay"
                    className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                />
            )}

            <div className="relative rounded-sm p-4 text-white overflow-hidden">
                <div className="flex justify-center mb-2">
                    <img src="wifi-icon.svg" alt="wifi icon" width="70px" height="70px" />
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-xl font-bold leading-tight">
                        Get 1.5 GB of internet free of cost, provided by PluxNet Fibre
                    </h2>
                </div>

                <Form action={formAction} className="flex flex-col justify-center items-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <input
                            id="terms"
                            type="checkbox"
                            required
                            className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#301358] mt-0.5"
                        />
                        <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                            Accept terms & conditions to continue
                        </label>
                    </div>

                    <Button
                        className="w-full bg-white rounded-4xl hover:bg-gray-100 text-[#301358] font-medium py-6  text-base hover:cursor-pointer"
                        type="submit"
                        disabled={state.success}
                    >
                        <img src="watch-video-icon.svg" alt="watch video" width="auth" height="auto" />
                        Watch video to claim
                    </Button>
                </Form>
            </div>
        </div>
    );
}
