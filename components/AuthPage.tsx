import React, { useState } from 'react';
import { Lock, Mail, User, Eye, EyeOff, Sparkles, Terminal } from 'lucide-react';
import { apiGet, apiPost } from '../api';

interface AuthPageProps {
    onAuthSuccess: (token: string, user: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [loginData, setLoginData] = useState({
        username: '',
        password: ''
    });
    
    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: '',
        fullName: ''
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiPost<{ access_token: string, token_type: string }>('/auth/login', loginData);
            localStorage.setItem('token', response.access_token);
            
            // Get user data
            const userData = await apiGet<any>('/auth/me');
            
            onAuthSuccess(response.access_token, userData);
        } catch (err: any) {
            setError(err.message || 'Ошибка входа. Проверьте логин и пароль.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (registerData.password.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            setLoading(false);
            return;
        }

        try {
            const response = await apiPost<{ access_token: string, token_type: string }>('/auth/register', registerData);
            localStorage.setItem('token', response.access_token);
            
            // Get user data
            const userData = await apiGet<any>('/auth/me');
            
            onAuthSuccess(response.access_token, userData);
        } catch (err: any) {
            setError(err.message || 'Ошибка регистрации. Возможно, пользователь уже существует.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-slate-900 to-[#1E293B] p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-20 size-96 bg-arcade-primary/20 blur-[120px] rounded-full animate-float"></div>
                <div className="absolute bottom-20 right-20 size-96 bg-arcade-action/20 blur-[120px] rounded-full animate-float" style={{animationDelay: '2s'}}></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center size-20 bg-arcade-primary rounded-3xl mb-4 shadow-neon-purple">
                        <Terminal size={40} className="text-white" strokeWidth={2.5} />
                    </div>
                    <h1 className="text-4xl font-display font-black text-white mb-2">PyPath</h1>
                    <p className="text-slate-600 dark:text-gray-400 font-medium">Взломай путь к знаниям</p>
                </div>

                {/* Auth Card */}
                <div className="bg-arcade-card border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
                    {/* Toggle Tabs */}
                    <div className="flex gap-2 mb-8 p-1 bg-black/40 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                                isLogin 
                                    ? 'bg-arcade-primary text-white shadow-lg' 
                                    : 'text-slate-600 dark:text-gray-400 hover:text-white'
                            }`}
                        >
                            Вход
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                                !isLogin 
                                    ? 'bg-arcade-action text-white shadow-lg' 
                                    : 'text-slate-600 dark:text-gray-400 hover:text-white'
                            }`}
                        >
                            Регистрация
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {/* Login Form */}
                    {isLogin ? (
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-2">Логин</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={loginData.username}
                                        onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-arcade-primary focus:outline-none transition-colors"
                                        placeholder="Введите логин"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-2">Пароль</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                        className="w-full pl-12 pr-12 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-arcade-primary focus:outline-none transition-colors"
                                        placeholder="Введите пароль"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-arcade-primary to-purple-600 text-white font-black text-lg rounded-xl hover:scale-[1.02] active:scale-95 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? 'Загрузка...' : (
                                    <>
                                        <Sparkles size={20} />
                                        Войти
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        /* Register Form */
                        <form onSubmit={handleRegister} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-2">Логин</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={registerData.username}
                                        onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-arcade-action focus:outline-none transition-colors"
                                        placeholder="Придумайте логин"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-arcade-action focus:outline-none transition-colors"
                                        placeholder="ваш@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-2">Полное имя</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={registerData.fullName}
                                        onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-arcade-action focus:outline-none transition-colors"
                                        placeholder="Иван Иванов"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-600 dark:text-gray-400 mb-2">Пароль</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                                        className="w-full pl-12 pr-12 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-arcade-action focus:outline-none transition-colors"
                                        placeholder="Минимум 6 символов"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-arcade-action to-orange-600 text-white font-black text-lg rounded-xl hover:scale-[1.02] active:scale-95 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? 'Создание...' : (
                                    <>
                                        <Sparkles size={20} />
                                        Создать аккаунт
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer Text */}
                <p className="text-center text-slate-500 dark:text-gray-400 text-sm mt-6">
                    Присоединяйся к тысячам разработчиков
                </p>
            </div>
        </div>
    );
};
