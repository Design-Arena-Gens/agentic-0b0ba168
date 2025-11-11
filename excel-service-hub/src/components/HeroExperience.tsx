"use client";

import dynamic from "next/dynamic";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import OfficeZone from "@/components/three/OfficeZone";
import DataChoreography from "@/components/three/DataChoreography";
import BrandPortal from "@/components/three/BrandPortal";

const TOTAL_DURATION = 48;

type Stage = 0 | 1 | 2;

interface CinematicExperienceProps {
  started: boolean;
  onStageChange(stage: Stage): void;
  timelineRef: MutableRefObject<number>;
  onComplete(): void;
}

const keyframes = [
  {
    time: 0,
    position: [-6, 4, 12],
    lookAt: [0, 2, 0],
  },
  {
    time: 14,
    position: [0, 3, 8],
    lookAt: [0, 2, 0],
  },
  {
    time: 22,
    position: [4, 2, 4],
    lookAt: [0, 1.5, 0],
  },
  {
    time: 32,
    position: [0, 4, -2],
    lookAt: [0, 2.5, 0],
  },
  {
    time: TOTAL_DURATION,
    position: [0, 5, 10],
    lookAt: [0, 2, 0],
  },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getKeyframeSnapshot(time: number) {
  const clamped = Math.min(time, TOTAL_DURATION - 0.0001);
  for (let i = 0; i < keyframes.length - 1; i += 1) {
    const current = keyframes[i];
    const next = keyframes[i + 1];
    if (clamped >= current.time && clamped <= next.time) {
      const localT =
        (clamped - current.time) / (next.time - current.time || 1);
      return {
        position: [
          lerp(current.position[0], next.position[0], localT),
          lerp(current.position[1], next.position[1], localT),
          lerp(current.position[2], next.position[2], localT),
        ] as [number, number, number],
        lookAt: [
          lerp(current.lookAt[0], next.lookAt[0], localT),
          lerp(current.lookAt[1], next.lookAt[1], localT),
          lerp(current.lookAt[2], next.lookAt[2], localT),
        ] as [number, number, number],
      };
    }
  }
  const last = keyframes[keyframes.length - 1];
  return {
    position: last.position as [number, number, number],
    lookAt: last.lookAt as [number, number, number],
  };
}

const CinematicExperience = ({
  started,
  onStageChange,
  timelineRef,
  onComplete,
}: CinematicExperienceProps) => {
  const stageRef = useRef<Stage>(0);
  const hasCompletedRef = useRef(false);

  useFrame((state, delta) => {
    if (!started) return;
    timelineRef.current = Math.min(
      timelineRef.current + delta,
      TOTAL_DURATION,
    );
    const snapshot = getKeyframeSnapshot(timelineRef.current);

    state.camera.position.set(...snapshot.position);
    state.camera.lookAt(...snapshot.lookAt);

    let stage: Stage = 0;
    if (timelineRef.current >= 30) stage = 2;
    else if (timelineRef.current >= 16) stage = 1;
    else stage = 0;

    if (stage !== stageRef.current) {
      stageRef.current = stage;
      onStageChange(stage);
    }

    if (timelineRef.current >= TOTAL_DURATION && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete();
    }

    if (timelineRef.current < TOTAL_DURATION) {
      hasCompletedRef.current = false;
    }
  });

  return (
    <>
      <color attach="background" args={["#04070f"]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        intensity={2.4}
        position={[6, 12, 8]}
        castShadow
        color="#edf4ff"
      />
      <spotLight
        intensity={1.8}
        position={[-5, 8, 3]}
        angle={0.7}
        color="#9bd4ff"
      />
      <Stars depth={80} factor={6} fade speed={0.4} />

      <Float speed={0.9} rotationIntensity={0.05} floatIntensity={0.4}>
        <group>
          <OfficeZone emphasized />
          <DataChoreography timelineRef={timelineRef} />
          <BrandPortal timelineRef={timelineRef} />
        </group>
      </Float>

      <Environment preset="city" />
      <EffectComposer>
        <Bloom
          intensity={1.1}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
        />
        <Vignette offset={0.2} darkness={0.9} eskil={false} />
      </EffectComposer>
    </>
  );
};

const VOICEOVER_TEXT =
  "नमस्कार! स्वागत है Excel Service Hub में — जहाँ हर डेटा का हल है आसान और भरोसेमंद। Here, we make data work smarter for you! Our team specializes in Data Entry, Data Validation, and Bulk Data Import into Google Sheets — fast, secure, and accurate. From small businesses to large enterprises — Excel Service Hub ensures your data stays clean, organized, and ready to use. Because here, Your Data is Our Responsibility! If you’re looking for reliable data management — choose Excel Service Hub and experience professional excellence today.";

const VoiceOverController = ({ started }: { started: boolean }) => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    if (started) {
      const utterance = new SpeechSynthesisUtterance(VOICEOVER_TEXT);
      utterance.lang = "hi-IN";
      utterance.rate = 1.02;
      utterance.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const chosenVoice =
        voices.find((voice) => voice.lang.toLowerCase().includes("hi")) ??
        voices.find((voice) => voice.lang.toLowerCase().includes("en-in")) ??
        voices.find((voice) => voice.lang.toLowerCase().includes("en")) ??
        null;
      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }
      window.speechSynthesis.speak(utterance);
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [started]);

  return null;
};

const MusicBed = ({
  audioRef,
}: {
  audioRef: RefObject<HTMLAudioElement | null>;
}) => (
  <audio
    ref={audioRef}
    className="hidden"
    src="https://cdn.pixabay.com/download/audio/2024/04/07/audio_5d1f8eb69e.mp3?filename=corporate-technology-208360.mp3"
    loop
  />
);

