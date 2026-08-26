import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireAdmin, isSessionUser } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'product-images';
const MAX_SIZE_BYTES = 3 * 1024 * 1024; // images arrive already optimized client-side
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

// POST an image file (multipart/form-data, field name "file") — admin only.
// Returns { url } pointing at the uploaded, publicly-readable image.
export async function POST(request: Request) {
  const userOrResponse = await requireAdmin();
  if (!isSessionUser(userOrResponse)) return userOrResponse;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Unsupported image type. Use JPEG, PNG, or WebP.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'Image is too large.' }, { status: 400 });
    }

    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${randomUUID()}.${extension}`;

    const admin = createAdminClient();
    const arrayBuffer = await file.arrayBuffer();

    // Ensure the storage bucket exists (idempotent — safe to call every
    // upload; only actually creates it once).
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.some((b) => b.name === BUCKET)) {
      const { error: bucketError } = await admin.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_SIZE_BYTES,
      });
      if (bucketError && !bucketError.message.toLowerCase().includes('already exists')) {
        console.error('Bucket creation error:', bucketError);
        return NextResponse.json({ error: 'Failed to set up image storage.' }, { status: 500 });
      }
    }

    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
    }

    const { data } = admin.storage.from(BUCKET).getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl }, { status: 201 });
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 });
  }
}
