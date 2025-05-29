import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadVerificationFile } from '@/lib/r2';
import { db } from '@/lib/db';
import { verificationRequests, verificationFiles } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const verificationRequestId = formData.get('verificationRequestId') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!verificationRequestId) {
      return NextResponse.json({ error: 'No verification request ID provided' }, { status: 400 });
    }

    // Verify that the verification request belongs to the current user
    const verificationRequest = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.id, parseInt(verificationRequestId)))
      .limit(1);

    if (verificationRequest.length === 0 || verificationRequest[0].userId !== userId) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 });
    }

    // Validate file type and size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large (max 10MB)' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Upload to R2
    const { key, url } = await uploadVerificationFile(
      file,
      userId,
      parseInt(verificationRequestId)
    );

    // Determine file type
    const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

    // Save to database
    const [savedFile] = await db
      .insert(verificationFiles)
      .values({
        verificationRequestId: parseInt(verificationRequestId),
        fileName: file.name,
        fileType,
        fileUrl: url,
        r2Key: key,
        description: description || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      file: {
        id: savedFile.id,
        fileName: savedFile.fileName,
        fileType: savedFile.fileType,
        fileUrl: savedFile.fileUrl,
        description: savedFile.description,
      },
    });

  } catch (error) {
    console.error('Error uploading verification file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 