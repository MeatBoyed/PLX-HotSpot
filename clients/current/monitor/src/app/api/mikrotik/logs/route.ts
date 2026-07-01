import { NextRequest, NextResponse } from "next/server";
import { mikrotik } from "@/lib/mikrotik/client";
import { MikrotikLogEntry } from "@/lib/mikrotik/types";

export async function GET(req: NextRequest) {
  try {
    const topic = req.nextUrl.searchParams.get("topic");
    const path = topic
      ? `/log?topics=${encodeURIComponent(topic)}`
      : "/log";
    const data = await mikrotik<MikrotikLogEntry[]>(path);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}
