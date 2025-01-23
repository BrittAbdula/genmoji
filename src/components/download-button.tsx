'use client';

import { Button } from "@/components/ui/button";

interface DownloadButtonProps {
  url: string;
}

export function DownloadButton({ url }: DownloadButtonProps) {
  return (
    <Button 
      onClick={() => window.open(url, '_blank')}
      className="w-full mb-4"
    >
      Download Emoji
    </Button>
  );
} 