"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [flipping, setFlipping] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;
    setFlipping(true);

    const canvas = canvasRef.current;
    if (!canvas) {
      setFlipping(false);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setFlipping(false);
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let frame = 0;
    const totalFrames = 8;
    let animId: number;

    function drawStatic() {
      const w = canvas!.width;
      const h = canvas!.height;
      const imageData = ctx!.createImageData(w, h);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = frame < 3 ? 200 : Math.max(0, 200 - (frame - 3) * 50);
      }

      ctx!.putImageData(imageData, 0, 0);

      // Horizontal glitch lines
      const lineCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < lineCount; i++) {
        const y = Math.random() * h;
        ctx!.fillStyle = `rgba(184, 169, 212, ${0.15 + Math.random() * 0.15})`;
        ctx!.fillRect(0, y, w, 1 + Math.random() * 2);
      }

      frame++;
      if (frame < totalFrames) {
        animId = requestAnimationFrame(drawStatic);
      } else {
        ctx!.clearRect(0, 0, w, h);
        setFlipping(false);
      }
    }

    animId = requestAnimationFrame(drawStatic);
    return () => cancelAnimationFrame(animId);
  }, [pathname]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-[45]"
        style={{
          display: flipping ? "block" : "none",
          width: "100vw",
          height: "100vh",
        }}
      />
      <div
        style={{
          opacity: flipping ? 0 : 1,
          transition: "opacity 0.15s ease-out",
        }}
      >
        {children}
      </div>
    </>
  );
}
