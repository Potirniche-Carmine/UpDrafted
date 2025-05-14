import { NextResponse } from 'next/server';
import prisma from '@/lib/db'; 

export async function GET() {
  try {
    const newEntry = await prisma.testEntry.create({
      data: {
        message: `App Router: Test message at ${new Date().toISOString()}`,
      },
    });

    const entries = await prisma.testEntry.findMany({
      orderBy: {
        createdAt: 'desc', 
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      newEntry,
      entries,
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Database test API route failed:", error);


    return NextResponse.json({
      success: false,
      error: "Database operation failed.",
      details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
