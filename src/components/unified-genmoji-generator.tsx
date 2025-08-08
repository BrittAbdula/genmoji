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
import { ImageIcon, X, Plus, ArrowUp, Globe } from 'lucide-react';
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
  const [model, setModel] = useState<'genmoji' | 'sticker' | 'mascot'>(init_model || 'genmoji');
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
    switch (model) {
      case 'genmoji':
        return {
          image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/ba791d54-9c81-47d4-dc1f-32f2014b8300/public",
          name: t('models.genmoji.name'),
          description: t('models.genmoji.description')
        };
      case 'sticker':
        return {
          image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/8ef04dd2-6612-496a-d2ea-bada5ccf9400/public",
          name: t('models.sticker.name'),
          description: t('models.sticker.description')
        };
      case 'mascot':
        return {
          image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/14a1b15b-9263-4d20-443d-67c5e4c4c900/public",
          name: t('models.mascot.name'),
          description: t('models.mascot.description')
        };
      default:
        return {
          image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/ba791d54-9c81-47d4-dc1f-32f2014b8300/public",
          name: t('models.genmoji.name'),
          description: t('models.genmoji.description')
        };
    }
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
      image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/ba791d54-9c81-47d4-dc1f-32f2014b8300/public",
      alt: "Genmoji"
    },
    {
      id: 'sticker' as const,
      name: t('models.sticker.name'),
      description: t('models.sticker.description'),
      image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/8ef04dd2-6612-496a-d2ea-bada5ccf9400/public",
      alt: "Sticker"
    },
    {
      id: 'mascot' as const,
      name: t('models.mascot.name'),
      description: t('models.mascot.description'),
      image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/14a1b15b-9263-4d20-443d-67c5e4c4c900/public",
      alt: "Mascot"
    }
  ];

  const handleModelSelect = (modelId: 'genmoji' | 'sticker' | 'mascot') => {
    setModel(modelId);
    setShowModelSelector(false);
  };

  // PC端模型选择器内容
  const desktopModelSelectorContent = (
    <div className={cn(
      "grid gap-4 p-6",
      models.length <= 3 ? "grid-cols-3 max-w-xl" : "grid-cols-2 max-w-lg"
    )}>
      {models.map((modelItem) => (
        <div
          key={modelItem.id}
          className={cn(
            "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg hover:scale-105",
            model === modelItem.id ? "border-primary bg-primary/5 shadow-lg" : "border-gray-200 hover:border-gray-300"
          )}
          onClick={() => handleModelSelect(modelItem.id)}
        >
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md">
            <Image
              src={modelItem.image}
              alt={modelItem.alt}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <div className="font-semibold text-sm">{modelItem.name}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // 移动端模型选择器内容
  const mobileModelSelectorContent = (
    <div className="grid grid-cols-1 gap-3 p-4">
      {models.map((modelItem) => (
        <div
          key={modelItem.id}
          className={cn(
            "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
            model === modelItem.id ? "border-primary bg-primary/5 shadow-md" : "border-gray-200 hover:border-gray-300"
          )}
          onClick={() => handleModelSelect(modelItem.id)}
        >
          <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
            <Image
              src={modelItem.image}
              alt={modelItem.alt}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-base">{modelItem.name}</div>
            <div className="text-sm text-muted-foreground mt-1">{modelItem.description}</div>
          </div>
          {model === modelItem.id && (
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
          )}
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
              "resize-none min-h-[100px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl bg-card text-lg p-4",
              "pb-16" // Fixed padding bottom for consistent layout
            )}
          />
          
          {(selectedImage || isUploading) && (
            <div className="absolute top-2 right-2">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border bg-muted">
                {isUploading ? (
                  // 上传动画
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : selectedImage ? (
                  // 已上传的图片
                  <>
                    <img
                      src={selectedImage}
                      alt="Selected reference"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={clearSelectedImage}
                      className="absolute top-0 right-0 p-0.5 rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : null}
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-8 h-8 p-0 rounded-full hover:bg-muted",
                        selectedImage ? "text-primary" : "",
                        isUploading ? "cursor-not-allowed opacity-50" : ""
                      )}
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <ImageIcon className="h-4 w-4" />
                      )}
                                        </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('uploadReference')}</p>
                  </TooltipContent>
                  </Tooltip>
              </TooltipProvider>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                ref={fileInputRef}
                disabled={isUploading}
              />
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