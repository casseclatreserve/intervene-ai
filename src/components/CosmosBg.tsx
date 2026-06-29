import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  r: number;
  baseOpacity: number;
  opacity: number;
  layer: number;
  multiplier: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  pulseSpeed?: number;
  pulseOffset?: number;
}

interface ShootingStar {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  length: number;
  angle: number;
  speed: number;
  progress: number; // 0 to 1
  active: boolean;
}

export default function CosmosBg() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const shootingStarRef = useRef<ShootingStar | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let stars: Star[] = [];
    const isMobile = window.innerWidth < 768;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const width = canvas.width;
      const height = canvas.height;

      const layer1Count = isMobile ? 80 : 180;
      const layer2Count = isMobile ? 40 : 90;
      const layer3Count = isMobile ? 15 : 30;

      // Layer 1 - Dust
      for (let i = 0; i < layer1Count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.3 + Math.random() * 0.4,
          baseOpacity: 0.2 + Math.random() * 0.3,
          opacity: 0,
          layer: 1,
          multiplier: 0.008,
          twinkleSpeed: 4000 + Math.random() * 5000,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }

      // Layer 2 - Stars
      for (let i = 0; i < layer2Count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 0.8 + Math.random() * 0.7,
          baseOpacity: 0.4 + Math.random() * 0.45,
          opacity: 0,
          layer: 2,
          multiplier: 0.018,
          twinkleSpeed: 2000 + Math.random() * 3000,
          twinkleOffset: Math.random() * Math.PI * 2,
          pulseSpeed: 1000 + Math.random() * 2000,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }

      // Layer 3 - Silver Giants
      for (let i = 0; i < layer3Count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: 1.6 + Math.random() * 1.0,
          baseOpacity: 0.7 + Math.random() * 0.3,
          opacity: 0,
          layer: 3,
          multiplier: 0.035,
          twinkleSpeed: 6000 + Math.random() * 4000,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseRef.current.targetX = (e.clientX - centerX);
      mouseRef.current.targetY = (e.clientY - centerY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        // Shift stars 2x on mobile for dramatic effect
        mouseRef.current.targetX = (touch.clientX - centerX) * 2;
        mouseRef.current.targetY = (touch.clientY - centerY) * 2;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    resizeCanvas();

    let lastTime = 0;
    let nextShootingStarTime = Date.now() + 8000 + Math.random() * 7000;

    const draw = (time: number) => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lerp mouse positions for smooth parallax shifting
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const now = Date.now();

      // Draw and update stars
      stars.forEach((star) => {
        // Calculate twinkle opacity
        const twinkleFactor = Math.sin((time / star.twinkleSpeed) + star.twinkleOffset);
        let currentOpacity = star.baseOpacity + twinkleFactor * 0.15;
        
        // Cap opacity between 0.1 and 1
        currentOpacity = Math.max(0.1, Math.min(1.0, currentOpacity));

        if (star.layer === 2 && star.pulseSpeed && star.pulseOffset) {
          const pulseFactor = Math.sin((time / star.pulseSpeed) + star.pulseOffset);
          if (pulseFactor > 0.8) {
            currentOpacity = Math.min(1.0, currentOpacity + (pulseFactor - 0.8) * 0.5);
          }
        }

        // Apply mouse parallax shift
        const shiftedX = star.x - mouseRef.current.x * star.multiplier;
        const shiftedY = star.y - mouseRef.current.y * star.multiplier;

        // Wrap around boundaries
        let finalX = shiftedX;
        let finalY = shiftedY;
        if (finalX < 0) finalX += canvas.width;
        else if (finalX > canvas.width) finalX -= canvas.width;
        if (finalY < 0) finalY += canvas.height;
        else if (finalY > canvas.height) finalY -= canvas.height;

        ctx.fillStyle = `rgba(200, 204, 222, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(finalX, finalY, star.r, 0, Math.PI * 2);
        ctx.fill();

        // Layer 3 concentric 4-point cross-sparkle
        if (star.layer === 3) {
          const sparkleFactor = Math.sin((time / star.twinkleSpeed) + star.twinkleOffset) * 0.5 + 0.5; // 0 to 1
          const lineLength = 4 + sparkleFactor * 4; // 4 to 8px
          ctx.strokeStyle = `rgba(167, 139, 250, ${currentOpacity * 0.35 * sparkleFactor})`;
          ctx.lineWidth = 0.8;

          ctx.beginPath();
          // 0 degree (vertical)
          ctx.moveTo(finalX, finalY - lineLength);
          ctx.lineTo(finalX, finalY + lineLength);
          // 90 degree (horizontal)
          ctx.moveTo(finalX - lineLength, finalY);
          ctx.lineTo(finalX + lineLength, finalY);
          // 45 degree
          ctx.moveTo(finalX - lineLength * 0.7, finalY - lineLength * 0.7);
          ctx.lineTo(finalX + lineLength * 0.7, finalY + lineLength * 0.7);
          // 135 degree
          ctx.moveTo(finalX - lineLength * 0.7, finalY + lineLength * 0.7);
          ctx.lineTo(finalX + lineLength * 0.7, finalY - lineLength * 0.7);
          ctx.stroke();
        }
      });

      // Handle Shooting Star
      if (now > nextShootingStarTime && !shootingStarRef.current) {
        const startX = Math.random() * canvas.width;
        const startY = Math.random() * (canvas.height * 0.4);
        const length = 80 + Math.random() * 40;
        const angle = (15 + Math.random() * 15) * (Math.PI / 180); // 15-30 deg downward
        
        shootingStarRef.current = {
          startX,
          startY,
          endX: startX + Math.cos(angle) * length,
          endY: startY + Math.sin(angle) * length,
          length,
          angle,
          speed: 0.04, // progress increment per frame (600ms total)
          progress: 0,
          active: true,
        };
        nextShootingStarTime = now + 8000 + Math.random() * 10000;
      }

      if (shootingStarRef.current && shootingStarRef.current.active) {
        const s = shootingStarRef.current;
        s.progress += 0.035; // increments progress (~600ms)
        if (s.progress >= 1) {
          s.active = false;
          shootingStarRef.current = null;
        } else {
          // Draw shooting star
          const curX = s.startX + (s.endX - s.startX) * s.progress;
          const curY = s.startY + (s.endY - s.startY) * s.progress;

          const grad = ctx.createLinearGradient(
            curX - Math.cos(s.angle) * s.length * 0.5,
            curY - Math.sin(s.angle) * s.length * 0.5,
            curX,
            curY
          );
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(0.8, 'rgba(167, 139, 250, 0.5)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 1)');

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(curX - Math.cos(s.angle) * s.length * 0.5, curY - Math.sin(s.angle) * s.length * 0.5);
          ctx.lineTo(curX, curY);
          ctx.stroke();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return <canvas ref={canvasRef} id="cosmos" className="block fixed top-0 left-0 w-full h-full pointer-events-none z-0" />;
}
