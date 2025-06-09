"use client"


import { z } from "zod"
// import { Form, useForm } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
import { Checkbox } from "@radix-ui/react-checkbox"
import { Button } from "../ui/button"
// import { FormField, FormItem, FormControl, FormLabel } from "../ui/form"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Form from "next/form"
import { loginToHotspot } from "@/lib/mikrotik/mikrotik-service"
import { useFormState } from "react-dom"
import { toast } from "sonner"

interface ConnectCardProps {
    backgroundImage?: string
}

export const ConnectFormSchema = z.object({
    termsAccepted: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions to continue",
    }),
})
export type ConnectFormSchemaType = z.infer<typeof ConnectFormSchema>
const initialState = { success: false, message: "" };

export default function ConnectCard({ backgroundImage }: ConnectCardProps = {}) {
    const router = useRouter()
    const [state, formAction] = useFormState(loginToHotspot, initialState);

    // function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    //     event.preventDefault()
    //     if (!termsAccepted) {
    //         alert("You must accept the terms and conditions to continue")
    //         return
    //     }
    //     // Do something with the form values.
    //     // ✅ This will be type-safe and validated.
    //     alert("Connecting to WiFi... Please wait.")
    //     // router.push("/welcome")
    // }

    // Handles displaying appropriate toast per Action response
    useEffect(() => {
        if (state.message) {
            toast.error("Oops! Something went wrong. Please try again.", {
                description: state.message
            })
        } else if (state.success) {
            toast.success("Successfully connected to WiFi!", {
                description: "Redirecting you to the welcome page..."
            })
            router.push("/welcome")
        }
    }, [state])
    // if (state.success && typeof window !== "undefined") {
    //     setTimeout(() => {
    //         window.location.href = "/welcome";
    //     }, 1000)
    // }

    return (
        <div className="relative bg-[#301358] rounded-3xl w-full max-w-md mx-auto">
            {/* Background image overlay if provided */}
            {backgroundImage && (
                //    /* eslint-disable @next/next/no-img-element */
                <img
                    src={backgroundImage || "/placeholder.svg"}
                    alt="Background overlay"
                    className="absolute inset-0 w-full h-full object-cover rounded-3xl "
                />
            )}

            {/* Main card */}
            <div className="relative rounded-sm p-4 text-white overflow-hidden">
                {/* WiFi Icon */}
                <div className="flex justify-center mb-2">
                    {/* <Wifi className="w-12 h-12 text-white" strokeWidth={2.5} /> */}
                    <img src="wifi-icon.svg" alt="wifi icon" width="70px" height="70px" />
                </div>

                {/* Main text */}
                <div className="text-center mb-10">
                    <h2 className="text-xl font-bold leading-tight">
                        Get 1.5 GB of internet free of cost, provided by PluxNet Fibre
                    </h2>
                </div>

                {/* Checkbox */}
                {/* <Form {...form}> */}
                {/* <form onSubmit={form.handleSubmit(onSubmit)} > */}
                <Form action={formAction}>
                    <div className="flex items-start justify-center space-x-3 mb-4">
                        {/* <FormField
                            control={form.control}
                            name="termsAccepted"
                            render={({ field }) => ( */}
                        {/* <FormItem className="flex items-start justify-center space-x-3 mb-4"> */}
                        {/* <FormControl> */}
                        <input
                            id="terms"
                            type="checkbox"
                            required
                            className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#301358] mt-0.5"
                        />
                        {/* </FormControl> */}
                        {/* <p className="text-sm leading-relaxed cursor-pointer">
                                Accept terms & conditions to continue
                            </p> */}
                        {/* </FormItem> */}
                        {/* )}
                        /> */}

                        <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                            Accept terms & conditions to continue
                        </label>
                    </div>

                    {/* CTA Button */}
                    <Button
                        className="w-full bg-white rounded-4xl hover:bg-gray-100 text-[#301358] font-medium py-6  text-base hover:cursor-pointer"
                        type="submit"
                        disabled={state.success}
                    // disabled={!accepted}
                    >
                        {/* <PlayCircleIcon size={70} className="w-5 h-5 mr-2 fill-white text-[#301358]" /> */}
                        {/* eslint-disable @next/next/no-img-element  */}
                        <img src="watch-video-icon.svg" alt="watch video" width={"auth"} height={"auto"} />
                        Watch video to claim
                    </Button>
                </Form>
                {/* </Form> */}
            </div>
        </div>
    )
}
