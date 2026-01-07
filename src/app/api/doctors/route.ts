import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const doctors = await db.doctor.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}