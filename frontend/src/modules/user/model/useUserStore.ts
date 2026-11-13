import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginData, RegisterData } from './user.types';
import * as userService from '../api/userService.ts';

interface UserState {
  user: User | null;
  isAuth: boolean;
  accessToken: string | undefined;
  authSessionId: string | undefined;
  error: string | null;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  loginGoogle: (code: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (
    data: Partial<Pick<User, 'name' | 'email' | 'phone' | 'avatar'>>,
  ) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuth: false,
      accessToken: undefined,
      authSessionId: undefined,
      error: null,

      login: async (data: LoginData) => {
        const session = await userService.login(data);
        if (session) {
          set({
            user: session.user,
            accessToken: session.accessToken,
            authSessionId: crypto.randomUUID(),
            isAuth: true,
            error: null,
          });
          return true;
        }
        set({ error: 'Неверный email или пароль' });
        return false;
      },

      loginGoogle: async (code: string) => {
        const session = await userService.loginWithGoogle(code);
        if (session) {
          set({
            user: session.user,
            accessToken: session.accessToken,
            authSessionId: crypto.randomUUID(),
            isAuth: true,
            error: null,
          });
          return true;
        }
        set({ error: 'Ошибка авторизации через Google' });
        return false;
      },

      register: async (data: RegisterData) => {
        try {
          const user = await userService.register(data);
          set({ user, isAuth: true, error: null });
          return true;
        } catch {
          set({ error: 'Этот email уже зарегистрирован' });
          return false;
        }
      },

      logout: () =>
        set({
          user: null,
          accessToken: undefined,
          authSessionId: undefined,
          isAuth: false,
          error: null,
        }),

      updateProfile: async (data) => {
        const { user } = get();
        if (!user) return;
        const updated = await userService.updateProfile(user.id, data);
        set({ user: updated });
      },

      changePassword: async (oldPassword, newPassword) => {
        const { user } = get();
        if (!user) return false;
        const success = await userService.changePassword(user.id, oldPassword, newPassword);
        if (!success) set({ error: 'Неверный текущий пароль' });
        else set({ error: null });
        return success;
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'book-app-user' },
  ),
);
