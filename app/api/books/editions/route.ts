import { NextRequest, NextResponse } from "next/server";
import { getEditions } from "@/lib/openLibrary";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workKey = searchParams.get("workKey");

  if (!workKey) {
    return NextResponse.json({ error: "workKey is required" }, { status: 400 });
  }

  const editions = await getEditions(workKey);
  return NextResponse.json(editions);
}
