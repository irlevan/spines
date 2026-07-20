import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (typeof body.timestamp !== "string") {
    return NextResponse.json({ error: "timestamp is required" }, { status: 400 });
  }

  try {
    const log = await prisma.progressLog.update({
      where: { id },
      data: { timestamp: new Date(body.timestamp) },
    });
    return NextResponse.json(log);
  } catch {
    return NextResponse.json({ error: "Log not found" }, { status: 404 });
  }
}
