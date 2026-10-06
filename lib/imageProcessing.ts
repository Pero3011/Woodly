// All of this runs in the BROWSER (client side). Nothing is sent to a server.

const MAX_SIDE = 1600; // biggest width/height we allow after enhancing

// ---------- Small helpers ----------

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the image."));
    img.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not export image.")),
      "image/png",
    );
  });
}

const clamp = (n: number) => (n < 0 ? 0 : n > 255 ? 255 : n);

// Makes edges crisper by comparing each pixel with its 4 neighbours.
function sharpen(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amount: number,
) {
  const src = ctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);
  const s = src.data;
  const o = out.data;
  const center = 1 + 4 * amount;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const isEdge = x === 0 || y === 0 || x === w - 1 || y === h - 1;

      for (let c = 0; c < 3; c++) {
        o[i + c] = isEdge
          ? s[i + c]
          : clamp(
              s[i + c] * center -
                amount *
                  (s[i - 4 + c] +
                    s[i + 4 + c] +
                    s[i - w * 4 + c] +
                    s[i + w * 4 + c]),
            );
      }
      o[i + 3] = s[i + 3]; // keep transparency as it is
    }
  }
  ctx.putImageData(out, 0, 0);
}

// ---------- Step 1: enhance quality ----------

export async function enhanceImage(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    // Small images grow up to 2x, big images shrink to MAX_SIDE
    const scale = Math.min(2, MAX_SIDE / longest);
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported.");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.filter = "contrast(1.08) saturate(1.05) brightness(1.02)";
    ctx.drawImage(img, 0, 0, w, h);
    ctx.filter = "none";

    sharpen(ctx, w, h, 0.35);
    return await canvasToBlob(canvas);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ---------- Step 2: remove the background ----------

export async function removeBg(
  image: Blob,
  onProgress?: (percent: number) => void,
): Promise<Blob> {
  // Loaded only when needed, so it does not make the first page load heavy
  const { removeBackground } = await import("@imgly/background-removal");
  return removeBackground(image, {
    progress: (_key: string, current: number, total: number) => {
      if (total > 0) onProgress?.(Math.round((current / total) * 100));
    },
  });
}

// ---------- Step 3: paint the shape on real timber ----------

// Put these 4 pictures in your project at: public/textures/
const TIMBER_TEXTURES: Record<string, string> = {
  "Black Walnut": "/textures/black-walnut-texture.jpg",
  "White Oak": "/textures/white-oak-texture.jpg",
  Cherry: "/textures/cherry-texture.jpg",
  Hinoki: "/textures/hinoki-texture.jpg",
};

// "Black Walnut (Dark & Rich)" -> "/textures/black-walnut-texture.jpg"
export function getTimberTexture(label: string): string {
  const name = label.split(" (")[0].trim();
  return TIMBER_TEXTURES[name] ?? TIMBER_TEXTURES["White Oak"];
}

// Fills the whole canvas with the texture, like CSS "object-fit: cover":
// the picture is scaled until it covers everything, and the extra is cut.
function paintTexture(
  ctx: CanvasRenderingContext2D,
  texture: HTMLImageElement,
  w: number,
  h: number,
) {
  const scale = Math.max(w / texture.naturalWidth, h / texture.naturalHeight);
  const dw = texture.naturalWidth * scale;
  const dh = texture.naturalHeight * scale;
  ctx.drawImage(texture, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

// Takes the (background-free) image and returns a picture of the same
// shape, made of timber. Dark lines of the sketch look "carved" in.
export async function renderOnTimber(
  imageUrl: string,
  textureUrl: string,
): Promise<string> {
  const [img, texture] = await Promise.all([
    loadImage(imageUrl),
    loadImage(textureUrl),
  ]);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported.");

  paintTexture(ctx, texture, w, h);

  // A grey copy of the picture, used for shadows and details
  const shade = document.createElement("canvas");
  shade.width = w;
  shade.height = h;
  const sctx = shade.getContext("2d");
  if (!sctx) throw new Error("Canvas is not supported.");
  sctx.filter = "grayscale(1) contrast(1.3) brightness(1.1)";
  sctx.drawImage(img, 0, 0);

  // multiply = darken the timber where the picture is dark
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(shade, 0, 0);

  // destination-in = keep timber only where the picture exists
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(img, 0, 0);

  ctx.globalCompositeOperation = "source-over";
  return canvas.toDataURL("image/png");
}
