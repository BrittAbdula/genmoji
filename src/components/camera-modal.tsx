"use client";

import { RefObject } from "react";
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
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 md:p-6 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-[min(92vw,960px)] max-h-[86vh] bg-card border border-border/50 rounded-2xl shadow-xl flex flex-col">
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
        <div className="px-4 md:px-6 pb-2">
          {/* Square preview to match 1:1 capture */}
          <div className="relative w-full overflow-hidden rounded-xl bg-muted aspect-square">
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
}

export default CameraModal;
