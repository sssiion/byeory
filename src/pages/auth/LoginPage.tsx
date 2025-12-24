import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';

function LoginPage() {
    const navigate = useNavigate();
    const { login, socialLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // A simple fake login using the entered email
        if (email && password) {
            login(email);
            navigate('/');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="mb-8 block text-center">
                    <img src="/logo.png" alt="벼리" className="mx-auto w-32 mb-4" />
                    <h1 className="theme-text-primary mb-2 text-3xl font-bold">환영합니다</h1>
                    <p className="theme-text-secondary text-sm">벼리에 로그인하여 일상을 기록하세요</p>
                </Link>

                {/* Login Form */}
                <div className="theme-bg-card theme-border rounded-2xl border p-8 shadow-lg backdrop-blur-md">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="theme-text-primary block text-sm font-medium">
                                이메일
                            </label>
                            <div className="relative border rounded-lg">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="example@email.com"
                                    required
                                    className="theme-border theme-text-primary placeholder:text-gray-400 w-full rounded-lg border bg-transparent px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                                <Mail className="theme-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="theme-text-primary block text-sm font-medium">
                                비밀번호
                            </label>
                            <div className="relative border rounded-lg">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="theme-border theme-text-primary placeholder:text-gray-400 w-full rounded-lg border bg-transparent px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                                <Lock className="theme-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="theme-text-secondary hover:theme-text-primary absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Keep Signed In & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="accent-blue-500 h-4 w-4 rounded" />
                                <span className="theme-text-secondary text-sm">로그인 유지</span>
                            </label>
                            <Link to="/find-password" className="theme-text-primary hover:underline text-sm transition-colors">
                                비밀번호 찾기
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="theme-btn w-full rounded-lg py-3 font-semibold shadow-lg">
                            로그인
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="theme-border flex-1 border-t"></div>
                        <span className="theme-text-secondary text-sm">또는</span>
                        <div className="theme-border flex-1 border-t"></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-3 border rounded-lg p-1">
                        <GoogleLoginButton
                            onSuccess={async (credential) => {
                                const success = await socialLogin(credential);
                                if (success) {
                                    navigate('/');
                                } else {
                                    alert("Social Login Failed");
                                }
                            }}
                            onError={() => console.error("Google Login Failed")}
                        />
                    </div>

                    {/* Sign Up Link */}
                    <p className="theme-text-secondary mt-6 text-center text-sm">
                        계정이 없으신가요?{' '}
                        <Link to="/join" className="theme-text-primary font-medium hover:underline transition-colors">
                            회원가입
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
