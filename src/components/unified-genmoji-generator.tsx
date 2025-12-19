"use client";

// Dialog was used for the old model selector; no longer needed here
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef } from "react";
import { genMoji, uploadImage, GenerationLimitError, getSubscriptionStatus } from "@/lib/api";
// Tooltip not needed after removing bottom model selector trigger
import { Emoji } from "@/types/emoji";
import { X, Plus, ArrowUp, Globe, Crown, Info } from 'lucide-react';
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
import CameraModal from "@/components/camera-modal";

// Gem Stickers substyle typing (avoid never when indexing)
type GemSubStyleId =
  | 'pop-art'
  | 'japanese-matchbox'
  | 'cartoon-dino'
  | 'pixel-art'
  | 'royal'
  | 'football-sticker'
  | 'claymation'
  | 'vintage-bollywood'
  | 'sticker-bomb';
type GemSubStyle = { id: GemSubStyleId; imgUrl: string; selectedImgUrl: string };
const isGemSubStyleId = (v: unknown): v is GemSubStyleId =>
  typeof v === 'string' && [
    'pop-art','japanese-matchbox','cartoon-dino','pixel-art','royal','football-sticker','claymation','vintage-bollywood','sticker-bomb'
  ].includes(v);

interface UnifiedGenmojiGeneratorProps {
  initialPrompt?: string;
  onGenerated?: (emoji: Emoji) => void;
  init_model?: 'genmoji' | 'sticker' | 'mascot' | 'gemstickers' | 'claymation' | '3d' | 'origami' | 'cross-stitch' | 'steampunk' | 'liquid-metal' | 'pixel' | 'handdrawn' | null;
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
  const [mounted, setMounted] = useState(false);
  
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
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('image');
  const [selectedStyleId, setSelectedStyleId] = useState<GemSubStyleId | null>(null);
  const [selectedEmotionKey, setSelectedEmotionKey] = useState<string>('Happy');
  const [isPublic, setIsPublic] = useState(true);
  const [showPublicTooltip, setShowPublicTooltip] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  // Secondary style options (substyles) for the Gem Stickers model
  const gemSubStyles: readonly GemSubStyle[] = [
    { id: 'pop-art', imgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/pop_art_love.png', selectedImgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/pop_art_love_out.png' },
    { id: 'japanese-matchbox', imgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/matchbox_no_text.png', selectedImgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/matchbox_no_text_out.png' },
    { id: 'cartoon-dino', imgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/dragon.png', selectedImgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/dragon_out.png' },
    { id: 'pixel-art', imgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/pixel.png', selectedImgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/pixel_out.png' },
    { id: 'royal', imgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/royal.png', selectedImgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/royal_out.png' },
    { id: 'football-sticker', imgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/football.png', selectedImgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/football_out.png' },
    { id: 'claymation', imgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/claymation.png', selectedImgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/claymation_out.png' },
    { id: 'vintage-bollywood', imgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/bolly.png', selectedImgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/bolly_out.png' },
    { id: 'sticker-bomb', imgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/bomb.png', selectedImgUrl: 'https://gstatic.com/synthidtextdemo/images/gemstickers/dot/bomb_out.png' }
  ] as const;
  const gemEmotionKeys = ['Happy','Sad','Angry','Surprised','Laughing','Love','Winking','Confused'] as const;

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

  // 恢复已保存的样式和情绪选择
  useEffect(() => {
    try {
      const s = localStorage.getItem('genmoji:selectedStyleId');
      if (s && isGemSubStyleId(s)) setSelectedStyleId(s);
      const e = localStorage.getItem('genmoji:selectedEmotionKey');
      if (e) setSelectedEmotionKey(e);
    } catch {}
  }, []);

  // 防止 SSR 与客户端初始渲染不一致导致的水合报错
  useEffect(() => {
    setMounted(true);
  }, []);

  // 检查会员（订阅）状态，仅登录后查询
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (token) {
          const res = await getSubscriptionStatus(token);
          if (!cancelled) {
            const sub = res?.data?.subscription;
            setIsMember(!!(sub && sub.monthly_credit_limit));
          }
        } else {
          setIsMember(false);
        }
      } catch {
        setIsMember(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

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

  // 模型数据，统一管理所有模型信息
  const models = [
    {
      id: 'gemstickers' as const,
      name: t('models.gemstickers.name'),
      description: t('models.gemstickers.description'),
      image: "/emojis/handdrawn.png",
      alt: "Gem Stickers"
    },
    {
      id: 'genmoji' as const,
      name: t('models.genmoji.name'),
      description: t('models.genmoji.description'),
      image: "https://store.genmojionline.com/cdn-cgi/imagedelivery/DEOVdDdfeGzASe0KdtD7FA/4ad1e218-eae7-4976-8496-b68cd6374f00/public",
      alt: "Genmoji - iOS Apple Style"
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
    { id: 'claymation' as const, name: t('models.claymation.name'), description: t('models.claymation.description'), image: "/emojis/Claymation.png", alt: 'Claymation Genmoji' },
    { id: '3d' as const, name: t('models.3d.name'), description: t('models.3d.description'), image: "/emojis/3d.png", alt: '3D Genmoji' },
    { id: 'origami' as const, name: t('models.origami.name'), description: t('models.origami.description'), image: "/emojis/Origami.png", alt: 'Origami Genmoji' },
    { id: 'cross-stitch' as const, name: t('models.cross-stitch.name'), description: t('models.cross-stitch.description'), image: "/emojis/Cross-stitch-Pixel.png", alt: 'Cross-stitch Genmoji' },
    { id: 'steampunk' as const, name: t('models.steampunk.name'), description: t('models.steampunk.description'), image: "/emojis/Steampunk.png", alt: 'Steampunk Genmoji' },
    { id: 'liquid-metal' as const, name: t('models.liquid-metal.name'), description: t('models.liquid-metal.description'), image: "/emojis/Liquid-Metal.png", alt: 'Liquid Metal Genmoji' },
    { id: 'pixel' as const, name: t('models.pixel.name'), description: t('models.pixel.description'), image: "/emojis/pixel.png", alt: 'Pixel Genmoji' },
    { id: 'handdrawn' as const, name: t('models.handdrawn.name'), description: t('models.handdrawn.description'), image: "/emojis/handdrawn.png", alt: 'Hand-drawn Genmoji' }
  ];

  // Get current model info from the unified models array
  const getCurrentModelInfo = () => {
    return models.find(m => m.id === model) ?? models[0];
  };

  const currentModel = getCurrentModelInfo();
  // Top preview image adapts when Gem Stickers sub-style selected
  const currentGemSubStyle: GemSubStyle | null = (model === 'gemstickers' && selectedStyleId)
    ? (gemSubStyles.find((s) => s.id === selectedStyleId) ?? null)
    : null;
  const currentPreviewImage = currentGemSubStyle?.selectedImgUrl || currentGemSubStyle?.imgUrl || currentModel.image;
  const currentPreviewAlt = (model === 'gemstickers' && selectedStyleId)
    ? (t(`gemstyles.styles.${selectedStyleId}.name` as any) as string)
    : currentModel.name;

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

  // Camera helpers
  const stopCamera = () => {
    try {
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      cameraStreamRef.current = null;
      const v = cameraVideoRef.current;
      if (v) {
        try { v.pause(); } catch {}
        try { (v as any).srcObject = null; } catch {}
        // Force reflow to drop old frame on iOS
        try { v.removeAttribute('srcObject' as any); } catch {}
      }
    } catch {}
  };

  const startCamera = async (facing: 'user' | 'environment') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing } }, audio: false });
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) {
        const v = cameraVideoRef.current;
        // Ensure autoplay on iOS Safari
        v.muted = true;
        try { v.setAttribute('muted', ''); } catch {}
        v.srcObject = stream;
        if (v.readyState < 2) {
          await new Promise<void>((resolve) => {
            const onReady = () => { v.removeEventListener('loadedmetadata', onReady); resolve(); };
            v.addEventListener('loadedmetadata', onReady, { once: true });
          });
        }
        await v.play().catch(() => {});
        if (v.readyState < 2 || v.videoWidth === 0) {
          await new Promise((r) => setTimeout(r, 150));
          await v.play().catch(() => {});
        }
      }
      setShowCamera(true);
    } catch (e) {
      // Fallback to front camera when environment is not available
      if (facing === 'environment') {
        try {
          const fallback = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'user' } }, audio: false });
          cameraStreamRef.current = fallback;
          if (cameraVideoRef.current) {
            const v = cameraVideoRef.current;
            v.muted = true; try { v.setAttribute('muted', ''); } catch {}
            v.srcObject = fallback;
            if (v.readyState < 2) {
              await new Promise<void>((resolve) => {
                const onReady = () => { v.removeEventListener('loadedmetadata', onReady); resolve(); };
                v.addEventListener('loadedmetadata', onReady, { once: true });
              });
            }
            await v.play().catch(() => {});
            if (v.readyState < 2 || v.videoWidth === 0) {
              await new Promise((r) => setTimeout(r, 150));
              await v.play().catch(() => {});
            }
          }
          setCameraFacing('user');
          return;
        } catch (e2) {
          console.error('Camera open error (fallback failed):', e2);
        }
      } else if (facing === 'user') {
        // Try environment as a last fallback
        try {
          const fallback = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
          cameraStreamRef.current = fallback;
          if (cameraVideoRef.current) {
            const v = cameraVideoRef.current;
            v.muted = true; try { v.setAttribute('muted', ''); } catch {}
            v.srcObject = fallback;
            if (v.readyState < 2) {
              await new Promise<void>((resolve) => {
                const onReady = () => { v.removeEventListener('loadedmetadata', onReady); resolve(); };
                v.addEventListener('loadedmetadata', onReady, { once: true });
              });
            }
            await v.play().catch(() => {});
            if (v.readyState < 2 || v.videoWidth === 0) {
              await new Promise((r) => setTimeout(r, 150));
              await v.play().catch(() => {});
            }
          }
          setCameraFacing('environment');
          return;
        } catch (e3) {
          console.error('Camera open error (both facings failed):', e3);
        }
      }
      console.error('Camera open error:', e);
      alert('Unable to access camera');
    }
  };

  const openCamera = async () => {
    // Ensure previous stream fully stopped before requesting again
    stopCamera();
    // Show the modal immediately so user can see the interface
    setShowCamera(true);
    await startCamera(cameraFacing);
  };

  const closeCamera = () => {
    stopCamera();
    setShowCamera(false);
  };

  const switchCamera = async () => {
    const next = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(next);
    stopCamera();
    await startCamera(next);
  };

  const captureFromCamera = async () => {
    const video = cameraVideoRef.current;
    if (!video) return;
    const srcW = video.videoWidth || 1024;
    const srcH = video.videoHeight || 1024;
    // Center square crop from the video source to ensure 1:1
    const side = Math.min(srcW, srcH);
    const sx = Math.max(0, Math.floor((srcW - side) / 2));
    const sy = Math.max(0, Math.floor((srcH - side) / 2));

    const canvas = document.createElement('canvas');
    const target = Math.min(1024, side); // reasonable export size
    canvas.width = target;
    canvas.height = target;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw cropped square, mirror if front camera to match preview
    if (cameraFacing === 'user') {
      ctx.save();
      ctx.translate(target, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, sx, sy, side, side, 0, 0, target, target);
      ctx.restore();
    } else {
      ctx.drawImage(video, sx, sy, side, side, 0, 0, target, target);
    }

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const uniqueName = `camera-${Date.now()}.jpg`;
      const file = new File([blob], uniqueName, { type: 'image/jpeg' });
      setIsUploading(true);
      try {
        const res = await uploadImage(file, token);
        if (res.success && res.image_url) {
          setSelectedImage(res.image_url);
          setActiveTab('image');
        } else {
          alert(`Upload failed: ${res.error || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Upload error:', err);
      } finally {
        setIsUploading(false);
        closeCamera();
      }
    }, 'image/jpeg', 0.95);
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
    const effectivePrompt = (() => {
      const base = (prompt || '').trim();
      if (activeTab === 'image') {
        // Backend will build final prompt for image mode
        return '';
      }
      // Text mode: send user input only; backend will augment if needed
      return base;
    })();
      
    setGlobalPrompt(effectivePrompt);
    
    try {
      const submitModel = model; // always send top-level model; backend handles styleId/emotion
      const emojiResponse = await genMoji(effectivePrompt, locale, selectedImage, submitModel, token, {
        styleId: selectedStyleId,
        emotion: selectedEmotionKey,
        isPublic: isPublic
      });
      
      if (emojiResponse.success && emojiResponse.emoji) {
        // 不跳转详情页，直接在组件底部展示，可点击跳转
        setGeneratedEmoji(emojiResponse.emoji);
        triggerConfetti();
        if (onGenerated) onGenerated(emojiResponse.emoji);
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

  const generateGenmoji = async () => {
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


  const handleModelSelect = (modelId: string) => {
    setModel(modelId);
    try {
      localStorage.setItem('genmoji:selectedModel', modelId);
    } catch {}
  };

  const handleStyleSelect = (styleId: GemSubStyleId) => {
    setSelectedStyleId((prev: GemSubStyleId | null) => (prev === styleId ? null : styleId));
    try { localStorage.setItem('genmoji:selectedStyleId', styleId); } catch {}
  };

  const handleEmotionSelect = (key: string) => {
    setSelectedEmotionKey(key);
    try { localStorage.setItem('genmoji:selectedEmotionKey', key); } catch {}
  };

  // 初始进入时跑马灯快速预览一遍，最后停留在上次选择
  // 如果有 init_model 参数，跳过动画直接显示指定模型
  useEffect(() => {
    if (hasPlayedIntroAnimation.current) return;

    // 如果有 init_model 参数，直接显示指定模型，跳过跑马灯动画
    if (init_model) {
      hasPlayedIntroAnimation.current = true;
      // 确保模型选择器滚动到指定模型
      setTimeout(() => {
        const el = itemRefs.current[init_model];
        if (el) {
          try {
            el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          } catch {}
        }
      }, 100);
      return;
    }

    let raf = 0 as number | undefined;

    const run = () => {
      // 读取上次选择
      let saved: string | null = null;
      try { saved = localStorage.getItem('genmoji:selectedModel'); } catch {}
      const endModel = saved || model;

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
  }, [init_model]);

  // Removed old dialog/drawer model selectors in favor of inline selector bar

  const content = (
    <div className="flex flex-col gap-4 py-4">
      {/* Inline style selector bar */}
      <div className="w-full">
        {/* Large preview of the currently selected style */}
        <div className="w-full px-4 mb-3">
          <div className="relative mx-auto w-full max-w-[160px]">
            <Image
              src={currentPreviewImage}
              alt={currentPreviewAlt}
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
        {model === 'gemstickers' && (
          <div className="w-full px-4 mt-1">
            {/* Gem Stickers sub-styles */}
            <div className="w-full max-w-3xl mx-auto mb-3">
              <div className="mb-2 text-sm text-muted-foreground">{t('gemstyles.ui.selectStyle')}</div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1">
                {gemSubStyles.map((opt) => {
                  const selected = selectedStyleId === opt.id;
                  const label = t(`gemstyles.styles.${opt.id}.name` as any);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleStyleSelect(opt.id)}
                      className={cn(
                        "shrink-0 rounded-xl border p-2 text-left",
                        "bg-background hover:bg-muted/60",
                        selected ? "border-primary/50 shadow-sm" : "border-border"
                      )}
                      aria-pressed={selected}
                      title={label}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selected ? opt.selectedImgUrl : opt.imgUrl}
                        alt={label}
                        width={72}
                        height={72}
                        className="w-18 h-18 object-contain"
                      />
                      <div className="mt-1 text-xs truncate max-w-[80px]">{label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Emotions for Gem Stickers */}
            <div className="w-full max-w-3xl mx-auto">
              <div className="mb-2 text-sm text-muted-foreground">{t('gemstyles.ui.emotion')}</div>
              <div className="flex flex-wrap gap-2">
                {gemEmotionKeys.map((key) => {
                  const selected = selectedEmotionKey === key;
                  const label = t(`gemstyles.emotions.${key}` as any);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleEmotionSelect(key)}
                      className={cn(
                        "px-3 py-1.5 text-xs rounded-full border",
                        selected ? "border-primary/50 bg-primary/10" : "border-border bg-muted/40 hover:bg-muted/70"
                      )}
                      aria-pressed={selected}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      {isGenerating && (
        <div className="w-full">
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {/* Generated result will be rendered at the very bottom of the component */}

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
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder={t('placeholder')}
                value={prompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === 'Enter' && !e.shiftKey && prompt.trim() && !isGenerating) {
                    e.preventDefault();
                    generateGenmoji();
                  }
                }}
                rows={1}
                className={cn(
                  "resize-none min-h-[60px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl bg-card text-lg p-4",
                  "pb-16 placeholder:text-muted-foreground/50 placeholder:font-normal"
                )}
              />
              {/* Clear button - only show when there's text */}
              {prompt.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setPrompt("");
                    if (textareaRef.current) {
                      textareaRef.current.focus();
                    }
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
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
                  <div className="relative w-full max-w-xs aspect-square">
                    <img
                      src={selectedImage}
                      alt={`${t('uploadReference')}${prompt ? `: ${prompt}` : ''}`}
                      className="absolute inset-0 w-full h-full object-cover rounded-lg shadow"
                    />
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
                    <Button
                      type="button"
                      onClick={openCamera}
                      className="rounded-full"
                      variant="secondary"
                      disabled={isUploading}
                    >
                      {t('camera.takePhoto')}
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
            <div className="flex items-center gap-3">
              {/* Public Visibility toggle - visible to all users */}
              <div className="relative inline-flex items-center gap-2">
                {/* Label and info icon */}
                <span className="text-xs font-medium text-muted-foreground">
                  {t('publicVisibility.title')}
                </span>
                <button
                  type="button"
                  className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  onClick={() => setShowPublicTooltip(!showPublicTooltip)}
                  onMouseEnter={() => setShowPublicTooltip(true)}
                  onMouseLeave={() => setShowPublicTooltip(false)}
                  aria-label="Info"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                
                {/* Tooltip */}
                {showPublicTooltip && (
                  <div className="absolute left-0 bottom-full mb-2 z-50 w-64 p-3 text-xs bg-popover border border-border rounded-lg shadow-lg">
                    <p className="text-foreground/80">{t('publicVisibility.tooltip')}</p>
                    <a href="/terms" className="text-primary hover:underline mt-1 inline-block">
                      {t('publicVisibility.termsLink')}
                    </a>
                  </div>
                )}
                
                {/* Crown (members only) + Toggle */}
                <div className="flex items-center gap-1.5 ml-2">
                  <Crown className="w-3.5 h-3.5 text-yellow-500" />
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isPublic}
                    onClick={() => {
                      // Non-logged-in users: prompt login
                      if (!isLoggedIn) {
                        setPendingGeneration(false);
                        setShowLoginDialog(true);
                        return;
                      }
                      // Non-members: show subscription dialog
                      if (!isMember) {
                        const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                        setLimitInfo({ currentCount: 0, limit: 0, resetTime: in24h, type: 'monthly' });
                        setShowSubscriptionDialog(true);
                        return;
                      }
                      setIsPublic((v: boolean) => !v);
                    }}
                    title={isMember ? t('publicVisibility.title') : t('publicVisibility.membersOnly')}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      isPublic ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
                        isPublic ? "translate-x-4" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>
              {/* Left side of toolbar reserved for future quick actions (kept minimal for cross-platform) */}
            </div>
            
            {/* Generate button */}
            <Button
              onClick={generateGenmoji}
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

  if (!mounted) return null;

  return (
    <>
      {content}
      {/* Camera modal */}
      <CameraModal
        show={showCamera}
        title={t('cameraModalTitle')}
        onClose={closeCamera}
        onCapture={captureFromCamera}
        videoRef={cameraVideoRef}
        onSwitchCamera={switchCamera}
        switchLabel={t('camera.switchCamera')}
        mirrored={cameraFacing === 'user'}
      />
      {generatedEmoji && (
        <div className="mt-4 flex justify-center">
          <EmojiContainer emoji={generatedEmoji} size="lg" />
        </div>
      )}
      
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
