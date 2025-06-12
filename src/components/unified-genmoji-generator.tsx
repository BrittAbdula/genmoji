"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef } from "react";
import { genMoji } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Emoji } from "@/types/emoji";
import { ImageIcon, X } from 'lucide-react';
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';
import EmojiContainer from "@/components/emoji-container";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useGenerationStore } from "@/store/generation-store";
import { useAuthStore } from "@/store/auth-store";
import Image from "next/image";

interface UnifiedGenmojiGeneratorProps {
  trigger?: React.ReactNode;
  initialPrompt?: string;
  onGenerated?: (emoji: Emoji) => void;
  mode?: 'inline' | 'modal';
  init_model?: 'genmoji' | 'sticker' | 'mascot' | null;
}

export function UnifiedGenmojiGenerator({
  trigger,
  initialPrompt = "",
  onGenerated,
  mode = 'modal',
  init_model = null
}: UnifiedGenmojiGeneratorProps) {
  const router = useRouter();
  const t = useTranslations('generator');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(mode === 'inline');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedEmoji, setGeneratedEmoji] = useState<Emoji | null>(null);
  const [model, setModel] = useState<'genmoji' | 'sticker' | 'mascot'>(init_model || 'genmoji');
  const isCustomModel = init_model !== null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const { isGenerating, progress, setGenerating, setProgress, setPrompt: setGlobalPrompt } = useGenerationStore();
  const { token } = useAuthStore();

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isGenerating) {
      setProgress(0);
      intervalId = setInterval(() => {
        setProgress((prev: number) => {
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
  }, [isGenerating, setProgress]);

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
    
    setGenerating(true);
    setProgress(0);
    setGlobalPrompt(prompt.trim());
    setIsOpen(false);
    
    try {
      const emojiResponse = await genMoji(prompt.trim(), locale, selectedImage, model, token);
      
      if (emojiResponse.success && emojiResponse.emoji) {
        setGeneratedEmoji(emojiResponse.emoji);
        triggerConfetti();
        
        if (onGenerated) {
          onGenerated(emojiResponse.emoji);
        } else {
          router.push(`/emoji/${emojiResponse.emoji.slug}`);
        }
        
        if (mode === 'modal') {
          setIsOpen(false);
        } else {
          setPrompt("");
          setSelectedImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      } else {
        throw new Error(emojiResponse.error || t('error.failed'));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const content = (
    <div className="grid gap-4 py-4">
      {isGenerating && (
        <div className="w-full">
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {mode === 'inline' && generatedEmoji && (
          <EmojiContainer 
            emoji={generatedEmoji} 
            size="lg"
          />
      )}

      <div className="flex flex-col gap-4">
        {/* Model Selection - Only show if init_model is not explicitly provided */}
        {!isCustomModel && (
        <div className="flex items-center justify-center gap-2 p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={model === 'genmoji' ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                    model === 'genmoji' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setModel('genmoji')}
                >
                  <Image 
                    src="https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/ba791d54-9c81-47d4-dc1f-32f2014b8300/public"
                    alt="Genmoji"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  {t('models.genmoji.name')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('models.genmoji.description')}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={model === 'sticker' ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                    model === 'sticker' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setModel('sticker')}
                >
                  <Image 
                    src="https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/8ef04dd2-6612-496a-d2ea-bada5ccf9400/public"
                    alt="Sticker"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  {t('models.sticker.name')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('models.sticker.description')}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant={model === 'mascot' ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                    model === 'mascot' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}
                  onClick={() => setModel('mascot')}
                >
                  <Image 
                    src="https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/14a1b15b-9263-4d20-443d-67c5e4c4c900/public"
                    alt="Mascot"
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  {t('models.mascot.name')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('models.mascot.description')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        )}

        <div className={cn(
          "relative flex flex-col w-full rounded-xl border bg-card shadow-sm overflow-hidden",
          mode === 'inline' && "border-muted-foreground/10"
        )}>
          <Textarea
            placeholder={t('placeholder')}
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey && prompt.trim() && !isGenerating) {
                e.preventDefault();
                generateEmoji();
              }
            }}
            rows={2}
            className={cn(
              "resize-none min-h-[80px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-t-xl rounded-b-none bg-card",
              mode === 'inline' && "text-lg p-4"
            )}
          />
          
          {selectedImage && (
            <div className="px-4 pb-2">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-muted">
                <img
                  src={selectedImage}
                  alt="Selected reference"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearSelectedImage}
                  className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <div className="flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full flex items-center gap-1.5 text-sm hover:bg-muted/80",
                  selectedImage ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4" />
                {/* {selectedImage ? t('changeImage') : t('uploadImage')} */}
              </Button>
            </div>
            
            <Button
              onClick={generateEmoji}
              disabled={isGenerating || !prompt.trim()}
              size="sm"
              className={cn(
                "rounded-full",
                "px-6 py-2 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-medium shadow-sm"
              )}
            >
              {isGenerating ? (
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-white/30 animate-pulse"></span>
                  {t('generatingButton')}
                </div>
              ) : (
                t('generateButton')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mode === 'inline' ? (
        content
      ) : isMobile ? (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>
            {trigger}
          </DrawerTrigger>
          <DrawerContent className="px-0">
            <DrawerHeader className="px-6">
              <DrawerTitle>{t('dialogTitle')}</DrawerTitle>
              <DrawerDescription>
                {t('dialogDescription')}
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-6 pb-8">
              {content}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            {trigger}
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('dialogTitle')}</DialogTitle>
              <DialogDescription>
                {t('dialogDescription')}
              </DialogDescription>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 