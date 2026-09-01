import { create } from 'zustand';
import { api } from '@/utils/api';

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  rating: number;
  totalShots: number;
  bestWinStreak: number;
  currentStreak: number;
}

export interface UserXp {
  totalXp: number;
  currentLevel: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  isGuest: boolean;
  stats?: UserStats;
  xp?: UserXp;
  currentRank?: {
    rating: number;
    rank: string;
    division: number;
    peakRating: number;
  };
  createdAt?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  guestLogin: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/auth/me');
      if (res.data?.data?.user) {
        set({ user: res.data.data.user, isAuthenticated: true, error: null });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (emailOrUsername, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { emailOrUsername, password });
      const { user, token } = res.data.data;
      if (token) {
        try { localStorage.setItem('penfight_token', token); } catch {}
      }
      set({ user, isAuthenticated: true, error: null });
    } catch (err: any) {
      set({ error: err.message || 'Login failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { username, email, password });
      const { user, token } = res.data.data;
      if (token) {
        try { localStorage.setItem('penfight_token', token); } catch {}
      }
      set({ user, isAuthenticated: true, error: null });
    } catch (err: any) {
      set({ error: err.message || 'Registration failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  guestLogin: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/guest');
      const { user, token } = res.data.data;
      if (token) {
        try { localStorage.setItem('penfight_token', token); } catch {}
      }
      set({ user, isAuthenticated: true, error: null });
    } catch (err: any) {
      set({ error: err.message || 'Guest login failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      localStorage.removeItem('penfight_token');
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },
}));
