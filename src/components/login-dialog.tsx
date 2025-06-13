"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { GoogleLogin } from "./google-login";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface LoginDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LoginDialog({ children, open: controlledOpen, onOpenChange }: LoginDialogProps) {
  const t = useTranslations('auth');
  const [internalOpen, setInternalOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // 使用外部控制的 open 状态，如果没有则使用内部状态
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const content = (
    <div className="flex flex-col items-center gap-4 py-4">
      <GoogleLogin />
      <p className="text-xs text-muted-foreground text-center max-w-xs px-4">
        {t('privacy_notice')}
      </p>
    </div>
  );

  const trigger = children || (
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <LogIn className="h-4 w-4" />
      {t('login')}
    </Button>
  );

  // 如果是外部控制且没有 children，直接返回对话框内容
  const isControlled = controlledOpen !== undefined;

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        {!isControlled || children ? (
          <DrawerTrigger asChild>
            {trigger}
          </DrawerTrigger>
        ) : null}
        <DrawerContent className="px-0">
          <DrawerHeader className="px-6">
            <DrawerTitle>{t('welcome_back')}</DrawerTitle>
            <DrawerDescription>{t('login_description')}</DrawerDescription>
          </DrawerHeader>
          <div className="px-6 pb-8">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled || children ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('welcome_back')}</DialogTitle>
          <DialogDescription>{t('login_description')}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
} 