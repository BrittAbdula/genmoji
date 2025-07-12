// @ts-nocheck
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
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

const authStore: StateCreator<
  AuthState,
  [],
  [],
  AuthState
> = (set, get) => ({
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
        // 只有在明确的认证失败时才清除状态
        if (response.status === 401 || response.status === 403) {
          console.log('Token invalid, logging out');
          get().logout();
        } else {
          // 其他错误（如网络错误）不立即清除认证状态
          console.warn('Auth check failed with status:', response.status);
        }
        return;
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
});

// @ts-ignore - Zustand persist typing issue
export const useAuthStore = create<AuthState>()(
  persist(authStore, {
    name: 'auth-storage',
    partialize: (state) => ({
      token: state.token,
      user: state.user,
      isLoggedIn: state.isLoggedIn,
    }),
    skipHydration: true,
  })
); 