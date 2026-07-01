import { NextResponse } from "next/server";
import { mikrotik } from "@/lib/mikrotik/client";
import { MikrotikDhcpLease } from "@/lib/mikrotik/types";

export async function GET() {
  try {
    const data = await mikrotik<MikrotikDhcpLease[]>("/ip/dhcp-server/lease");
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}
