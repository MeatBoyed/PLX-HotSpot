import { NextRequest, NextResponse } from "next/server";
import { mikrotik, mikrotikDelete } from "@/lib/mikrotik/client";
import { MikrotikHotspotActive } from "@/lib/mikrotik/types";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const server = req.nextUrl.searchParams.get("server");
    const path = server
      ? `/ip/hotspot/active?server=${encodeURIComponent(server)}`
      : "/ip/hotspot/active";
    const data = await mikrotik<MikrotikHotspotActive[]>(path);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { id, username, server, address } = await req.json();

  logger.info(
    { action: "disconnect_user", id, username, server, address },
    "User disconnected from hotspot"
  );

  try {
    await mikrotikDelete(`/ip/hotspot/active/${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error({ err, id, username }, "Failed to disconnect user");
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}
