import { NextRequest, NextResponse } from 'next/server';
import { handleVerificationSubmit } from '@/database/r2/api/verification-submit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  return await handleVerificationSubmit(request);
} 