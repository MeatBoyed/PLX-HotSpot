import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

interface ConnectCardProps {
    backgroundImage?: string
}

export const ConnectFormSchema = z.object({
    termsAccepted: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions to continue",
    }),
})
export type ConnectFormSchemaType = z.infer<typeof ConnectFormSchema>

export default function ConnectCard({ backgroundImage }: ConnectCardProps = {}) {

    const form = useForm<z.infer<typeof ConnectFormSchema>>({
        resolver: zodResolver(ConnectFormSchema),
    })

    // 2. Define a submit handler.
    function onSubmit(values: ConnectFormSchemaType) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        // console.log(values)
        alert("Connecting to WiFi... Please wait.")
    }

    return (
        <div className="relative bg-[#301358] rounded-3xl w-full max-w-md mx-auto">
            {/* Background image overlay if provided */}
            {backgroundImage && (
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
                        Get 1.5 GB of internet free of cost, provided by pluxnet
                    </h2>
                </div>

                {/* Checkbox */}
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} >

                        {/* <div className=""> */}
                        <FormField
                            control={form.control}
                            name="termsAccepted"
                            render={({ field }) => (
                                <FormItem className="flex items-start justify-center space-x-3 mb-4">
                                    <FormControl>
                                        <Checkbox
                                            id="terms"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#301358] mt-0.5"
                                        />
                                    </FormControl>
                                    <FormLabel className="text-sm leading-relaxed cursor-pointer">
                                        Accept terms & conditions to continue
                                    </FormLabel>
                                </FormItem>
                            )}
                        />

                        {/* <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                            Accept terms & conditions to continue
                        </label> */}
                        {/* </div> */}

                        {/* CTA Button */}
                        <Button
                            className="w-full bg-white rounded-4xl hover:bg-gray-100 text-[#301358] font-medium py-6  text-base"
                        // disabled={!accepted}
                        >
                            {/* <PlayCircleIcon size={70} className="w-5 h-5 mr-2 fill-white text-[#301358]" /> */}
                            <img src="watch-video-icon.svg" alt="watch video" width={"auth"} height={"auto"} />
                            Watch video to claim
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
