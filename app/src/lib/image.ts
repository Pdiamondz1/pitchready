// Read an uploaded image file and return a resized JPEG data URL.
// Capping the dimensions keeps the data URL small enough that a few images fit
// comfortably in localStorage (the Tier-0 persistence). No upload, no network —
// the image never leaves the browser.

export function fileToResizedDataUrl(
  file: File,
  maxDim = 1280,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("That file isn't an image."));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load that image."));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Your browser can't process images here."));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL("image/jpeg", quality));
        } catch (err) {
          reject(err instanceof Error ? err : new Error("Could not process that image."));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
