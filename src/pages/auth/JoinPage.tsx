import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GoogleLoginButton from '../../components/auth/GoogleLoginButton';

function JoinPage() {
    const navigate = useNavigate();
    const { socialLogin, signup } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== passwordConfirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        const success = await signup(email, password);
        if (success) {
            alert("회원가입이 완료되었습니다.");
            navigate('/login');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="mb-8 block text-center">
                    <img src="/logo.png" alt="벼리" className="mx-auto w-32 mb-4" />
                    <h1 className="theme-text-primary mb-2 text-3xl font-bold">회원가입</h1>
                    <p className="theme-text-secondary text-sm">벼리와 함께 일상을 기록해보세요</p>
                </Link>

                {/* Join Form */}
                <div className="theme-bg-card theme-border rounded-2xl border p-8 shadow-lg backdrop-blur-md">
                    <form onSubmit={handleJoin} className="space-y-6">
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

                        {/* Password Confirm Input */}
                        <div className="space-y-2">
                            <label htmlFor="passwordConfirm" className="theme-text-primary block text-sm font-medium">
                                비밀번호 확인
                            </label>
                            <div className="relative border rounded-lg">
                                <input
                                    id="passwordConfirm"
                                    type={showPasswordConfirm ? 'text' : 'password'}
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="theme-border theme-text-primary placeholder:text-gray-400 w-full rounded-lg border bg-transparent px-4 py-3 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                />
                                <Lock className="theme-icon absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-70" />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    className="theme-text-secondary hover:theme-text-primary absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                                >
                                    {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className="theme-btn w-full rounded-lg h-12 font-semibold shadow-lg">
                            회원가입
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-3">
                        <div className="theme-border flex-1 border-t"></div>
                        <span className="theme-text-secondary text-sm">또는</span>
                        <div className="theme-border flex-1 border-t"></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-3">
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

                    {/* Back to Login Link */}
                    <p className="theme-text-secondary mt-6 text-center text-sm w-full flex justify-center gap-2">
                        이미 계정이 있으신가요?{' '}
                        <Link to="/login" className="theme-text-primary font-medium hover:underline transition-colors">
                            로그인
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default JoinPage;
