'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  onSignatureChange: (signatureDataUrl: string | null) => void;
}

export function SignaturePad({ onSignatureChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Fix for higher DPI displays
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#39FF14'; // Neon green signature
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if ('touches' in event) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: (event as React.MouseEvent).clientX - rect.left,
        y: (event as React.MouseEvent).clientY - rect.top,
      };
    }
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(event);
    if (coords && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
      }
    }
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    event.preventDefault();
    const coords = getCoordinates(event);
    if (coords && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        setHasSignature(true);
      }
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      if (canvasRef.current && hasSignature) {
        onSignatureChange(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
        onSignatureChange(null);
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative rounded-xl overflow-hidden border border-white/20 bg-black/40 group">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="w-full h-[150px] cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span className="text-neutral-500 font-mono text-sm opacity-50 select-none">
              Dessinez votre signature ici
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearSignature}
          disabled={!hasSignature}
          className="text-xs text-neutral-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Effacer
        </Button>
      </div>
    </div>
  );
}
