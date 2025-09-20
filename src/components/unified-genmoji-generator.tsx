"use client";

// Dialog was used for the old model selector; no longer needed here
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef } from "react";
import { genMoji, uploadImage, GenerationLimitError } from "@/lib/api";
// Tooltip not needed after removing bottom model selector trigger
import { Emoji } from "@/types/emoji";
import { X, Plus, ArrowUp, Globe } from 'lucide-react';
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';
import EmojiContainer from "@/components/emoji-container";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { useGenerationStore } from "@/store/generation-store";
import { useAuthStore } from "@/store/auth-store";
import { LoginDialog } from "./login-dialog";
import { SubscriptionLimitDialog } from "./subscription-limit-dialog";
import Image from "next/image";

interface UnifiedGenmojiGeneratorProps {
  initialPrompt?: string;
  onGenerated?: (emoji: Emoji) => void;
  init_model?: 'genmoji' | 'sticker' | 'mascot' | null;
}

export function UnifiedGenmojiGenerator({
  initialPrompt = "",
  onGenerated,
  init_model = null
}: UnifiedGenmojiGeneratorProps) {
  const router = useRouter();
  const t = useTranslations('generator');
  const locale = useLocale();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedEmoji, setGeneratedEmoji] = useState<Emoji | null>(null);
  const [model, setModel] = useState<string>(init_model || 'genmoji');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const hasCenteredOnce = useRef(false);
  const hasPlayedIntroAnimation = useRef(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const { isGenerating, progress, setGenerating, setProgress, setPrompt: setGlobalPrompt } = useGenerationStore();
  const { token, isLoggedIn } = useAuthStore();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{
    currentCount: number;
    limit: number;
    resetTime: string;
    type?: 'monthly' | 'daily';
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');

  // 初始化模型：优先 props，其次 localStorage 记忆
  useEffect(() => {
    if (init_model) return;
    try {
      const saved = localStorage.getItem('genmoji:selectedModel');
      if (saved) setModel(saved);
    } catch {}
  }, [init_model]);

  // Get localized prompts based on current model
  const getDefaultPrompts = () => {
    try {
      // Get prompts from translation file based on current model
      const prompts = t.raw(`prompts.${model}`);
      return Array.isArray(prompts) ? prompts : [];
    } catch (error) {
      // Fallback to empty array if translation is missing
      console.warn(`Missing translation for prompts.${model}:`, error);
      return [];
    }
  };

  // 监听登录状态变化，登录成功后自动开始生成
  useEffect(() => {
    if (isLoggedIn && pendingGeneration && prompt.trim()) {
      setPendingGeneration(false);
      setShowLoginDialog(false);
      // 延迟一点时间确保对话框关闭动画完成
      setTimeout(() => {
        startGeneration();
      }, 300);
    }
  }, [isLoggedIn, pendingGeneration, prompt]);

  // 居中模型选择器（仅首次）
  useEffect(() => {
    if (hasCenteredOnce.current) return;
    const centerModelSelector = () => {
      if (modelSelectorRef.current) {
        const container = modelSelectorRef.current;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        if (scrollWidth > clientWidth) {
          const centerPosition = (scrollWidth - clientWidth) / 2;
          container.scrollLeft = centerPosition;
        }
      }
    };
    const timer = setTimeout(() => {
      centerModelSelector();
      hasCenteredOnce.current = true;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Get current model info
  const getCurrentModelInfo = () => {
    const map: Record<string, { image: string; name: string; description: string }> = {
      genmoji: {
        image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/4ad1e218-eae7-4976-8496-b68cd6374f00/public",
        name: t('models.genmoji.name'),
        description: t('models.genmoji.description')
      },
      sticker: {
        image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/8ef04dd2-6612-496a-d2ea-bada5ccf9400/public",
        name: t('models.sticker.name'),
        description: t('models.sticker.description')
      },
      // mascot: {
      //   image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/14a1b15b-9263-4d20-443d-67c5e4c4c900/public",
      //   name: t('models.mascot.name'),
      //   description: t('models.mascot.description')
      // },
      'claymation': {
        image: "/emojis/Claymation.png",
        name: t('models.claymation.name'),
        description: t('models.claymation.description')
      },
      '3d': {
        image: "/emojis/3d.png",
        name: t('models.3d.name'),
        description: t('models.3d.description')
      },
      'origami': {
        image: "/emojis/Origami.png",
        name: t('models.origami.name'),
        description: t('models.origami.description')
      },
      'cross-stitch': {
        image: "/emojis/Cross-stitch-Pixel.png",
        name: t('models.cross-stitch.name'),
        description: t('models.cross-stitch.description')
      },
      'steampunk': {
        image: "/emojis/Steampunk.png",
        name: t('models.steampunk.name'),
        description: t('models.steampunk.description')
      },
      'liquid-metal': {
        image: "/emojis/Liquid-Metal.png",
        name: t('models.liquid-metal.name'),
        description: t('models.liquid-metal.description')
      },
      'pixel': {
        image: "/emojis/pixel.png",
        name: t('models.pixel.name'),
        description: t('models.pixel.description')
      },
      'handdrawn': {
        image: "/emojis/handdrawn.png",
        name: t('models.handdrawn.name'),
        description: t('models.handdrawn.description')
      }
    };
    return map[model] ?? map['genmoji'];
  };

  const currentModel = getCurrentModelInfo();

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  // 自动聚焦到输入框，如果有文字则定位到最后
  useEffect(() => {
    // 使用 setTimeout 确保组件完全渲染后再执行
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // 如果有文字，将光标定位到最后
        const currentPrompt = textareaRef.current.value;
        if (currentPrompt) {
          const length = currentPrompt.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }
    }, 100); // 稍微延迟确保 prompt 已经设置

    return () => clearTimeout(timer);
  }, []); // 只在组件挂载时执行一次

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

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const uploadResponse = await uploadImage(file, token);
        
        if (uploadResponse.success && uploadResponse.image_url) {
          setSelectedImage(uploadResponse.image_url);
        } else {
          console.error('Upload failed:', uploadResponse.error);
          alert(`Upload failed: ${uploadResponse.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsUploading(false);
      }
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

  // 实际的生成逻辑
  const startGeneration = async () => {
    setGenerating(true);
    setProgress(0);
    
    // 对于 image 模式，固定使用 "based on the image" 作为 prompt
    const effectivePrompt = activeTab === 'image' 
      ? "based on the image" 
      : (prompt || '').trim();
      
    setGlobalPrompt(effectivePrompt);
    
    try {
      const emojiResponse = await genMoji(effectivePrompt, locale, selectedImage, model, token);
      
      if (emojiResponse.success && emojiResponse.emoji) {
        setGeneratedEmoji(emojiResponse.emoji);
        triggerConfetti();
        
        if (onGenerated) {
          onGenerated(emojiResponse.emoji);
          // 不需要清空表单，因为页面会跳转
        } else {
          router.push(`/emoji/${emojiResponse.emoji.slug}`);
          // 立即清空表单，因为要跳转页面
          setPrompt("");
          setSelectedImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      } else {
        throw new Error(emojiResponse.error || t('error.failed'));
      }
    } catch (error: any) {
      // 处理生成限制错误 - 这是预期的用户流程
      if (error instanceof GenerationLimitError) {
        setLimitInfo({
          currentCount: error.details.currentCount || 0,
          limit: error.details.limit || 0,
          resetTime: error.details.resetTime, // 完全依赖API返回的重置时间
          type: error.details.type
        });
        setShowSubscriptionDialog(true);
        // 不在控制台记录限制错误，因为这是正常的用户流程
      } else {
        // 只记录非预期的错误
        console.error('Generation error:', error);
        // 这里可以添加用户友好的错误提示，比如 toast 通知
      }
    } finally {
      setGenerating(false);
    }
  };

  const generateEmoji = async () => {
    if (activeTab === 'text' && !prompt.trim()) return;
    if (activeTab === 'image' && !selectedImage) return;
    
    // 检查用户是否已登录
    if (!isLoggedIn) {
      setPendingGeneration(true);
      setShowLoginDialog(true);
      return;
    }
    
    await startGeneration();
  };

  // Handle prompt click
  const handlePromptClick = (promptText: string) => {
    setPrompt(promptText);
    // Focus textarea after setting prompt
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      setTimeout(() => {
        if (textareaRef.current) {
          const length = promptText.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 0);
    }
  };

  // 模型数据，方便未来扩展
  const models = [
    {
      id: 'genmoji' as const,
      name: t('models.genmoji.name'),
      description: t('models.genmoji.description'),
      image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/4ad1e218-eae7-4976-8496-b68cd6374f00/public",
      alt: "Genmoji"
    },
    {
      id: 'sticker' as const,
      name: t('models.sticker.name'),
      description: t('models.sticker.description'),
      image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/8ef04dd2-6612-496a-d2ea-bada5ccf9400/public",
      alt: "Sticker"
    },
    // {
    //   id: 'mascot' as const,
    //   name: t('models.mascot.name'),
    //   description: t('models.mascot.description'),
    //   image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/14a1b15b-9263-4d20-443d-67c5e4c4c900/public",
    //   alt: "Mascot"
    // },
    { id: 'claymation' as const, name: t('models.claymation.name'), description: t('models.claymation.description'), image: "/emojis/Claymation.png", alt: 'Claymation Emoji' },
    { id: '3d' as const, name: t('models.3d.name'), description: t('models.3d.description'), image: "/emojis/3d.png", alt: '3D Emoji' },
    { id: 'origami' as const, name: t('models.origami.name'), description: t('models.origami.description'), image: "/emojis/Origami.png", alt: 'Origami Emoji' },
    { id: 'cross-stitch' as const, name: t('models.cross-stitch.name'), description: t('models.cross-stitch.description'), image: "/emojis/Cross-stitch-Pixel.png", alt: 'Cross-stitch Emoji' },
    { id: 'steampunk' as const, name: t('models.steampunk.name'), description: t('models.steampunk.description'), image: "/emojis/Steampunk.png", alt: 'Steampunk Emoji' },
    { id: 'liquid-metal' as const, name: t('models.liquid-metal.name'), description: t('models.liquid-metal.description'), image: "/emojis/Liquid-Metal.png", alt: 'Liquid Metal Emoji' },
    { id: 'pixel' as const, name: t('models.pixel.name'), description: t('models.pixel.description'), image: "/emojis/pixel.png", alt: 'Pixel Emoji' },
    { id: 'handdrawn' as const, name: t('models.handdrawn.name'), description: t('models.handdrawn.description'), image: "/emojis/handdrawn.png", alt: 'Hand-drawn Emoji' }
  ];

  const handleModelSelect = (modelId: string) => {
    setModel(modelId);
    try {
      localStorage.setItem('genmoji:selectedModel', modelId);
    } catch {}
  };

  // 初始进入时跑马灯快速预览一遍，最后停留在上次选择
  useEffect(() => {
    if (hasPlayedIntroAnimation.current) return;

    let raf = 0 as number | undefined;

    const run = () => {
      // 读取上次选择
      let saved: string | null = null;
      try { saved = localStorage.getItem('genmoji:selectedModel'); } catch {}
      const endModel = saved || init_model || model;

      const ids = models.map((m) => m.id as string);
      const container = modelSelectorRef.current;
      if (!container || ids.length === 0) {
        hasPlayedIntroAnimation.current = true;
        return;
      }

      // 从头滚到尾（一次），快速马灯效果
      const scrollMax = Math.max(0, container.scrollWidth - container.clientWidth);
      container.scrollTo({ left: 0, behavior: 'auto' });
      const duration = 1000; // 1s 快速过一遍
      const start = performance.now();
      let lastIdx = -1;

      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        container.scrollLeft = scrollMax * t;

        // 根据进度快速切换预览（避免每帧都 setModel）
        const idx = Math.min(ids.length - 1, Math.floor(t * ids.length));
        if (idx !== lastIdx) {
          lastIdx = idx;
          setModel(ids[idx]);
        }

        if (t < 1) {
          raf = requestAnimationFrame(step);
        } else {
          // 停留在上次选择
          setTimeout(() => {
            if (endModel) {
              setModel(endModel);
              const el = itemRefs.current[endModel];
              try {
                el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              } catch {}
            }
            hasPlayedIntroAnimation.current = true;
          }, 50);
        }
      };

      raf = requestAnimationFrame(step);
    };

    const timer = setTimeout(run, 200);
    return () => {
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Removed old dialog/drawer model selectors in favor of inline selector bar

  const content = (
    <div className="flex flex-col gap-4 py-4">
      {/* Inline style selector bar */}
      <div className="w-full">
        {/* Large preview of the currently selected style */}
        <div className="w-full px-4 mb-3">
          <div className="relative mx-auto w-full max-w-[160px]">
            <Image
              src={currentModel.image}
              alt={currentModel.name}
              width={160}
              height={160}
              priority
              className="w-full h-auto rounded-xl object-cover"
            />
          </div>
        </div>
        <div className="w-full px-4">
          <div 
            ref={modelSelectorRef}
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide touch-pan-x justify-start" 
            role="listbox" 
            aria-label={t('selectModel')}
          >
          {/* All models horizontally scrollable */}
          {models.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModelSelect(m.id)}
              title={m.name}
              aria-pressed={model === m.id}
              ref={(el) => { itemRefs.current[m.id] = el; }}
              className={cn(
                "flex items-center gap-2 shrink-0 border rounded-full pr-3 pl-2 py-2",
                "transition-colors bg-background",
                model === m.id
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:bg-muted/60"
              )}
            >
              <Image src={m.image} alt={m.alt} width={28} height={28} className="rounded-full" />
              <span className="text-[13px] sm:text-sm whitespace-nowrap">{m.name}</span>
            </button>
          ))}
          </div>
        </div>
      </div>
      {isGenerating && (
        <div className="w-full">
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {generatedEmoji && (
          <EmojiContainer 
            emoji={generatedEmoji} 
            size="lg"
          />
      )}

      <div className="flex flex-col gap-4">
        <div className="relative flex flex-col w-full rounded-xl border bg-card shadow-sm overflow-hidden border-muted-foreground/10">
          {/* Tabs header */}
          <div className="flex w-full justify-center p-2">
            <div className="inline-flex items-center gap-1 bg-muted rounded-full p-1">
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={cn(
                  "px-3 py-1.5 text-xs sm:text-sm rounded-full",
                  activeTab === 'text' ? 'bg-background shadow font-medium' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t('tabs.text')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('image')}
                className={cn(
                  "px-3 py-1.5 text-xs sm:text-sm rounded-full",
                  activeTab === 'image' ? 'bg-background shadow font-medium' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t('tabs.image')}
              </button>
            </div>
          </div>

          {/* Tab content */}
          {activeTab === 'text' ? (
            <Textarea
              ref={textareaRef}
              placeholder={t('placeholder')}
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === 'Enter' && !e.shiftKey && prompt.trim() && !isGenerating) {
                  e.preventDefault();
                  generateEmoji();
                }
              }}
              rows={1}
              className={cn(
                "resize-none min-h-[60px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl bg-card text-lg p-4",
                "pb-16 placeholder:text-muted-foreground/50 placeholder:font-normal"
              )}
            />
          ) : (
            <div className="px-4 pb-20">
              <div
                className={cn(
                  "relative rounded-xl border-2 border-dashed",
                  "border-muted-foreground/30 hover:border-muted-foreground/50",
                  "min-h-[200px] flex flex-col items-center justify-center gap-3 p-6 text-center"
                )}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={async (e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    setIsUploading(true);
                    try {
                      const uploadResponse = await uploadImage(file, token);
                      if (uploadResponse.success && uploadResponse.image_url) {
                        setSelectedImage(uploadResponse.image_url);
                      }
                    } finally {
                      setIsUploading(false);
                    }
                  }
                }}
                onPaste={async (e) => {
                  const file = e.clipboardData?.files?.[0];
                  if (file) {
                    setIsUploading(true);
                    try {
                      const uploadResponse = await uploadImage(file, token);
                      if (uploadResponse.success && uploadResponse.image_url) {
                        setSelectedImage(uploadResponse.image_url);
                      }
                    } finally {
                      setIsUploading(false);
                    }
                  }
                }}
              >
                {isUploading ? (
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : selectedImage ? (
                  <div className="relative w-full max-w-xs">
                    <img src={selectedImage} alt={`${t('uploadReference')}${prompt ? `: ${prompt}` : ''}`} className="w-full h-auto rounded-lg shadow" />
                    <button
                      type="button"
                      onClick={clearSelectedImage}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-background/90 hover:bg-background shadow"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-full"
                      variant="default"
                      disabled={isUploading}
                    >
                      {t('uploadReference')}
                    </Button>
                    <div className="text-xs text-muted-foreground">or drag & drop / paste</div>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  ref={fileInputRef}
                  disabled={isUploading}
                />
              </div>
            </div>
          )}

          {/* Bottom toolbar inside textarea */}
          <div className="absolute bottom-3 left-3 right-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Left side of toolbar reserved for future quick actions (kept minimal for cross-platform) */}
            </div>
            
            {/* Generate button */}
            <Button
              onClick={generateEmoji}
              disabled={
                isGenerating || isUploading || (activeTab === 'text' ? !prompt.trim() : !selectedImage)
              }
              size="sm"
              className={cn(
                "w-8 h-8 p-0 rounded-full transition-all",
                ((activeTab === 'text' && prompt.trim()) || (activeTab === 'image' && selectedImage)) && !isGenerating && !isUploading
                  ? "bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isGenerating ? (
                <div className="w-4 h-4 rounded-full bg-white/30 animate-pulse"></div>
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Prompt suggestions only in Text tab */}
        {activeTab === 'text' && (
          <div className="w-full">
            <div className="flex flex-wrap gap-2 justify-center">
              {getDefaultPrompts().map((promptText, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handlePromptClick(promptText)}
                  className={cn(
                    "px-4 py-2 text-sm rounded-full border border-border/50",
                    "bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground",
                    "transition-all duration-200 hover:shadow-md hover:border-border/70 hover:scale-105",
                    "backdrop-blur-sm",
                    "whitespace-nowrap"
                  )}
                >
                  {promptText}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Add CSS for hiding scrollbar */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );

  return (
    <>
      {content}
      
      {/* 登录对话框 */}
      <LoginDialog 
        open={showLoginDialog} 
        onOpenChange={setShowLoginDialog}
      />
      
      {/* 订阅限制对话框 */}
      {limitInfo && (
        <SubscriptionLimitDialog
          open={showSubscriptionDialog}
          onOpenChange={setShowSubscriptionDialog}
          limitInfo={limitInfo}
        />
      )}
    </>
  );
}
