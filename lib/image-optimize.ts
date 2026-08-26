/**
 * Resizes and compresses an image file entirely in the browser before
 * upload — keeps product photos small and consistent without needing a
 * server-side image pipeline. Downscales to fit within maxDimension on
 * its longest side (upscales small images are left alone) and re-encodes
 * as JPEG at the given quality.
 */
export async function optimizeImage(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<Blob> {
  const { maxDimension = 900, quality = 0.82 } = options;

  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context.');

  // White background so transparent PNGs don't turn black when flattened to JPEG.
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Image compression failed.'))),
      'image/jpeg',
      quality
    );
  });
}

export const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024; // 8MB pre-optimization cap
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
