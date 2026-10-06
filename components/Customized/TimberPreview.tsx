"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Loader2, FileText } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  enhanceImage,
  getTimberTexture,
  removeBg,
  renderOnTimber,
} from "@/lib/imageProcessing";

interface TimberPreviewProps {
  file: File | null;
  timberVariety: string;
}

type View = "simulation" | "3d" | "original";
type Status = "idle" | "working" | "ready" | "error";

// ---------- Small helpers for the 3D view ----------

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the image."));
    img.src = src;
  });
}

// ---------- The cutting plan ----------
// A black & white picture:  WHITE = wood stays,  BLACK = wood is cut away.
//
// The rule is now simple:
//   - A pixel DARKER than the middle line  -> cut it.
//   - A pixel BRIGHTER than the middle line -> keep it.
// There is no halo any more. A small empty frame stays around the picture.
//
// IMPORTANT: we use the picture BEFORE background removal. If we used the
// cut-out picture, the white lines inside the bird would count as "see-through"
// and would be cut by mistake.

const MAX_SIDE = 1200; // big pictures are made smaller so this stays fast
const SOFTNESS = 28; // how wide the soft edge is (bigger = softer)

async function makeCarveMask(
  sourceUrl: string,
  threshold: number,
): Promise<string> {
  const img = await loadImage(sourceUrl);

  // Make the picture smaller if it is huge
  const scale = Math.min(
    1,
    MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight),
  );
  const iw = Math.round(img.naturalWidth * scale);
  const ih = Math.round(img.naturalHeight * scale);
  const pad = Math.round(Math.max(iw, ih) * 0.12); // the frame around
  const W = iw + pad * 2;
  const H = ih + pad * 2;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not supported.");

  // Paint everything white first (the frame and any see-through parts
  // become white = they stay as wood), then draw the picture on top.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(img, pad, pad, iw, ih);

  const imageData = ctx.getImageData(0, 0, W, H);
  const d = imageData.data;

  for (let i = 0, n = W * H; i < n; i++) {
    const p = i * 4;
    const lum = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];

    // Soft edge: far below the line = 0 (cut), far above = 255 (stay).
    // Exactly on the line = 128, and the board cuts at 0.5 (alphaTest),
    // so the cut follows the true curve of your picture.
    const t = (lum - threshold) / SOFTNESS + 0.5;
    const v = Math.round(Math.max(0, Math.min(1, t)) * 255);

    d[p] = d[p + 1] = d[p + 2] = v;
    d[p + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(URL.createObjectURL(blob))
          : reject(new Error("Could not export the cutting plan.")),
      "image/png",
    );
  });
}

// ---------- The 3D board ----------

const BOARD_SIZE = 2.6; // size of the longest side in 3D units
const THICKNESS = 0.22; // how thick the whole board is
const POCKET = 0.12; // how deep we cut
const LAYERS = 30; // thin sheets stacked inside the cut (they make the walls)
const DEEPEST_SHADE = 0.7; // 1 = same as top, lower = darker walls

