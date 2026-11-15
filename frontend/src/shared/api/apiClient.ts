import axios, { isAxiosError } from 'axios';

import { API_URL } from '@/shared/config/api';

/** Общий HTTP-клиент API; JSON сериализуется Axios, FormData — браузером. */
export const API_CLIENT = axios.create({
  baseURL: API_URL,
  headers: { Accept: 'application/json' },
});

/** Подключает чтение актуального токена без зависимости от хранилища пользователя. */
export function configureApiClient(
  getAccessToken: () => string | undefined,
  onUnauthorized: () => void,
): () => void {
  const interceptorId = API_CLIENT.interceptors.request.use((request) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    } else {
      request.headers.delete('Authorization');
    }
    return request;
  });

  const responseInterceptorId = API_CLIENT.interceptors.response.use(undefined, (error: unknown) => {
    if (isAxiosError<unknown>(error) && error.response?.status === 401) {
      const accessToken = getAccessToken();
      const authorization = error.config?.headers.get('Authorization');
      if (accessToken && authorization === `Bearer ${accessToken}`) {
        onUnauthorized();
      }
    }
    return Promise.reject(error);
  });

  return () => {
    API_CLIENT.interceptors.request.eject(interceptorId);
    API_CLIENT.interceptors.response.eject(responseInterceptorId);
  };
}

API_CLIENT.interceptors.response.use(undefined, (error: unknown) => {
  if (isAxiosError<unknown>(error)) {
    const responseBody = error.response?.data;
    if (typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody) {
      if (typeof responseBody.message === 'string') {
        error.message = responseBody.message;
      }
    }
  }
  return Promise.reject(error);
});
