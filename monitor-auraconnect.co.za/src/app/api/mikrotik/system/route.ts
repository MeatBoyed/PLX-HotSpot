import { NextResponse } from "next/server";
import { mikrotik } from "@/lib/mikrotik/client";
import { MikrotikSystemResource } from "@/lib/mikrotik/types";

export async function GET() {
  try {
    const data = await mikrotik<MikrotikSystemResource>("/system/resource");
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 }
    );
  }
}
