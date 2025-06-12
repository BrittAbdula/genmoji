"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";

export function AuthHydration({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // 在客户端初始化时检查认证状态
    checkAuth();
  }, [checkAuth]);

  return <>{children}</>;
} 