const StageOverlay = ({
  stage,
  started,
  onStart,
}: {
  stage: Stage;
  started: boolean;
  onStart(): void;
}) => {
  const stageContent = useMemo(() => {
    switch (stage) {
      case 0:
        return {
          title: "Modern Office Momentum",
          points: [
            "Real-time Excel dashboards glowing with actionable metrics",
            "Specialist analysts validating, refining, and syncing every field",
            "Clean pipelines ready for instant business insight delivery",
          ],
        };
      case 1:
        return {
          title: "Data Automation Pulse",
          points: [
            "Streamlined imports orchestrated into Google Sheets warehouses",
            "Color-coded quality gates guarantee trustworthy datasets",
            "Secure, high-volume operations engineered for scale",
          ],
        };
      case 2:
        return {
          title: "Excel Service Hub Promise",
          points: [
            "Enterprise-grade precision with human attention to detail",
            "Smarter decisions, faster turnarounds, confident compliance",
            "Your data is our responsibility — professional excellence delivered",
          ],
        };
      default:
        return {
          title: "",
          points: [],
        };
    }
  }, [stage]);

  const baseButtonClasses =
    "pointer-events-auto rounded-full border border-emerald-400/70 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] transition";
  const buttonClasses = started
    ? `${baseButtonClasses} bg-emerald-500/20 text-emerald-200 cursor-not-allowed`
    : `${baseButtonClasses} bg-emerald-500/80 text-black hover:bg-emerald-400`;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
      <div className="flex w-full justify-between p-6">
        <div className="pointer-events-auto max-w-xl rounded-2xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur">
          <h2 className="text-xl font-semibold uppercase tracking-[0.35em] text-emerald-300">
            Excel Service Hub
          </h2>
          <p className="mt-2 text-3xl font-medium text-white">
            {stageContent.title}
          </p>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            {stageContent.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 leading-relaxed text-base"
              >
                <span className="mt-[0.35rem] h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400 shadow-[0_0_25px_rgba(74,222,128,0.8)]" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <div className="text-right text-sm text-white/60">
          <p className="font-mono uppercase tracking-[0.3em]">Data First</p>
          <p className="text-xs">Fast • Secure • Accurate</p>
        </div>
      </div>

      <div className="flex items-end justify-between p-6">
        <div className="flex flex-col text-sm text-white/60">
          <span>Voice-over: Hindi + English</span>
          <span>Music: Ambient Corporate Innovation</span>
        </div>
        <button
          type="button"
          onClick={onStart}
          disabled={started}
          aria-disabled={started}
          className={buttonClasses}
        >
          {started ? "Experience In Progress" : "Launch Experience"}
        </button>
      </div>
    </div>
  );
};

const CanvasFallback = () => (
  <div className="flex h-full items-center justify-center bg-black text-white/60">
    <div className="animate-pulse text-sm uppercase tracking-[0.5em]">
      Calibrating Scene...
    </div>
  </div>
);

const HeroExperience = () => {
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState<Stage>(0);
  const timelineRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleStart = useCallback(() => {
    if (started) return;
    timelineRef.current = 0;
    setStage(0);
    setStarted(true);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    audioRef.current
      ?.play()
      .catch(() => {
        // autoplay may be blocked; user can resume via browser UI
      });
  }, [started]);

  const handleComplete = useCallback(() => {
    setStarted(false);
    audioRef.current?.pause();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.08),transparent_55%)]" />
      <div className="relative flex flex-1 flex-col">
        <header className="flex items-center justify-between px-8 py-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.5em] text-emerald-300/80">
              Excel Service Hub
            </p>
            <h1 className="mt-1 text-4xl font-semibold sm:text-5xl">
              Transforming Data Into Trusted Decisions
            </h1>
            <p className="mt-3 max-w-xl text-base text-white/70">
              A 3D cinematic showcase of our end-to-end data refinement
              solutions — from meticulous entry to enterprise-ready dashboards.
            </p>
          </div>
          <div className="hidden text-right sm:block">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-white/40">
              Agentic Studio
            </p>
            <p className="text-sm text-white/60">
              Crafted for Excel Service Hub • 2024
            </p>
          </div>
        </header>

        <div className="relative mx-4 mb-8 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-[0_0_120px_rgba(74,222,128,0.18)] backdrop-blur">
          <Suspense fallback={<CanvasFallback />}>
            <Canvas
              shadows
              camera={{ position: [-6, 4, 12], fov: 42, near: 0.1, far: 100 }}
            >
              <CinematicExperience
                started={started}
                onStageChange={setStage}
                timelineRef={timelineRef}
                onComplete={handleComplete}
              />
            </Canvas>
          </Suspense>
          <StageOverlay stage={stage} started={started} onStart={handleStart} />
          <MusicBed audioRef={audioRef} />
        </div>

        <div className="relative flex flex-col items-center gap-4 pb-10 text-center text-sm text-white/50">
          <p className="max-w-3xl leading-relaxed">
            Excel Service Hub delivers professional data entry, validation, and
            bulk import solutions optimized for both small teams and global
            enterprises. Precision-driven workflows, stringent quality control,
            and enterprise-grade security ensure your data is always reliable,
            actionable, and ready to drive impact.
          </p>
          <span className="font-mono uppercase tracking-[0.4em] text-emerald-300/70">
            Your Data • Our Responsibility
          </span>
        </div>
      </div>
      <VoiceOverController started={started} />
    </section>
  );
};

export default dynamic(() => Promise.resolve(HeroExperience), {
  ssr: false,
});
