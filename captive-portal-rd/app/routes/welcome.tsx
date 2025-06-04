import type { Route } from "./+types/home";
import { WelcomePage } from "../welcome/welcome-page";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "PluxNet HotSpot" },
        { name: "PluxNet", content: "PluxNet" },
    ];
}

export default function Home() {
    return <WelcomePage />;
}

