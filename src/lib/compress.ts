const MOBILE_BREAKPOINT = 768;
const THRESHOLD_BYTES = 7 * 1024 * 1024; // 7 MB

export async function compressImageIfNeeded(file: File): Promise<File> {
  try {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (!isMobile || !file.type.startsWith("image/") || file.size <= THRESHOLD_BYTES) {
      return file;
    }

    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    const blob: Blob | null = await new Promise((res) =>
      canvas.toBlob((b) => res(b), "image/jpeg", 0.85)
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}
