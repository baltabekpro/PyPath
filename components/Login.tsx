import React, { useState } from 'react';
import { View } from '../types';
import { LogIn, Mail, Lock, Eye, EyeOff, Gamepad2, Zap, AlertCircle } from 'lucide-react';

interface LoginProps {
  setView: (view: View) => void;
  onLogin: (email: string, password: string) => void;
}

export const Login: React.FC<LoginProps> = ({ setView, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Валидация
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    if (!email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    setIsLoading(true);
    
    // Симуляция запроса к API
    setTimeout(() => {
      onLogin(email, password);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-py-dark flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-py-green/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-py-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-arcade-action to-red-500 rounded-3xl mb-4 shadow-neon-orange">
            <Gamepad2 size={40} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-display font-black text-white mb-2">
            PyPath<br/>Academy
          </h1>
          <p className="text-gray-400">Погрузись в мир программирования</p>
        </div>

        {/* Login Card */}
        <div className="bg-py-surface border border-py-accent rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <LogIn className="text-py-green" size={28} />
            Вход в систему
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400 animate-fade-in">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-11 pr-4 py-3 bg-py-dark border border-py-accent rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-py-green transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-py-dark border border-py-accent rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-py-green transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-py-green"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-py-dark border-py-accent text-py-green focus:ring-py-green"
                />
                <span>Запомнить меня</span>
              </label>
              <button type="button" className="text-py-green hover:underline">
                Забыли пароль?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-py-green text-py-dark rounded-lg font-bold text-lg hover:bg-py-green/90 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-py-dark border-t-transparent rounded-full animate-spin"></div>
                  Вход...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Войти
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-py-accent"></div>
            <span className="text-sm text-gray-500">или</span>
            <div className="flex-1 h-px bg-py-accent"></div>
          </div>

          {/* Quick Demo Login */}
          <button
            onClick={() => {
              setEmail('demo@pypath.dev');
              setPassword('demo123');
            }}
            className="w-full py-2.5 bg-py-dark border border-py-accent rounded-lg text-gray-400 hover:text-white hover:border-py-green transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={18} />
            Демо-вход
          </button>

          {/* Register Link */}
          <p className="text-center mt-6 text-gray-400">
            Нет аккаунта?{' '}
            <button
              onClick={() => setView(View.REGISTER)}
              className="text-py-green font-semibold hover:underline"
            >
              Зарегистрироваться
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Продолжая, вы соглашаетесь с нашими{' '}
          <a href="#" className="text-py-green hover:underline">Условиями использования</a>
        </div>
      </div>
    </div>
  );
};
