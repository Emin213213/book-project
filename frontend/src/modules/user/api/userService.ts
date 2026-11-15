import type { User, LoginData, RegisterData, UnnothorizedTokenData } from '../model/user.types';
import type { AuthResponse, AuthSession } from '../model/user.types';
import initialUsers from './users.json';
import { API_CLIENT } from '@/shared/api/apiClient';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  avatar: string | null;
  createdAt: string;
}

const users: UserRecord[] = [...initialUsers];
let nextId = Math.max(...users.map((u) => u.id)) + 1;

function toUser(record: UserRecord): User {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    phone: record.phone,
    avatar: record.avatar,
    createdAt: record.createdAt,
  };
}

/** Отправляет запрос на восстановление доступа. */
export async function unnathorizedToken(input: UnnothorizedTokenData): Promise<void> {
  await API_CLIENT.post('/unnathorized-password', input);
}

/** Преобразует ответ авторизации в состояние клиентской сессии. */
function toAuthSession(response: AuthResponse): AuthSession {
  if (!response.accessToken || !response.user) {
    throw new Error('Некорректный ответ авторизации');
  }
  const profile = response.user;
  return {
    accessToken: response.accessToken,
    user: {
      id: profile.id,
      name: [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.email,
      email: profile.email,
      phone: '',
      avatar: null,
      createdAt: profile.createdAt,
    },
  };
}

/** Выполняет вход и возвращает профиль с access-токеном. */
export async function login(input: LoginData): Promise<AuthSession | undefined> {
  const response = await API_CLIENT.post<AuthResponse>('/auth/login', input, {
    validateStatus: (status) => status >= 200 && status < 500,
  });
  if (response.status >= 400) {
    return undefined;
  }
  return toAuthSession(response.data);
}

/** Обменивает код Google на клиентскую сессию. */
export async function loginWithGoogle(code: string): Promise<AuthSession | undefined> {
  const response = await API_CLIENT.post<AuthResponse>('/auth/oauth/google/confirm', { code }, {
    validateStatus: (status) => status >= 200 && status < 500,
  });
  if (response.status >= 400) {
    return undefined;
  }
  return toAuthSession(response.data);
}

export async function register(data: RegisterData): Promise<User> {
  const existing = users.find((u) => u.email === data.email);
  if (existing) throw new Error('Email already exists');

  const record: UserRecord = {
    id: nextId++,
    name: data.name,
    email: data.email,
    password: data.password,
    phone: '',
    avatar: null,
    createdAt: new Date().toISOString(),
  };
  users.push(record);
  return toUser(record);
}

export async function updateProfile(
  id: User['id'],
  data: Partial<Pick<User, 'name' | 'email' | 'phone' | 'avatar'>>,
): Promise<User> {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('User not found');
  users[idx] = { ...users[idx], ...data };
  return toUser(users[idx]);
}

export async function changePassword(
  id: User['id'],
  oldPassword: string,
  newPassword: string,
): Promise<boolean> {
  const user = users.find((u) => u.id === id);
  if (!user || user.password !== oldPassword) return false;
  user.password = newPassword;
  return true;
}
