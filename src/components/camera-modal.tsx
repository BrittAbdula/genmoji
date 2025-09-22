"use client";

import { RefObject, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Camera, X as XIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraModalProps {
  show: boolean;
  title: string;
  onClose: () => void;
  onCapture: () => void;
  videoRef: RefObject<HTMLVideoElement>;
  onSwitchCamera?: () => void;
  switchLabel?: string;
  mirrored?: boolean;
}

export function CameraModal({ show, title, onClose, onCapture, videoRef, onSwitchCamera, switchLabel, mirrored = false }: CameraModalProps) {
  const scrollYRef = useRef(0);
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  // Prevent background scroll and keep overlay always on top
  useEffect(() => {
    if (!show) return;
    const body = document.body;
    const html = document.documentElement;
    scrollYRef.current = window.scrollY || window.pageYOffset || 0;
    // Lock scroll without layout shift
    body.style.position = 'fixed';
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'contain';
    return () => {
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      body.style.overflow = '';
      html.style.overscrollBehavior = '';
      window.scrollTo(0, scrollYRef.current);
    };
  }, [show]);
  if (!show) return null;

  const overlay = (
    <div className="fixed top-0 left-0 right-0 z-[1200] h-[100dvh] w-full grid place-items-center p-4 md:p-6 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-[min(90vw,720px)] max-h-[80vh] bg-card border border-border/50 rounded-2xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 md:px-6">
          <h3 className="text-lg md:text-xl font-semibold text-center w-full">{title}</h3>
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-3 right-3 rounded-full"
            aria-label="Close"
            title="Close"
            onClick={onClose}
          >
            <XIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Video area */}
        <div className="px-4 md:px-6 pb-2 flex-1 grid place-items-center">
          {/* Square preview to match 1:1 capture, sized to leave room for controls */}
          <div
            className="relative overflow-hidden rounded-xl bg-muted aspect-square"
            style={{ width: 'min(70vw, 52vh)' }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: mirrored ? 'scaleX(-1)' : undefined }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 md:gap-6 px-4 md:px-6 pt-2 pb-5">
          <Button
            onClick={onCapture}
            className="rounded-full w-14 h-14 md:w-16 md:h-16 p-0 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white shadow-md"
            aria-label="Capture"
            title="Capture"
          >
            <Camera className="w-7 h-7 md:w-8 md:h-8" />
          </Button>
          {onSwitchCamera && (
            <Button
              onClick={onSwitchCamera}
              variant="secondary"
              className="rounded-full w-12 h-12 md:w-14 md:h-14 p-0"
              aria-label={switchLabel || 'Switch camera'}
              title={switchLabel || 'Switch camera'}
            >
              <RefreshCw className="w-6 h-6 md:w-7 md:h-7" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (!show) return null;
  if (!isClient) return null;
  return createPortal(overlay, document.body);
}

export default CameraModal;
