export interface User {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  createdAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UnnothorizedTokenData {
  token: string | null;
}

export interface ResetPassword {
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const ErrorCode = {
  USER_EMAIL_ALREADY_EXISTS: 'USER_EMAIL_ALREADY_EXISTS',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Результат входа после преобразования профиля API. */
export type AuthSession = {
  readonly accessToken: string;
  readonly user: User;
};

/** Ответ сервера на вход по email или OAuth. */
export type AuthResponse = {
  readonly accessToken: string;
  readonly user: {
    readonly id: string;
    readonly firstName?: string | null;
    readonly lastName?: string | null;
    readonly email: string;
    readonly createdAt: string;
  };
};
