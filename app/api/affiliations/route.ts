import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const affiliations = await prisma.professionalAffiliation.findMany({
      where: { published: true },
      orderBy: { displayOrder: 'asc' }
    });

    return NextResponse.json({ affiliations });
  } catch (error) {
    console.error('Error fetching affiliations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliations' },
      { status: 500 }
    );
  }
}
