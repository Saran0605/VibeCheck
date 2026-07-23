import React, { useRef, useEffect } from 'react';

export default function GrayscaleWaves() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    
    window.addEventListener('resize', resize);
    resize();

    let count = 0;
    
    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // Black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // 1. Grid overlay (subtle scanline dots)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      const gridSize = 45;
      for (let x = 0; x < w; x += gridSize) {
        for (let y = 0; y < h; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Mathematical waving curves representing vibe check frequencies
      const waveCount = 5;
      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        const amplitude = 30 + i * 25;
        const frequency = 0.0012 + i * 0.0006;
        const speed = 0.012 + i * 0.002;
        const opacity = 0.02 + (i * 0.02);

        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.lineWidth = 0.5 + i * 0.25;

        for (let x = 0; x < w; x += 6) {
          const y = h / 2 + 
            Math.sin(x * frequency + count * speed) * amplitude + 
            Math.cos(x * 0.002 - count * speed * 0.4) * (amplitude * 0.5);
            
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      count += 0.5;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
