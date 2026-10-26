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
} from "@/lib/imageProcessing";

interface TimberPreviewProps {
  file: File | null;
  timberVariety: string;
}

type View = "3d" | "original";
type Status = "idle" | "working" | "ready" | "error";

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

// ⚡ OPTIMIZATION 1: تصغير حجم الصورة المستخدمة في الماسك لـ 512px كحد أقصى (سرعة خيالية في المعالجة)
const MAX_SIDE = 512;
const SOFTNESS = 24;

async function makeCarveMask(
  sourceUrl: string,
  threshold: number,
): Promise<string> {
  const img = await loadImage(sourceUrl);

  const scale = Math.min(
    1,
    MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight),
  );
  const iw = Math.round(img.naturalWidth * scale);
  const ih = Math.round(img.naturalHeight * scale);
  const pad = Math.round(Math.max(iw, ih) * 0.1);
  const W = iw + pad * 2;
  const H = ih + pad * 2;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not supported.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(img, pad, pad, iw, ih);

  const imageData = ctx.getImageData(0, 0, W, H);
  const d = imageData.data;

  for (let i = 0, n = W * H; i < n; i++) {
    const p = i * 4;
    const lum = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
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

// ---------- 3D Performance Settings ----------
const BOARD_SIZE = 2.6;
const THICKNESS = 0.2;
const POCKET = 0.12;
// ⚡ OPTIMIZATION 2: تقليل الـ Layers من 40 لـ 8 فقط للحفاظ على 60 FPS ودون أي ثقل في الـ GPU
const LAYERS = 8;
const DEEPEST_SHADE = 0.35;

function CarvedBoard({
  textureUrl,
  maskUrl,
  timberVariety,
}: {
  textureUrl: string;
  maskUrl: string;
  timberVariety: string;
}) {
  const wood = useTexture(textureUrl, (t) => {
    const tex = Array.isArray(t) ? t[0] : t;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter; // ⚡ خامة خفيفة
  });
  const mask = useTexture(maskUrl);

  const maskImg = mask.image as HTMLImageElement;
  const aspect = maskImg.width / maskImg.height;
  const width = aspect >= 1 ? BOARD_SIZE : BOARD_SIZE * aspect;
  const height = aspect >= 1 ? BOARD_SIZE / aspect : BOARD_SIZE;

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

  const pocketColor = useMemo(() => {
    const lowerVariety = timberVariety.toLowerCase();
    if (lowerVariety.includes("walnut") || lowerVariety.includes("dark")) {
      return "#f0e6d8"; // أرضية فاتحة جداً للخشب الغامق
    }
    return "#4a3525"; // أرضية متباينة للأخشاب الفاتحة
  }, [timberVariety]);

  const baseThickness = THICKNESS - POCKET;

  return (
    <group>
      {/* 8 طبقات فقط تعطي ظل عميق وسلس جداً في الدوران */}
      {Array.from({ length: LAYERS }, (_, i) => {
        const factor = i / (LAYERS - 1);
        const shade = 1 - (1 - DEEPEST_SHADE) * Math.pow(factor, 0.7);
        return (
          <mesh key={i} position={[0, 0, -factor * POCKET]}>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial
              map={boardWood}
              alphaMap={mask}
              alphaTest={0.45}
              side={THREE.DoubleSide}
              roughness={0.7}
              color={new THREE.Color(shade, shade, shade)}
            />
          </mesh>
        );
      })}

      {/* خلفية التفرغ الداخلية */}
      <mesh position={[0, 0, -POCKET - 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={pocketColor} roughness={0.8} />
      </mesh>

      {/* لوح الخشب الرئيسي */}
      <mesh position={[0, 0, -POCKET - baseThickness / 2 - 0.002]}>
        <boxGeometry args={[width, height, baseThickness]} />
        <meshStandardMaterial map={boardWood} color="#cccccc" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Board3D({
  textureUrl,
  maskUrl,
  timberVariety,
}: {
  textureUrl: string;
  maskUrl: string;
  timberVariety: string;
}) {
  return (
    <Canvas
      camera={{ position: [2.2, -1.6, 4.2], fov: 35 }}
      dpr={[1, 1.5]} // ⚡ OPTIMIZATION 3: تحديد الـ DPR بحد أقصى 1.5 يقلل الضغط على الشاشات العالية (4K/Retina)
      className="touch-pan-y"
    >
      <ambientLight intensity={1.6} />
      <directionalLight position={[-4, 4, 5]} intensity={2.8} />
      <directionalLight position={[4, -2, 3]} intensity={1.0} />

      <Suspense fallback={null}>
        <CarvedBoard
          textureUrl={textureUrl}
          maskUrl={maskUrl}
          timberVariety={timberVariety}
        />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={1.0}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(Math.PI * 3) / 4}
      />
    </Canvas>
  );
}

export default function TimberPreview({
  file,
  timberVariety,
}: TimberPreviewProps) {
  const [view, setView] = useState<View>("3d");
  const [removeBackground, setRemoveBackground] = useState(false); // ⚡ افتراضياً false لتفادي تأخير removeBg إلا لو المستخدم طلبها
  const [canUse3D] = useState(() => hasWebGL());

  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [maskUrl, setMaskUrl] = useState<string | null>(null);

  const [cutAmount, setCutAmount] = useState(50);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const isPdf = file?.type === "application/pdf";

  useEffect(() => {
    if (!file || isPdf) return;
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, isPdf]);

  // ⚡ معالجة الصورة بشكل سريع ودون انتظار طويل
  useEffect(() => {
    if (!file || isPdf) return;

    let ignore = false;
    let enhancedBlobUrl: string | null = null;

    async function process() {
      setStatus("working");
      setMessage(null);

      try {
        // إذا لم يختر إزالة الخلفية، نستخدم الصورة فوراً
        let blob: Blob = file as File;

        if (removeBackground) {
          const enhanced = await enhanceImage(file as File);
          blob = await removeBg(enhanced, () => {});
        }

        if (ignore) return;
        enhancedBlobUrl = URL.createObjectURL(blob);
        setEnhancedUrl(enhancedBlobUrl);
        setStatus("ready");
      } catch (err) {
        console.error("Preview error:", err);
        if (!ignore) {
          setStatus("error");
          setMessage("Could not prepare 3D preview.");
        }
      }
    }

    process();

    return () => {
      ignore = true;
      if (enhancedBlobUrl) URL.revokeObjectURL(enhancedBlobUrl);
    };
  }, [file, isPdf, removeBackground]);

  // ⚡ OPTIMIZATION 4: تقليل زمن الـ Debounce من 250ms إلى 80ms لتجاوب فوري مع السلايدر
  useEffect(() => {
    if (!enhancedUrl || !canUse3D) return;

    let ignore = false;
    let createdUrl: string | null = null;

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
    }, 80);

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
    { id: "3d", label: "3D Preview", disabled: !canUse3D || isPdf },
    { id: "original", label: "Your sketch" },
  ];

  const loader = (
    <div className="flex flex-col items-center gap-2 text-neutral">
      <Loader2 className="w-6 h-6 animate-spin" />
      <p className="text-sm">Generating 3D model...</p>
    </div>
  );

  function renderStage() {
    if (isPdf) {
      return (
        <div className="flex flex-col items-center gap-2 px-6 text-center text-neutral">
          <FileText className="w-8 h-8" />
          <p className="text-sm">PDF files cannot be previewed in 3D.</p>
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

    if (status !== "ready" || !maskUrl) return loader;

    return (
      <>
        <Board3D
          textureUrl={getTimberTexture(timberVariety)}
          maskUrl={maskUrl}
          timberVariety={timberVariety}
        />
        <p className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs text-neutral">
          Drag to turn the piece
        </p>
      </>
    );
  }

  return (
    <div className="bg-canvas rounded-2xl p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="font-serif text-lg text-primary">Timber Preview</h3>
          <p className="text-sm text-neutral">
            A 3D simulation in {timberVariety.split(" (")[0]}.
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
          Remove background (takes a few extra seconds)
        </label>
      )}
    </div>
  );
}
