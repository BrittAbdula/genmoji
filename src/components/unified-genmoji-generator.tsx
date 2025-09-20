"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef } from "react";
import { genMoji, uploadImage, GenerationLimitError } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  const [showModelSelector, setShowModelSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
    setGlobalPrompt(prompt.trim());
    
    try {
      const emojiResponse = await genMoji(prompt.trim(), locale, selectedImage, model, token);
      
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
    if (!prompt.trim()) return;
    
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
    setShowModelSelector(false);
  };

  // PC端模型选择器内容（更大缩略图，文字置于底部）
  const desktopModelSelectorContent = (
    <div className={cn(
      "grid max-w-6xl",
      // Responsive column count for web/desktop
      "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
      // Systematic, responsive gaps and padding
      "gap-4 sm:gap-5 lg:gap-6",
      "px-4 sm:px-6 lg:px-8 py-5"
    )}>
      {models.map((modelItem) => (
        <div
          key={modelItem.id}
          className={cn(
            "flex flex-col items-center select-none",
            "gap-2 sm:gap-3 p-3 sm:p-4 lg:p-5 rounded-3xl cursor-pointer",
            "transition-transform motion-safe:hover:scale-[1.015] hover:shadow-lg",
            model === modelItem.id
              ? "ring-2 ring-primary/50 bg-primary/5"
              : "hover:ring-1 hover:ring-border/50"
          )}
          onClick={() => handleModelSelect(modelItem.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleModelSelect(modelItem.id)}
        >
          <div className="rounded-2xl overflow-hidden shadow-md 
                          w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44">
            <Image
              src={modelItem.image}
              alt={modelItem.alt}
              width={176}
              height={176}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="font-semibold text-sm md:text-base leading-tight">{modelItem.name}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // 移动端模型选择器内容（更大缩略图 + 网格展示，文字置底）
  const mobileModelSelectorContent = (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5 px-3 sm:px-4 py-4 max-h-[72vh] overflow-y-auto overscroll-contain pr-1 scrollbar-hide">
      {models.map((modelItem) => (
        <div
          key={modelItem.id}
          className={cn(
            "flex flex-col items-center select-none",
            "gap-2 p-2 rounded-2xl cursor-pointer transition-transform",
            model === modelItem.id ? "ring-2 ring-primary/40 bg-primary/5" : "hover:ring-1 hover:ring-border/40"
          )}
          onClick={() => handleModelSelect(modelItem.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleModelSelect(modelItem.id)}
        >
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden">
            <Image
              src={modelItem.image}
              alt={modelItem.alt}
              width={144}
              height={144}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="text-[11px] sm:text-xs font-medium leading-tight">{modelItem.name}</div>
          </div>
        </div>
      ))}
    </div>
  );

  const content = (
    <div className="grid gap-4 py-4">
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
          <div className="flex w-full justify-center sm:justify-start p-2">
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
              rows={3}
              className={cn(
                "resize-none min-h-[120px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl bg-card text-lg p-4",
                "pb-16"
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
                    <img src={selectedImage} alt="Reference" className="w-full h-auto rounded-lg shadow" />
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
              {/* Optional prompt for image mode */}
              <div className="mt-3">
                <Textarea
                  placeholder={t('placeholder')}
                  value={prompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                  rows={2}
                  className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl bg-card text-sm"
                />
              </div>
            </div>
          )}

          {/* Bottom toolbar inside textarea */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Model selector button - always show */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {isMobile ? (
                      <Drawer open={showModelSelector} onOpenChange={setShowModelSelector}>
                        <DrawerTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 rounded-full hover:bg-muted flex items-center gap-2"
                          >
                            <Image 
                              src={currentModel.image}
                              alt={currentModel.name}
                              width={16}
                              height={16}
                              className="rounded-full"
                            />
                            <span className="text-sm font-medium">{currentModel.name}</span>
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>{t('selectModel')}</DrawerTitle>
                          </DrawerHeader>
                          <div className="pb-8">
                            {mobileModelSelectorContent}
                          </div>
                        </DrawerContent>
                      </Drawer>
                    ) : (
                      <Dialog open={showModelSelector} onOpenChange={setShowModelSelector}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 rounded-full hover:bg-muted flex items-center gap-2"
                          >
                            <Image 
                              src={currentModel.image}
                              alt={currentModel.name}
                              width={16}
                              height={16}
                              className="rounded-full"
                            />
                            <span className="text-sm font-medium">{currentModel.name}</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-fit">
                          <DialogHeader>
                            <DialogTitle>{t('selectModel')}</DialogTitle>
                          </DialogHeader>
                          {desktopModelSelectorContent}
                        </DialogContent>
                      </Dialog>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('selectModel')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Image upload button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {/* Upload icon removed; handled by Image tab */}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('selectModel')}</p>
                  </TooltipContent>
                  </Tooltip>
              </TooltipProvider>
            </div>
            
            {/* Generate button */}
            <Button
              onClick={generateEmoji}
              disabled={isGenerating || !prompt.trim() || isUploading}
              size="sm"
              className={cn(
                "w-8 h-8 p-0 rounded-full transition-all",
                prompt.trim() && !isGenerating && !isUploading
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

        {/* Prompt suggestions - moved outside input box and below it */}
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
