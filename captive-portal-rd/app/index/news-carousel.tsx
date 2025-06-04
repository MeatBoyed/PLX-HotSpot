import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "../components/ui/carousel"

export function NewsCarousel() {
    return (
        <Carousel className="w-full max-w-sm">
            {/* <CarouselPrevious />
            <CarouselNext /> */}
            <CarouselContent className="-ml-1">
                {Array.from({ length: 5 }).map((_, index) => (
                    <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1">
                            <NewsCard />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    )
}

export function NewsCard() {
    return (
        <div className="flex justify-start items-start gap-2.5 bg-gray-100 rounded-lg p-3 shadow-md">
            <img src="news-img-1.png" alt="news image" className="min-w-20 min-h-20 rounded-md" />
            <div className="news-slide-info">
                <h6 className="font-medium text-base">Bond Market Shudders as Tax Bill Deepens Deficit Worries</h6>
            </div>
        </div>
    )
}