import { NextResponse } from "next/server";
import { getCommitCount } from "@/lib/commits";

export async function GET() {
  const total = await getCommitCount();
  return NextResponse.json({ total });
}
