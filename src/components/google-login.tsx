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
  }
}

export function GoogleLogin({ className }: GoogleLoginProps) {
  const t = useTranslations('auth');
  const { login, setLoading, isLoading } = useAuthStore();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleGoogleLogin = async (response: any) => {
    setLoading(true);
    
    try {
      const loginResponse = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
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

  useEffect(() => {
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
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            callback: handleGoogleLogin, // 传递函数而不是字符串
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false, // 禁用 FedCM 以避免某些兼容性问题
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
        } catch (error) {
          console.error('Google login initialization error:', error);
        }
      }
    };

    loadGoogleAPI();

    // 清理函数
    return () => {
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.cancel();
        } catch (error) {
          console.log('Cleanup error:', error);
        }
      }
    };
  }, []);

  if (isLoading) {
    return (
      <Button disabled className={className}>
        {t('signing_in')}...
      </Button>
    );
  }

  return <div ref={googleButtonRef} className={className} />;
}