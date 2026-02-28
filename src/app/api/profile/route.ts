import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    field: user.field,
    profile: user.profile
      ? {
          school: user.profile.school,
          graduationYear: user.profile.graduationYear,
          major: user.profile.major,
          bio: user.profile.bio,
          interests: JSON.parse(user.profile.interests),
          locations: JSON.parse(user.profile.locations),
        }
      : null,
  });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  const data = await request.json();

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {
      school: data.school,
      graduationYear: data.graduationYear ? parseInt(data.graduationYear) : null,
      major: data.major,
      bio: data.bio,
      interests: JSON.stringify(data.interests || []),
      locations: JSON.stringify(data.locations || []),
    },
    create: {
      userId,
      school: data.school,
      graduationYear: data.graduationYear ? parseInt(data.graduationYear) : null,
      major: data.major,
      bio: data.bio,
      interests: JSON.stringify(data.interests || []),
      locations: JSON.stringify(data.locations || []),
    },
  });

  return NextResponse.json(profile);
}
