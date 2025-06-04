"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Checkbox } from "../components/ui/checkbox"
import { Play, PlayCircleIcon, Wifi } from "lucide-react"

interface ConnectCardProps {
    backgroundImage?: string
}

export default function ConnectCard({ backgroundImage }: ConnectCardProps = {}) {
    const [accepted, setAccepted] = useState(false)

    return (
        <div className="relative bg-[#301358] rounded-3xl w-full max-w-sm mx-auto">
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
                {/* Decorative cloud shapes */}
                {/* <div className="absolute top-4 left-8 w-16 h-8 bg-purple-400/30 rounded-full blur-sm"></div>
                <div className="absolute top-8 right-12 w-12 h-6 bg-purple-400/25 rounded-full blur-sm"></div>
                <div className="absolute top-16 left-16 w-10 h-5 bg-purple-400/20 rounded-full blur-sm"></div>
                <div className="absolute bottom-32 right-8 w-14 h-7 bg-purple-400/25 rounded-full blur-sm"></div>
                <div className="absolute bottom-40 left-6 w-8 h-4 bg-purple-400/20 rounded-full blur-sm"></div> */}

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
                <div className="flex items-start justify-center space-x-3 mb-4">
                    <Checkbox
                        id="terms"
                        // checked={accepted}
                        // onCheckedChange={() => setAccepted}
                        className="border-white data-[state=checked]:bg-white data-[state=checked]:text-[#301358] mt-0.5"
                    />
                    <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                        Accept terms & conditions to continue
                    </label>
                </div>

                {/* CTA Button */}
                <Button
                    className="w-full bg-white rounded-4xl hover:bg-gray-100 text-[#301358] font-medium py-6  text-base"
                // disabled={!accepted}
                >
                    {/* <PlayCircleIcon size={70} className="w-5 h-5 mr-2 fill-white text-[#301358]" /> */}
                    <img src="watch-video-icon.svg" alt="watch video" width={"auth"} height={"auto"} />
                    Watch video to claim
                </Button>
            </div>
        </div>
    )
}
