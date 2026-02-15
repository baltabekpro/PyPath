import React, { useState } from 'react';
import { View } from '../types';
import { UserPlus, Mail, Lock, Eye, EyeOff, Gamepad2, User, CheckCircle, AlertCircle } from 'lucide-react';

interface RegisterProps {
  setView: (view: View) => void;
  onRegister: (email: string, password: string, username: string) => void;
}

export const Register: React.FC<RegisterProps> = ({ setView, onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    const levels = [
      { level: 1, text: 'Слабый', color: 'bg-red-500' },
      { level: 2, text: 'Средний', color: 'bg-yellow-500' },
      { level: 3, text: 'Хороший', color: 'bg-blue-500' },
      { level: 4, text: 'Отличный', color: 'bg-green-500' },
    ];

    return levels[strength - 1] || { level: 0, text: '', color: '' };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (!username || !email || !password || !confirmPassword) {
      setError('Заполните все поля');
      return;
    }

    if (username.length < 3) {
      setError('Имя пользователя должно быть не менее 3 символов');
      return;
    }

    if (!email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (!acceptTerms) {
      setError('Примите условия использования');
      return;
    }

    setIsLoading(true);

    // Симуляция запроса к API
    setTimeout(() => {
      onRegister(email, password, username);
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
          <p className="text-gray-400">Начни своё путешествие в код</p>
        </div>

        {/* Register Card */}
        <div className="bg-py-surface border border-py-accent rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus className="text-py-green" size={28} />
            Регистрация
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400 animate-fade-in">
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Имя пользователя
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="coolcoder"
                  className="w-full pl-11 pr-4 py-3 bg-py-dark border border-py-accent rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-py-green transition-colors"
                />
              </div>
            </div>

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
              {/* Password Strength */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength.level ? passwordStrength.color : 'bg-gray-700'
                        }`}
                      ></div>
                    ))}
                  </div>
                  {passwordStrength.text && (
                    <p className="text-xs text-gray-400">
                      Надежность: <span className={passwordStrength.color.replace('bg-', 'text-')}>{passwordStrength.text}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Подтверждение пароля
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-11 pr-11 py-3 bg-py-dark border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${
                    confirmPassword && password === confirmPassword
                      ? 'border-green-500'
                      : confirmPassword && password !== confirmPassword
                      ? 'border-red-500'
                      : 'border-py-accent focus:border-py-green'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-py-green"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {confirmPassword && password === confirmPassword && (
                  <CheckCircle className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500" size={20} />
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded bg-py-dark border-py-accent text-py-green focus:ring-py-green"
              />
              <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer">
                Я принимаю{' '}
                <a href="#" className="text-py-green hover:underline">
                  условия использования
                </a>{' '}
                и{' '}
                <a href="#" className="text-py-green hover:underline">
                  политику конфиденциальности
                </a>
              </label>
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
                  Регистрация...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Зарегистрироваться
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-6 text-gray-400">
            Уже есть аккаунт?{' '}
            <button
              onClick={() => setView(View.LOGIN)}
              className="text-py-green font-semibold hover:underline"
            >
              Войти
            </button>
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-6 bg-py-surface/50 border border-py-accent/50 rounded-xl p-4">
          <p className="text-sm font-semibold text-gray-400 mb-3">После регистрации вы получите:</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-py-green flex-shrink-0" />
              Доступ ко всем курсам и урокам
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-py-green flex-shrink-0" />
              Персональный трекер прогресса
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-py-green flex-shrink-0" />
              Достижения и рейтинг
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-py-green flex-shrink-0" />
              AI-ассистент для помощи в обучении
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
