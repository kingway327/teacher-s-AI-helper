import { AuthCredentials, AuthRegistration, AuthUser } from '../types';

const parseErrorResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const data = await response.json().catch(() => null);
    if (data?.error) {
      return data.error as string;
    }
  }
  return response.text();
};

const requestJson = async <T>(url: string, payload?: unknown, method = 'POST'): Promise<T> => {
  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
  });

  if (!response.ok) {
    const errorText = await parseErrorResponse(response);
    throw new Error(errorText || `Request failed with status ${response.status}`);
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
