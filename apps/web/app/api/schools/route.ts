import { NextRequest, NextResponse } from 'next/server';
import { schoolOperations } from '@/database/db-utils';
import { requireSession } from "@/utils/roles";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '15');
    const classification = searchParams.get('classification') as 'high_school' | 'college' | 'university' | 'professional' | 'other' | null;

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const schools = await schoolOperations.searchSchools(query, limit, classification || undefined);
    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error searching schools:', error);
    return NextResponse.json(
      { error: 'Failed to search schools' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { name, classification } = body;

    if (!name || !classification) {
      return NextResponse.json(
        { error: 'School name and classification are required' },
        { status: 400 }
      );
    }

    const school = await schoolOperations.getOrCreateSchool(
      name,
      classification
    );

    return NextResponse.json(school);
  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json(
      { error: 'Failed to create school' },
      { status: 500 }
    );
  }
}
