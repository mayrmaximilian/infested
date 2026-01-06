"use client";

import { useState, useRef } from "react";
import type { LucideIcon } from "lucide-react";

type Signal = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
};

interface ArcadeSignalsProps {
  signals: Signal[];
}

export function ArcadeSignals({ signals }: ArcadeSignalsProps) {
  const [sparkles, setSparkles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  let sparkleId = 0;

  const createSparkles = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create multiple sparkles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const velocity = 50 + Math.random() * 50;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      const id = sparkleId++;
      setSparkles((prev) => [...prev, { id, x, y }]);

      // Remove sparkle after animation
      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== id));
      }, 1500);

      // Create CSS animation dynamically
      const style = document.createElement("style");
      style.innerHTML = `
        @keyframes sparkle-${id} {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(${tx}px, ${ty}px) scale(0);
          }
        }
        .sparkle-${id} {
          animation: sparkle-${id} 1.5s ease-out forwards;
        }
      `;
      document.head.appendChild(style);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative grid gap-4 sm:grid-cols-2"
      onMouseMove={createSparkles}
    >
      {signals.map((signal) => (
        <div
          key={signal.title}
          className="group relative overflow-hidden rounded-2xl border border-[#1f2128] bg-[#0b0d12]/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-[#1f2128]/80 hover:bg-[#0f0f18]"
        >
          {/* Gradient background on hover */}
          <div
            className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-br ${signal.accent}`}
          />

          {/* Content */}
          <div className="relative z-10">
            <div
              className={`mb-4 h-1.5 w-12 rounded-full bg-linear-to-r ${signal.accent}`}
            />
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                <signal.icon className="h-5 w-5 text-white/70 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-base font-semibold text-white">
                  {signal.title}
                </p>
                <p className="mt-1 text-sm text-white/60 group-hover:text-white/70 transition-colors">
                  {signal.subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Sparkles */}
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className={`sparkle-${sparkle.id} sparkle`}
          style={{
            left: sparkle.x,
            top: sparkle.y,
          }}
        />
      ))}
    </div>
  );
}
