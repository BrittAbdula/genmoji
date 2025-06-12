"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface GoogleLoginProps {
  className?: string;
}

declare global {
  interface Window {
    google: any;
    googleLoginCallback: (response: any) => void;
  }
}

export function GoogleLogin({ className }: GoogleLoginProps) {
  const t = useTranslations('auth');
  const { login, setLoading, isLoading } = useAuthStore();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 定义全局回调函数
    window.googleLoginCallback = async (response: any) => {
      setLoading(true);
      
      try {
        const loginResponse = await fetch('/auth/google-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_token: response.credential
          })
        });

        const result = await loginResponse.json();
        
        if (result.success) {
          login(result.token, result.user);
        } else {
          console.error('Login failed:', result.error);
        }
      } catch (error) {
        console.error('Login error:', error);
      } finally {
        setLoading(false);
      }
    };

    // 加载 Google API
    const loadGoogleAPI = () => {
      if (window.google) {
        initializeGoogleLogin();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleLogin;
      document.head.appendChild(script);
    };

    const initializeGoogleLogin = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: 'googleLoginCallback',
          auto_select: false,
        });

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width: 250,
            logo_alignment: 'center',
          }
        );
      }
    };

    loadGoogleAPI();

    return () => {
      if ('googleLoginCallback' in window) {
        delete (window as any).googleLoginCallback;
      }
    };
  }, [login, setLoading]);

  if (isLoading) {
    return (
      <Button disabled className={className}>
        {t('signing_in')}...
      </Button>
    );
  }

  return <div ref={googleButtonRef} className={className} />;
} 