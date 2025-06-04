import type { Route } from "./+types/home";
import { IndexPage } from "../index/index-page";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "PluxNet HotSpot" },
    { name: "PluxNet", content: "PluxNet" },
  ];
}

export default function Home() {
  return <IndexPage />;
}

