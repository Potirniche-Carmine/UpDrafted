import { NextRequest, NextResponse } from 'next/server';
import { handleVerificationUpload } from '@/database/r2/api/verification-upload';

export const runtime = 'nodejs';

export async function POST(request: NextRequest): Promise<NextResponse> {
  return await handleVerificationUpload(request);
} 