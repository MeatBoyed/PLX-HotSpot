import AdBanner from '@/components/revive/ad-banner';

export default function AdSection() {
    return (
        <section className="w-full flex items-center justify-center mt-10">
            <div className="w-full max-w-md">
                <div className="w-full relative">
                    <AdBanner />
                </div>
            </div>
        </section>
    )
}
