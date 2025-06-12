import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders } from '@/lib/api-config';

export interface User {
  id: string;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isLoggedIn: false,

      login: (token: string, user: User) => {
        set({
          token,
          user,
          isLoggedIn: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isLoggedIn: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        
        try {
          const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH_ME}`, {
            headers: getAuthHeaders(token),
          });

          if (!response.ok) {
            throw new Error('Token invalid');
          }

          const result = await response.json();
          if (result.success && result.user) {
            set({
              user: result.user,
              isLoggedIn: true,
              isLoading: false,
            });
          } else {
            get().logout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
      // 添加存储配置以确保在客户端和服务端状态一致
      skipHydration: true,
    }
  )
); 