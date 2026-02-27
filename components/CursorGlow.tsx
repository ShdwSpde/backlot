"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -500, y: -500 });
  const raf = useRef<number>(0);

  useEffect(() => {
    // Skip on touch devices
    if (typeof window !== "undefined" && "ontouchstart" in window) return;

    const handleMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const tick = () => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${pos.current.x - 150}px, ${pos.current.y - 150}px)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", handleMove);
    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  // Hidden on touch devices via media query
  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed z-50 hidden md:block"
      style={{
        width: 300,
        height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(184,169,212,0.08) 0%, rgba(184,169,212,0.02) 40%, transparent 70%)",
        willChange: "transform",
        top: 0,
        left: 0,
      }}
    />
  );
}
