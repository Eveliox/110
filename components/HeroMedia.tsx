"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

export function HeroMedia({
  poster,
  video,
  videoWebm,
  alt,
  chip,
}: {
  poster: string;
  video?: string;
  videoWebm?: string;
  alt: string;
  chip?: string;
}) {
  const [videoReady, setVideoReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const hasVideo = Boolean(video || videoWebm) && !prefersReducedMotion;

  return (
    <div className="hero-card">
      <Image
        src={poster}
        alt={alt}
        fill
        sizes="(max-width: 900px) 100vw, 42vw"
        priority
        style={{
          objectFit: "cover",
          filter: "contrast(1.08) saturate(1.05)",
          opacity: videoReady ? 0 : 1,
          transition: "opacity 400ms ease",
        }}
      />
      {hasVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          aria-label={alt}
          onCanPlay={() => setVideoReady(true)}
          onError={() => setVideoReady(false)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "contrast(1.08) saturate(1.05)",
            opacity: videoReady ? 1 : 0,
            transition: "opacity 400ms ease",
          }}
        >
          {videoWebm && <source src={videoWebm} type="video/webm" />}
          {video && <source src={video} type="video/mp4" />}
        </video>
      )}
      {chip && (
        <span className="hero-chip">
          <Sparkles size={14} strokeWidth={1.75} />
          {chip}
        </span>
      )}
    </div>
  );
}
