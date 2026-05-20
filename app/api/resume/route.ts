import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const resume = await prisma.resume.create({ data: body });
  return NextResponse.json(resume);
}

export async function GET() {
  const resumes = await prisma.resume.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(resumes);
}
