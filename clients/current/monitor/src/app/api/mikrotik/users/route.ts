import { NextResponse } from "next/server";
import { mikrotik } from "@/lib/mikrotik/client";
import { MikrotikHotspotUser } from "@/lib/mikrotik/types";

export async function GET() {
  try {
    const data = await mikrotik<MikrotikHotspotUser[]>("/ip/hotspot/user");
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}
