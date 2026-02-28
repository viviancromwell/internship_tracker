import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  const { internshipId, status, priority, notes } = await request.json();

  if (!internshipId) {
    return NextResponse.json(
      { error: "internshipId required" },
      { status: 400 }
    );
  }

  const tracking = await prisma.userInternship.upsert({
    where: {
      userId_internshipId: { userId, internshipId },
    },
    update: {
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(notes !== undefined && { notes }),
    },
    create: {
      userId,
      internshipId,
      status: status || "Not Started",
      priority: priority || 0,
      notes: notes || null,
    },
  });

  return NextResponse.json(tracking);
}
