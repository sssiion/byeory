import { useState, useEffect } from 'react';
import Navigation from '../../components/Header/Navigation';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Lock, Download, LogOut, BarChart3, Calendar, Shield, Fingerprint, Key, Image as ImageIcon } from "lucide-react";

function ProfilePage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<{
        name?: string;
        nickname?: string;
        email?: string;
        profilePhoto?: string;
        birthDate?: string;
        phone?: string;
        gender?: string;
        bio?: string;
    } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            try {
                const response = await fetch('http://localhost:8080/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfile(data);
                } else if (response.status === 404) {
                    // Profile not found -> Redirect to setup
                    console.log("Profile not found, redirecting to setup...");
                    navigate('/setup-profile');
                } else if (response.status === 401 || response.status === 403) {
                    // Invalid token -> Logout
                    logout();
                    navigate('/login');
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, []);

    // Use user data from fetch
    const userName = profile?.nickname || profile?.name || '';
    const userEmail = profile?.email || '';

    // Stats (Initialize to 0 as there is no API for this yet)
    const stats = {
        totalEntries: 0,
        streakDays: 0,
        exchangeRooms: 0
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen pb-20 md:pb-0">
            {/* 내비게이션 설정 */}
            <Navigation />

            {/* 메인 화면 */}
            <main className="pt-16 md:pt-20 px-4 animate-fade-in">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header Profile Section */}
                    <div className="rounded-2xl p-6 shadow-lg text-[var(--btn-text)]" style={{ backgroundColor: 'var(--btn-bg)' }}>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                                {profile?.profilePhoto ? (
                                    <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-white" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold mb-1">{userName}님</h1>
                                <p className="opacity-90">{userEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-2xl p-4 shadow-sm border text-center theme-bg-card theme-border">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--bg-solid)' }}>
                                <Calendar className="w-5 h-5 theme-icon" />
                            </div>
                            <div className="text-2xl font-bold mb-1 theme-text-primary">{stats.totalEntries}</div>
                            <p className="text-xs theme-text-secondary">작성한 일기</p>
                        </div>
                        <div className="rounded-2xl p-4 shadow-sm border text-center theme-bg-card theme-border">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--bg-solid)' }}>
                                <BarChart3 className="w-5 h-5 theme-icon" />
                            </div>
                            <div className="text-2xl font-bold mb-1 theme-text-primary">{stats.streakDays}</div>
                            <p className="text-xs theme-text-secondary">연속 작성일</p>
                        </div>
                        <div className="rounded-2xl p-4 shadow-sm border text-center theme-bg-card theme-border">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--bg-solid)' }}>
                                <User className="w-5 h-5 theme-icon" />
                            </div>
                            <div className="text-2xl font-bold mb-1 theme-text-primary">{stats.exchangeRooms}</div>
                            <p className="text-xs theme-text-secondary">교환일기</p>
                        </div>
                    </div>

                    {/* My Diary Section */}
                    <div className="rounded-2xl shadow-sm border overflow-hidden theme-bg-card theme-border">
                        <h3 className="px-6 py-4 border-b font-medium theme-text-primary theme-border">내 일기</h3>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 theme-text-secondary" />
                                <div>
                                    <span className="block font-medium theme-text-primary">분석 & 인사이트</span>
                                    <span className="text-sm theme-text-secondary">감정 분포, 페르소나 카드, 성장 리포트</span>
                                </div>
                            </div>
                            <span className="theme-text-secondary">→</span>
                        </button>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80">
                            <div className="flex items-center gap-3">
                                <ImageIcon className="w-5 h-5 theme-text-secondary" />
                                <div>
                                    <span className="block font-medium theme-text-primary">사진 관리</span>
                                    <span className="text-sm theme-text-secondary">AI 자동 분류, 카테고리별 정리</span>
                                </div>
                            </div>
                            <span className="theme-text-secondary">→</span>
                        </button>
                    </div>

                    {/* Settings Sections */}
                    <div className="rounded-2xl shadow-sm border overflow-hidden theme-bg-card theme-border">
                        <h3 className="px-6 py-4 border-b font-medium theme-text-primary theme-border">계정</h3>
                        <button
                            onClick={() => navigate('/profile/edit')}
                            className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border"
                        >
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 theme-text-secondary" />
                                <span className="theme-text-primary">프로필 수정</span>
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/profile/password')}
                            className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80"
                        >
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 theme-text-secondary" />
                                <span className="theme-text-primary">비밀번호 변경</span>
                            </div>
                        </button>
                    </div>

                    {/* General Settings */}
                    <div className="rounded-2xl shadow-sm border overflow-hidden theme-bg-card theme-border">
                        <h3 className="px-6 py-4 border-b font-medium theme-text-primary theme-border">설정</h3>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 theme-text-secondary" />
                                <span className="theme-text-primary">알림 설정</span>
                            </div>
                        </button>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border">
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 theme-text-secondary" />
                                <span className="theme-text-primary">프라이버시 설정</span>
                            </div>
                        </button>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80">
                            <div className="flex items-center gap-3">
                                <Download className="w-5 h-5 theme-text-secondary" />
                                <span className="theme-text-primary">데이터 내보내기</span>
                            </div>
                        </button>
                    </div>

                    {/* Security Section */}
                    <div className="rounded-2xl shadow-sm border overflow-hidden theme-bg-card theme-border">
                        <h3 className="px-6 py-4 border-b font-medium flex items-center gap-2 theme-text-primary theme-border">
                            <Shield className="w-5 h-5 theme-icon" />
                            보안
                        </h3>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border">
                            <div className="flex items-center gap-3">
                                <Key className="w-5 h-5 theme-text-secondary" />
                                <div>
                                    <span className="block theme-text-primary">PIN 잠금</span>
                                    <span className="text-sm theme-text-secondary">앱 실행 시 PIN 입력</span>
                                </div>
                            </div>
                            <div className="w-12 h-6 rounded-full relative cursor-pointer" style={{ backgroundColor: 'var(--text-secondary)' }}>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all"></div>
                            </div>
                        </button>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border">
                            <div className="flex items-center gap-3">
                                <Fingerprint className="w-5 h-5 theme-text-secondary" />
                                <div>
                                    <span className="block theme-text-primary">생체 인증</span>
                                    <span className="text-sm theme-text-secondary">지문 또는 Face ID</span>
                                </div>
                            </div>
                            <div className="w-12 h-6 rounded-full relative cursor-pointer" style={{ backgroundColor: 'var(--btn-bg)' }}>
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all"></div>
                            </div>
                        </button>
                        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80">
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5 theme-text-secondary" />
                                <div>
                                    <span className="block theme-text-primary">비공개 태그 설정</span>
                                    <span className="text-sm theme-text-secondary">AI 분석에서 제외할 태그</span>
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full py-4 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium theme-bg-card theme-border theme-text-primary border"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>로그아웃</span>
                    </button>

                    {/* Footer */}
                    <div className="text-center py-4 text-sm theme-text-secondary">
                        <p>© 2025 벼리. All rights reserved.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProfilePage;
