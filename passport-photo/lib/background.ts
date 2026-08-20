/**
 * Client-side background removal via `@imgly/background-removal`.
 * Models download to the browser cache; nothing is uploaded.
 */

export type BackgroundRemovalProgress = {
  key: string;
  current: number;
  total: number;
};

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Failed to encode source image")),
      "image/png",
    );
  });
}

async function blobToCanvas(blob: Blob): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to decode cutout"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available in this browser.");
    ctx.drawImage(img, 0, 0);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function removeBackgroundToCanvas(
  source: HTMLCanvasElement,
  onProgress?: (p: BackgroundRemovalProgress) => void,
): Promise<HTMLCanvasElement> {
  const mod = await import("@imgly/background-removal");
  const input = await canvasToBlob(source);
  const config: Record<string, unknown> = {
    model: "isnet_fp16",
    device: "gpu",
    output: { format: "image/png", quality: 0.92 },
  };
  if (onProgress) {
    config.progress = (key: string, current: number, total: number) => {
      onProgress({ key, current, total });
    };
  }
  const outBlob = await mod.removeBackground(input, config);
  return blobToCanvas(outBlob);
}

export function compositeOnColor(
  cutout: HTMLCanvasElement,
  hexColor: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = cutout.width;
  canvas.height = cutout.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.fillStyle = hexColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(cutout, 0, 0);
  return canvas;
}
