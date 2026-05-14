import { NextResponse } from 'next/server';
import { requireSession } from '@/utils/roles';
import { getTransferPortalCommunicationStatus } from '@/database/db-utils';

export async function GET() {
  const auth = await requireSession();
  if (auth instanceof NextResponse) return auth;

  const { userId, role } = auth;

  if (!role) {
    return NextResponse.json({
      success: true,
      status: {
        isD1D2Athlete: false,
        hasApprovedTransferPortalVerification: false,
        isCommunicationLocked: false,
        currentRequestStatus: null,
      },
    });
  }

  const status = await getTransferPortalCommunicationStatus(userId);

  return NextResponse.json({
    success: true,
    status,
  });
}
