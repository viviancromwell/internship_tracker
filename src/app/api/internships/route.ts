import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  const userField = (session.user as Record<string, unknown>).field as string;

  const internships = await prisma.internship.findMany({
    where: { field: userField, active: true },
    include: {
      tracking: {
        where: { userId },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const result = internships.map((i) => ({
    id: i.id,
    company: i.company,
    role: i.role,
    category: i.category,
    location: i.location,
    description: i.description,
    url: i.url,
    deadline: i.deadline,
    period: i.period,
    paid: i.paid,
    availability: i.availability,
    undergradEligible: i.undergradEligible,
    contact: i.contact,
    tooltip: {
      about: i.tooltipAbout,
      candidate: i.tooltipCandidate,
      skills: i.tooltipSkills,
      materials: i.tooltipMaterials,
    },
    status: i.tracking[0]?.status || "Not Started",
    priority: i.tracking[0]?.priority || 0,
    notes: i.tracking[0]?.notes || null,
  }));

  return NextResponse.json({ internships: result, field: userField });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userField = (session.user as Record<string, unknown>).field as string;
  const data = await request.json();

  const internship = await prisma.internship.create({
    data: {
      field: userField,
      company: data.company,
      role: data.role,
      category: data.category,
      location: data.location || "",
      description: data.description || "",
      url: data.url || null,
      deadline: data.deadline || null,
      period: data.period || null,
      paid: data.paid || false,
      availability: data.availability || "check",
      undergradEligible: data.undergradEligible !== false,
      contact: data.contact || null,
      tooltipAbout: data.tooltip?.about || null,
      tooltipCandidate: data.tooltip?.candidate || null,
      tooltipSkills: data.tooltip?.skills || null,
      tooltipMaterials: data.tooltip?.materials || null,
    },
  });

  return NextResponse.json(internship);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  if (!data.id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  const internship = await prisma.internship.update({
    where: { id: data.id },
    data: {
      company: data.company,
      role: data.role,
      category: data.category,
      location: data.location,
      description: data.description,
      url: data.url || null,
      deadline: data.deadline || null,
      period: data.period || null,
      paid: data.paid || false,
      availability: data.availability || "check",
      undergradEligible: data.undergradEligible !== false,
      contact: data.contact || null,
      tooltipAbout: data.tooltip?.about || null,
      tooltipCandidate: data.tooltip?.candidate || null,
      tooltipSkills: data.tooltip?.skills || null,
      tooltipMaterials: data.tooltip?.materials || null,
    },
  });

  return NextResponse.json(internship);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  await prisma.internship.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ success: true });
}
