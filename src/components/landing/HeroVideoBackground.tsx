"use client";
import { useEffect, useRef } from "react";

interface HeroVideoBackgroundProps {
  videoMp4: string;
  videoWebm?: string;
  poster?: string;
  className?: string;
  overlayClassName?: string;
}

export default function HeroVideoBackground({
  videoMp4,
  videoWebm,
  poster,
  className = "",
  overlayClassName,
}: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      video.pause();
      return;
    }

    video.play().catch(() => {});

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) video.pause();
      else video.play().catch(() => {});
    };

    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-0
          [object-position:72%_center] md:[object-position:60%_center] ${className}`}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        aria-hidden="true"
      >
        {videoWebm && <source src={videoWebm} type="video/webm" />}
        <source src={videoMp4} type="video/mp4" />
      </video>

      {overlayClassName ? (
        <div className={overlayClassName} aria-hidden="true" />
      ) : (
        <>
          {/* Mobile: escurece topo para o texto ficar legível */}
          <div
            className="absolute inset-0 z-[1] md:hidden"
            style={{ background: "linear-gradient(180deg, rgba(5,10,25,0.93) 0%, rgba(13,15,40,0.72) 45%, rgba(13,15,40,0.40) 75%, rgba(13,15,40,0.55) 100%)" }}
            aria-hidden="true"
          />
          {/* Desktop: escurece esquerda para o texto ficar legível */}
          <div
            className="absolute inset-0 z-[1] hidden md:block"
            style={{ background: "linear-gradient(90deg, rgba(5,10,25,0.95) 0%, rgba(13,15,40,0.82) 40%, rgba(13,15,40,0.45) 70%, rgba(13,15,40,0.20) 100%)" }}
            aria-hidden="true"
          />
        </>
      )}
    </>
  );
}
