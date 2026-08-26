'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

function distanceBetween(a: React.Touch, b: React.Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

export default function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(
    null
  );
  const pinchState = useRef<{ startDistance: number; startZoom: number } | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(MAX_ZOOM, z + 0.25));
      if (e.key === '-') setZoom((z) => Math.max(MIN_ZOOM, z - 0.25));
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setIsInteracting(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset({ x: dragState.current.originX + dx, y: dragState.current.originY + dy });
  };

  const handleMouseUp = () => {
    dragState.current = null;
    setIsInteracting(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchState.current = {
        startDistance: distanceBetween(e.touches[0], e.touches[1]),
        startZoom: zoom,
      };
      setIsInteracting(true);
    } else if (e.touches.length === 1 && zoom > 1) {
      dragState.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        originX: offset.x,
        originY: offset.y,
      };
      setIsInteracting(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchState.current) {
      const newDistance = distanceBetween(e.touches[0], e.touches[1]);
      const ratio = newDistance / pinchState.current.startDistance;
      setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchState.current.startZoom * ratio)));
    } else if (e.touches.length === 1 && dragState.current) {
      const dx = e.touches[0].clientX - dragState.current.startX;
      const dy = e.touches[0].clientY - dragState.current.startY;
      setOffset({ x: dragState.current.originX + dx, y: dragState.current.originY + dy });
    }
  };

  const handleTouchEnd = () => {
    dragState.current = null;
    pinchState.current = null;
    setIsInteracting(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 0.25))}
          aria-label="Zoom out"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 0.25))}
          aria-label="Zoom in"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={resetView}
          aria-label="Reset zoom"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur"
        >
          <X size={18} />
        </button>
      </div>

      <div
        className="w-full h-full flex items-center justify-center overflow-hidden touch-none select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={zoom > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transition: isInteracting ? 'none' : 'transform 0.15s ease-out',
            maxWidth: '90vw',
            maxHeight: '85vh',
            objectFit: 'contain',
          }}
          onClick={() => {
            if (zoom === 1) setZoom(2);
          }}
        />
      </div>

      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-[10px]">
        Scroll or pinch to zoom &middot; drag to pan &middot; Esc to close
      </p>
    </div>
  );
}