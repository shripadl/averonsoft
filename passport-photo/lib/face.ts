import type { FaceBox } from "@passphoto/lib/types";
import { likelyWearingGlasses } from "@passphoto/lib/glasses";

type Landmark = { x: number; y: number; z?: number };

const MEDIAPIPE_NOISE =
  /XNNPACK|TensorFlow Lite|Created TensorFlow|delegate for CPU/i;

function isNoise(args: unknown[]): boolean {
  const first = args[0];
  if (typeof first === "string" && MEDIAPIPE_NOISE.test(first)) return true;
  if (first instanceof Error && MEDIAPIPE_NOISE.test(first.message)) return true;
  return false;
}

let consolePatched = false;

/** MediaPipe logs TFLite INFO via console.error; Next.js treats that as an overlay issue. */
function patchMediaPipeConsole(): void {
  if (consolePatched || typeof console === "undefined") return;
  consolePatched = true;
  const error = console.error.bind(console);
  const warn = console.warn.bind(console);
  const info = console.info.bind(console);
  const log = console.log.bind(console);
  console.error = (...args: unknown[]) => {
    if (isNoise(args)) return;
    error(...args);
  };
  console.warn = (...args: unknown[]) => {
    if (isNoise(args)) return;
    warn(...args);
  };
  console.info = (...args: unknown[]) => {
    if (isNoise(args)) return;
    info(...args);
  };
  console.log = (...args: unknown[]) => {
    if (isNoise(args)) return;
    log(...args);
  };
}

async function withQuietMediaPipeLogs<T>(fn: () => T | Promise<T>): Promise<T> {
  const error = console.error;
  const warn = console.warn;
  const info = console.info;
  const log = console.log;
  console.error = (...args: unknown[]) => {
    if (isNoise(args)) return;
    error.apply(console, args);
  };
  console.warn = (...args: unknown[]) => {
    if (isNoise(args)) return;
    warn.apply(console, args);
  };
  console.info = (...args: unknown[]) => {
    if (isNoise(args)) return;
    info.apply(console, args);
  };
  console.log = (...args: unknown[]) => {
    if (isNoise(args)) return;
    log.apply(console, args);
  };
  try {
    return await fn();
  } finally {
    console.error = error;
    console.warn = warn;
    console.info = info;
    console.log = log;
  }
}

let landmarkerPromise: Promise<{
  detect: (image: HTMLImageElement) => {
    faceLandmarks: Landmark[][];
    faceBlendshapes?: { categories: { categoryName: string; score: number }[] }[];
  };
}> | null = null;

async function getLandmarker() {
  patchMediaPipeConsole();
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FaceLandmarker, FilesetResolver } = await import(
        "@mediapipe/tasks-vision"
      );
      const vision = await withQuietMediaPipeLogs(() =>
        FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm",
        ),
      );
      const options = {
        runningMode: "IMAGE" as const,
        numFaces: 3,
        outputFaceBlendshapes: true,
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      };
      const create = (delegate: "GPU" | "CPU") =>
        withQuietMediaPipeLogs(() =>
          FaceLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: options.modelAssetPath, delegate },
            runningMode: options.runningMode,
            numFaces: options.numFaces,
            outputFaceBlendshapes: options.outputFaceBlendshapes,
          }),
        );
      let landmarker;
      try {
        landmarker = await create("GPU");
      } catch {
        landmarker = await create("CPU");
      }
      return {
        detect: (image: HTMLImageElement) => landmarker.detect(image),
      };
    })();
  }
  return landmarkerPromise;
}

function blendScore(
  shapes: { categoryName: string; score: number }[] | undefined,
  name: string,
): number {
  if (!shapes) return 0;
  return shapes.find((s) => s.categoryName === name)?.score ?? 0;
}

/**
 * Detect faces and estimate chin / crown in source pixels.
 * Landmark 10 is near the hairline; crown is extrapolated to include hair.
 */
export async function detectFace(image: HTMLImageElement): Promise<FaceBox> {
  const landmarker = await getLandmarker();
  const result = await withQuietMediaPipeLogs(() => landmarker.detect(image));
  const faces = result.faceLandmarks;
  if (!faces.length) {
    throw new Error(
      "No face found. Use a clear, front-facing portrait with even lighting.",
    );
  }

  const lm = faces[0]!;
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  const pt = (i: number) => {
    const p = lm[i];
    if (!p) throw new Error("Face landmarks were incomplete.");
    return { x: p.x * w, y: p.y * h };
  };

  const forehead = pt(10);
  const chin = pt(152);
  const left = pt(234);
  const right = pt(454);
  const leftEye = pt(33);
  const rightEye = pt(263);
  const faceH = Math.max(8, chin.y - forehead.y);
  const crown = {
    x: forehead.x,
    y: forehead.y - faceH * 0.42,
  };

  const blinkL = blendScore(result.faceBlendshapes?.[0]?.categories, "eyeBlinkLeft");
  const blinkR = blendScore(result.faceBlendshapes?.[0]?.categories, "eyeBlinkRight");
  const smile =
    (blendScore(result.faceBlendshapes?.[0]?.categories, "mouthSmileLeft") +
      blendScore(result.faceBlendshapes?.[0]?.categories, "mouthSmileRight")) /
    2;
  const jawOpen = blendScore(result.faceBlendshapes?.[0]?.categories, "jawOpen");
  const lookAway = Math.max(
    blendScore(result.faceBlendshapes?.[0]?.categories, "eyeLookDownLeft"),
    blendScore(result.faceBlendshapes?.[0]?.categories, "eyeLookDownRight"),
    blendScore(result.faceBlendshapes?.[0]?.categories, "eyeLookUpLeft"),
    blendScore(result.faceBlendshapes?.[0]?.categories, "eyeLookUpRight"),
  );

  const nose = pt(1);
  const midEyeX = (leftEye.x + rightEye.x) / 2;
  const faceW = Math.max(8, right.x - left.x);
  const yaw = (nose.x - midEyeX) / faceW;
  const pitch = (nose.y - (leftEye.y + rightEye.y) / 2) / faceH - 0.35;

  return {
    chin,
    crown,
    centerX: (left.x + right.x) / 2,
    leftX: Math.min(left.x, right.x),
    rightX: Math.max(left.x, right.x),
    eyeY: (leftEye.y + rightEye.y) / 2,
    faceCount: faces.length,
    eyesOpenLikely: blinkL < 0.45 && blinkR < 0.45,
    glassesLikely: likelyWearingGlasses(image, lm),
    yaw,
    pitch,
    expression: { smile, jawOpen, lookAway },
  };
}
