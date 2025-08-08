import { NextRequest, NextResponse } from 'next/server'
import { validateClerkHeaders, logSecurityValidation } from '@/utils/clerk-security'
import { requireAdmin } from '@/utils/roles'
import { adminOperations } from '@/database/db-utils'

export async function GET(request: NextRequest) {
  try {
    const validation = validateClerkHeaders(request);
    if (!validation.isValid) {
      logSecurityValidation(validation, '/api/admin/role-preferences');
      return NextResponse.json({ error: 'Invalid security headers' }, { status: 401 });
    }
    const result = await requireAdmin();
    if (result instanceof NextResponse) return result;
    
    const { userId } = result;
    
    const preferences = await adminOperations.getAdminRolePreferences(userId);
    
    return NextResponse.json({
      preferences: preferences || {
        currentViewingRole: null,
        verificationStatusOverride: false
      }
    });
  } catch (error) {
    console.error('Error fetching admin role preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const validation = validateClerkHeaders(request);
    if (!validation.isValid) {
      logSecurityValidation(validation, '/api/admin/role-preferences');
      return NextResponse.json({ error: 'Invalid security headers' }, { status: 401 });
    }
    const result = await requireAdmin();
    if (result instanceof NextResponse) return result;
    
    const { userId } = result;
    
    const body = await request.json();
    
    // Validate input
    if (body.currentViewingRole && !['athlete', 'coach', 'recruiter'].includes(body.currentViewingRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be athlete, coach, or recruiter' },
        { status: 400 }
      );
    }
    
    if (body.verificationStatusOverride !== undefined && typeof body.verificationStatusOverride !== 'boolean') {
      return NextResponse.json(
        { error: 'verificationStatusOverride must be a boolean' },
        { status: 400 }
      );
    }
    
    const preferences = await adminOperations.setAdminRolePreferences(userId, {
      currentViewingRole: body.currentViewingRole,
      verificationStatusOverride: body.verificationStatusOverride
    });
    
    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Error updating admin role preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
} 