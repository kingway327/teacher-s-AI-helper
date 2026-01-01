import React, { useState } from 'react';
import { AuthCredentials, AuthRegistration, AuthUser } from '../types';
import { loginUser, registerUser } from '../services/authApi';

interface AuthPageProps {
  onAuthSuccess: (user: AuthUser) => void;
}

type AuthMode = 'login' | 'register';

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetErrors = () => setError(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetErrors();

    if (!email.trim() || !password.trim()) {
      setError('请输入邮箱和密码。');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setError('请输入姓名。');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致。');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const payload: AuthCredentials = { email, password };
        const user = await loginUser(payload);
        onAuthSuccess(user);
      } else {
        const payload: AuthRegistration = { name, email, password };
        const user = await registerUser(payload);
        onAuthSuccess(user);
      }
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : '登录失败，请稍后重试。';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl border border-slate-200 p-8">
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <div className="bg-indigo-600 p-3 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">AI 备课助手</h1>
            <p className="text-sm text-slate-500">
              {mode === 'login' ? '欢迎回来，请登录继续使用。' : '创建新账号，开始智能备课。'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 bg-slate-100 rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              mode === 'login' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            登录
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              mode === 'register' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            注册
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="请输入真实姓名"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="name@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="请输入密码"
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">确认密码</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                placeholder="再次输入密码"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-md font-medium shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70"
          >
            {isSubmitting ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
