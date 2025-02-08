"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef } from "react";
import EmojiContainer from "@/components/emoji-container";
import { Emoji, EmojiResponse } from "@/types/emoji";
import { ImageIcon, X } from 'lucide-react';
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

interface GenmojiGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export function GenmojiGeneratorDialog({
  isOpen,
  onClose,
  initialPrompt = "",
}: GenmojiGeneratorDialogProps) {
  const router = useRouter();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedEmoji, setGeneratedEmoji] = useState<Emoji | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(0);
      intervalId = setInterval(() => {
        setProgress((prev) => {
          if (prev < 80) {
            return prev + (80 - prev) * 0.1;
          } else if (prev < 95) {
            return prev + (95 - prev) * 0.05;
          }
          return prev;
        });
      }, 100);
    } else {
      setProgress(100);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isGenerating]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    fire(0.2, { spread: 60 });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
  };

  const generateEmoji = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setProgress(0);
    
    try {
      const response = await fetch('https://gen.genmojionline.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          image: selectedImage,
        }),
      });

      const emojiResponse = await response.json() as EmojiResponse;
      
      if (emojiResponse.success && emojiResponse.emoji) {
        setGeneratedEmoji(emojiResponse.emoji);
        triggerConfetti();
        // 导航到新生成的emoji页面
        router.push(`/emoji/${emojiResponse.emoji.slug}`);
        onClose();
      } else {
        throw new Error(emojiResponse.error || 'Failed to generate emoji');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent aria-describedby="dialog-description">
        <DialogHeader>
          <DialogTitle>Generate New Genmoji</DialogTitle>
          <DialogDescription id="dialog-description">
            Create a new genmoji based on your description. You can also upload an image for reference.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isGenerating && (
            <div className="w-full">
              <Progress value={progress} className="h-1" />
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Input
              placeholder="Describe your emoji..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && prompt.trim() && !isGenerating) {
                  generateEmoji();
                }
              }}
            />

            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                {selectedImage ? 'Change Image' : 'Upload Image (Optional)'}
              </Button>
              {selectedImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearSelectedImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {selectedImage && (
              <div className="relative w-32 h-32 mx-auto">
                <img
                  src={selectedImage}
                  alt="Selected reference"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            )}

            <Button
              onClick={generateEmoji}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? "Generating..." : "Generate Genmoji"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 