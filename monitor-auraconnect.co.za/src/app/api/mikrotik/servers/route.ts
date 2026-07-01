import { NextResponse } from "next/server";
import { mikrotik } from "@/lib/mikrotik/client";
import { MikrotikHotspotServer } from "@/lib/mikrotik/types";

export async function GET() {
  try {
    const data = await mikrotik<MikrotikHotspotServer[]>("/ip/hotspot");
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}
