import Navigation from '../../components/Navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
    const { userEmail, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="theme-bg-gradient min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* 내비게이션 설정 */}
            <Navigation />

            {/* 메인 화면 */}
            <main className="px-8 pt-16 pb-20 md:px-25 md:pt-20 md:pb-0">
                <div className="mx-auto max-w-2xl py-8">
                    <h1 className="mb-8 text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        프로필
                    </h1>

                    <div className="rounded-2xl border p-8 shadow-lg" style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border)'
                    }}>
                        <div className="mb-8 flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white" style={{ backgroundColor: 'var(--accent-primary)' }}>
                                {userEmail ? userEmail[0].toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                                    {userEmail ? userEmail.split('@')[0] : '사용자'} 님
                                </h2>
                                <p style={{ color: 'var(--text-secondary)' }}>
                                    {userEmail || '로그인이 필요합니다'}
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-8" style={{ borderColor: 'var(--border)' }}>
                            <button
                                onClick={handleLogout}
                                className="w-full rounded-lg py-3 font-semibold text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: 'var(--accent-primary)' }}
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ProfilePage;
