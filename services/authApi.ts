import { AuthCredentials, AuthRegistration, AuthUser } from '../types';

const requestJson = async <T>(url: string, payload?: unknown, method = 'POST'): Promise<T> => {
  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    const contentType = response.headers.get('Content-Type') || '';
    let errorMessage = `请求失败 (状态码 ${response.status})`;

    if (contentType.includes('application/json')) {
      try {
        const errorBody = await response.json();
        if (errorBody && typeof errorBody === 'object') {
          const maybeError =
            (errorBody as { error?: unknown; message?: unknown }).error ??
            (errorBody as { error?: unknown; message?: unknown }).message;
          if (typeof maybeError === 'string' && maybeError.trim()) {
            errorMessage = maybeError;
          }
        }
      } catch {
        // Ignore JSON parse errors and fall back to the generic message.
      }
    } else {
      const errorText = await response.text();
      if (errorText) {
        errorMessage = errorText;
      }
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
};

export const registerUser = async (payload: AuthRegistration): Promise<AuthUser> =>
  requestJson<AuthUser>('/api/auth/register', payload);

export const loginUser = async (payload: AuthCredentials): Promise<AuthUser> =>
  requestJson<AuthUser>('/api/auth/login', payload);

export const getCurrentUser = async (): Promise<AuthUser | null> =>
  requestJson<AuthUser | null>('/api/auth/me', undefined, 'GET');

export const logoutUser = async () => {
  await requestJson<{ ok: boolean }>('/api/auth/logout', {});
};