function CarvedBoard({
  textureUrl,
  maskUrl,
}: {
  textureUrl: string;
  maskUrl: string;
}) {
  const wood = useTexture(textureUrl, (t) => {
    const tex = Array.isArray(t) ? t[0] : t;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
  });
  const mask = useTexture(maskUrl);

  const maskImg = mask.image as HTMLImageElement;
  const aspect = maskImg.width / maskImg.height;
  const width = aspect >= 1 ? BOARD_SIZE : BOARD_SIZE * aspect;
  const height = aspect >= 1 ? BOARD_SIZE / aspect : BOARD_SIZE;

  // Fit the wood picture on the board without stretching it
  const boardWood = useMemo(() => {
    const t = wood.clone();
    const img = wood.image as HTMLImageElement;
    const texAspect = img.width / img.height;
    if (aspect > texAspect) {
      const ry = texAspect / aspect;
      t.repeat.set(1, ry);
      t.offset.set(0, (1 - ry) / 2);
    } else {
      const rx = aspect / texAspect;
      t.repeat.set(rx, 1);
      t.offset.set((1 - rx) / 2, 0);
    }
    t.needsUpdate = true;
    return t;
  }, [wood, aspect]);

  const baseThickness = THICKNESS - POCKET;

  return (
    <group>
      {/* The top part of the board. Every sheet has the same holes
          (alphaMap), so together they make straight walls. Deeper sheets
          are a little darker, like a soft shadow inside a cut. */}
      {Array.from({ length: LAYERS }, (_, i) => {
        const shade = 1 - (1 - DEEPEST_SHADE) * (i / (LAYERS - 1));
        return (
          <mesh key={i} position={[0, 0, -(i / LAYERS) * POCKET]}>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial
              map={boardWood}
              alphaMap={mask}
              alphaTest={0.5}
              side={THREE.DoubleSide}
              roughness={0.8}
              color={new THREE.Color(shade, shade, shade)}
            />
          </mesh>
        );
      })}

      {/* The floor of the cut: the SAME wood, but darker brown (not black) */}
      <mesh position={[0, 0, -POCKET - 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={boardWood} color="#8a6a4c" roughness={0.9} />
      </mesh>

      {/* The solid wood under the cut. It also gives the board its sides. */}
      <mesh position={[0, 0, -POCKET - baseThickness / 2 - 0.002]}>
        <boxGeometry args={[width, height, baseThickness]} />
        <meshStandardMaterial map={boardWood} color="#b0b0b0" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Board3D({
  textureUrl,
  maskUrl,
}: {
  textureUrl: string;
  maskUrl: string;
}) {
  return (
    <Canvas
      camera={{ position: [2.2, -1.6, 4.2], fov: 35 }}
      dpr={[1, 2]}
      className="touch-pan-y"
    >
      {/* Soft light from the top-left, plus light from everywhere */}
      <ambientLight intensity={2.2} />
      <directionalLight position={[-3, 3, 5]} intensity={2.5} />
      <directionalLight position={[3, -1, 3]} intensity={1.2} />
      <Suspense fallback={null}>
        <CarvedBoard textureUrl={textureUrl} maskUrl={maskUrl} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={1.2}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(Math.PI * 3) / 4}
      />
    </Canvas>
  );
}

// ---------- The main component ----------

export default function TimberPreview({
  file,
  timberVariety,
}: TimberPreviewProps) {
  const [view, setView] = useState<View>("simulation");
  const [removeBackground, setRemoveBackground] = useState(true);
  const [canUse3D] = useState(() => hasWebGL());

  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  // NEW: the picture after enhancing but BEFORE background removal.
  // The cutting plan is made from this one.
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [cutoutUrl, setCutoutUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [maskUrl, setMaskUrl] = useState<string | null>(null);

  // Slider 0..100. 50 = the middle line. Right = cut more, left = cut less.
  const [cutAmount, setCutAmount] = useState(50);

  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const isPdf = file?.type === "application/pdf";

  // Effect A: show the original file
  useEffect(() => {
    if (!file || isPdf) return;
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isPdf]);

  // Effect B: enhance the image, then (optionally) remove its background.
  useEffect(() => {
    if (!file || isPdf) return;

    let ignore = false;
    let enhancedBlobUrl: string | null = null;
    let cutoutBlobUrl: string | null = null;

    async function process() {
      setStatus("working");
      setProgress(0);
      setMessage(null);
      setResultUrl(null);
      setMaskUrl(null);

      try {
        const enhanced: Blob = await enhanceImage(file as File);
        enhancedBlobUrl = URL.createObjectURL(enhanced);

        let blob: Blob = enhanced;
        if (removeBackground) {
          blob = await removeBg(enhanced, (p) => {
            if (!ignore) setProgress(p);
          });
        }
        if (ignore) return;

        cutoutBlobUrl = URL.createObjectURL(blob);
        setEnhancedUrl(enhancedBlobUrl);
        setCutoutUrl(cutoutBlobUrl);
      } catch (err) {
        console.error("Preview error:", err);
        if (!ignore) {
          setStatus("error");
          setMessage(
            "We could not prepare the preview. You can still submit your request.",
          );
        }
      }
    }

    process();

    return () => {
      ignore = true;
      if (enhancedBlobUrl) URL.revokeObjectURL(enhancedBlobUrl);
      if (cutoutBlobUrl) URL.revokeObjectURL(cutoutBlobUrl);
    };
  }, [file, isPdf, removeBackground]);

  // Effect C: paint the shape on timber (2D picture).
  useEffect(() => {
    if (!cutoutUrl) return;

    let ignore = false;
    renderOnTimber(cutoutUrl, getTimberTexture(timberVariety))
      .then((url) => {
        if (ignore) return;
        setResultUrl(url);
        setStatus("ready");
      })
      .catch(() => {
        if (ignore) return;
        setStatus("error");
        setMessage("We could not draw the timber simulation.");
      });

    return () => {
      ignore = true;
    };
  }, [cutoutUrl, timberVariety]);

  // Effect D: make the cutting plan for the 3D board.
  // The small delay (250 ms) waits until the slider stops moving.
  useEffect(() => {
    if (!enhancedUrl || !canUse3D) return;

    let ignore = false;
    let createdUrl: string | null = null;

    // slider 50 -> middle line about 130. Slider 0 -> 60. Slider 100 -> 200.
    const threshold = 60 + cutAmount * 1.4;

    const timer = setTimeout(() => {
      makeCarveMask(enhancedUrl, threshold)
        .then((url) => {
          if (ignore) {
            URL.revokeObjectURL(url);
            return;
          }
          createdUrl = url;
          setMaskUrl(url);
        })
        .catch(() => {
          if (!ignore) setMaskUrl(null);
        });
    }, 250);

    return () => {
      ignore = true;
      clearTimeout(timer);
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [enhancedUrl, canUse3D, cutAmount]);

  const tabBase =
    "px-4 py-1.5 rounded-md text-sm font-medium transition-colors";
  const tabOn = "bg-primary text-secondary";
  const tabOff = "text-primary/70 hover:text-primary";

  const tabs: { id: View; label: string; disabled?: boolean }[] = [
    { id: "simulation", label: "2D" },
    { id: "3d", label: "3D", disabled: !canUse3D || isPdf },
    { id: "original", label: "Your sketch" },
  ];

  const loader = (
    <div className="flex flex-col items-center gap-2 text-neutral">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-sm">
        Preparing your preview
        {progress > 0 && progress < 100 ? `... ${progress}%` : "..."}
      </p>
    </div>
  );

  function renderStage() {
    if (isPdf) {
      return (
        <div className="flex flex-col items-center gap-2 px-6 text-center text-neutral">
          <FileText className="w-8 h-8" />
          <p className="text-sm">
            PDF files cannot be previewed. Our artisans will open it when they
            review your request.
          </p>
        </div>
      );
    }

    if (view === "original") {
      return (
        originalUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={originalUrl}
            alt="Your uploaded sketch"
            className="h-full w-full object-contain"
          />
        )
      );
    }

    if (status === "error") {
      return <p className="px-6 text-center text-sm text-red-600">{message}</p>;
    }

    if (status !== "ready" || !resultUrl) return loader;

    if (view === "3d") {
      if (!maskUrl) return loader;
      return (
        <>
          <Board3D
            textureUrl={getTimberTexture(timberVariety)}
            maskUrl={maskUrl}
          />
          <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs text-neutral">
            Drag to turn the piece
          </p>
        </>
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resultUrl}
        alt="Simulation of your piece in timber"
        className="h-full w-full object-contain p-4 drop-shadow-[0_12px_20px_rgba(107,66,38,0.25)]"
      />
    );
  }

  return (
    <div className="bg-canvas rounded-2xl p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-serif text-lg text-primary">Timber Preview</h3>
          <p className="text-sm text-neutral">
            A simulation in {timberVariety.split(" (")[0]}. The real piece will
            be carved by hand.
          </p>
        </div>

        <div className="flex gap-1 rounded-lg bg-secondary p-1 border border-primary/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              disabled={tab.disabled}
              onClick={() => setView(tab.id)}
              className={`${tabBase} ${view === tab.id ? tabOn : tabOff} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-primary/10 bg-secondary flex items-center justify-center">
        {renderStage()}
      </div>

      {view === "3d" && !isPdf && (
        <div className="mt-4">
          <label className="flex items-center gap-3 text-sm text-primary">
            <span className="w-32 shrink-0">Carving amount</span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={cutAmount}
              onChange={(e) => setCutAmount(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <span className="w-10 text-right tabular-nums">{cutAmount}%</span>
          </label>
          <p className="mt-1 text-xs text-neutral">
            Black parts of your image are cut through the wood and white parts
            stay. Move right to cut more, left to cut less.
          </p>
        </div>
      )}

      {!isPdf && (
        <label className="mt-4 flex items-center gap-2 text-sm text-primary cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={removeBackground}
            onChange={(e) => setRemoveBackground(e.target.checked)}
            className="w-4 h-4 accent-primary cursor-pointer"
          />
          Remove the background of my image
        </label>
      )}
    </div>
  );
}
