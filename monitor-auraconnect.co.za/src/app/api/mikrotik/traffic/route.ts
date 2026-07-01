import { NextRequest, NextResponse } from "next/server";
import { mikrotik } from "@/lib/mikrotik/client";
import { MikrotikInterface, MikrotikTrafficSample } from "@/lib/mikrotik/types";

export async function GET(req: NextRequest) {
  try {
    const iface = req.nextUrl.searchParams.get("interface") ?? "ether1";

    // Fetch interface stats snapshot
    const interfaces = await mikrotik<MikrotikInterface[]>("/interface");

    // Get a single traffic sample via monitor-traffic
    const sample = await mikrotik<MikrotikTrafficSample[]>(
      "/interface/monitor-traffic",
      {
        method: "POST",
        body: JSON.stringify({ interface: iface, once: "" }),
      }
    );

    return NextResponse.json({ interfaces, sample });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}
