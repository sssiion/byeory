import { useState, useEffect } from 'react';
import Navigation from '../../components/Header/Navigation';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Lock, Download, LogOut, BarChart3, Calendar, Shield, Image as ImageIcon, Clock, ChevronDown, RefreshCw } from "lucide-react";
import PinInputModal from '../../components/Security/PinInputModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';

function ProfilePage() {
    const { logout, checkPinStatus, unlockRequest, unlockVerify } = useAuth();
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

    const [provider, setProvider] = useState<string>('LOCAL');
    const [showSessionTimer, setShowSessionTimer] = useState(false);
    const [isPinExpanded, setIsPinExpanded] = useState(false);
    const [usePin, setUsePin] = useState(false);

    // PIN Modal State
    const [showPinInputModal, setShowPinInputModal] = useState(false);
    const [pinModalConfig, setPinModalConfig] = useState<{
        title: string;
        subtitle: string;
        mode: 'REGISTER' | 'VERIFY_OLD' | 'SET_NEW' | 'CONFIRM_NEW' | 'DISABLE' | 'LOCKED_EMAIL_VERIFY';
    }>({
        title: 'PIN 설정',
        subtitle: '6자리 숫자를 입력하세요',
        mode: 'REGISTER'
    });

    // Temporary storage for PIN Change flow
    const [tempNewPin, setTempNewPin] = useState<string>('');

    useEffect(() => {
        const initPinStatus = async () => {
            const status = await checkPinStatus();
            setUsePin(status);
        };
        initPinStatus();
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('showSessionTimer');
        if (saved === 'true') setShowSessionTimer(true);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            // Decode token to check provider
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.provider) {
                    setProvider(payload.provider);
                }
            } catch (e) {
                console.error("Token decode error", e);
            }

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

    // PIN Logic
    const openPinModal = (mode: 'REGISTER' | 'VERIFY_OLD' | 'SET_NEW' | 'CONFIRM_NEW' | 'DISABLE' | 'LOCKED_EMAIL_VERIFY') => {
        let title = 'PIN 설정';
        let subtitle = '6자리 숫자를 입력하세요';

        switch (mode) {
            case 'REGISTER':
                title = 'PIN 설정';
                subtitle = '잠금 해제에 사용할 6자리 숫자를 입력하세요';
                break;
            case 'VERIFY_OLD':
                title = '기존 PIN 입력';
                subtitle = '현재 설정된 6자리 PIN을 입력하세요';
                break;
            case 'SET_NEW':
                title = '새 PIN 입력';
                subtitle = '변경할 6자리 숫자를 입력하세요';
                break;
            case 'CONFIRM_NEW':
                title = 'PIN 확인';
                subtitle = '한 번 더 입력해 주세요';
                break;
            case 'DISABLE':
                title = 'PIN 해제';
                subtitle = '현재 설정된 6자리 PIN을 입력하세요';
                break;
            case 'LOCKED_EMAIL_VERIFY':
                title = '인증코드 입력';
                subtitle = '가입하신 메일을 통해 받은 인증코드를 입력해주세요';
                break;
        }

        setPinModalConfig({ title, subtitle, mode });
        setShowPinInputModal(true);
    };

    const handlePinSubmit = async (pin: string): Promise<string | null> => {
        const token = localStorage.getItem('accessToken');

        try {
            if (pinModalConfig.mode === 'REGISTER') {
                // Register logic
                const response = await fetch('http://localhost:8080/api/pin/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ pin })
                });

                if (response.ok) {
                    setUsePin(true);
                    setShowPinInputModal(false);
                    return null;
                } else {
                    return 'PIN 등록에 실패했습니다.';
                }

            } else if (pinModalConfig.mode === 'VERIFY_OLD') {
                // Verify old PIN
                const response = await fetch('http://localhost:8080/api/pin/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ pin })
                });

                const isCorrect = await response.json();
                if (isCorrect === true) {
                    // Success -> Move to Set New Step
                    openPinModal('SET_NEW');
                    return null;
                } else {
                    // Fetch status for count
                    const statusRes = await fetch('http://localhost:8080/api/pin/status', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (statusRes.ok) {
                        const status = await statusRes.json();
                        if (status.locked) {
                            openPinModal('LOCKED_EMAIL_VERIFY');
                            return '계정이 잠겼습니다. 이메일 인증을 진행해주세요.';
                        }
                        return `PIN이 일치하지 않습니다. (${status.failureCount}/5)`;
                    }
                    return 'PIN이 일치하지 않습니다.';
                }

            } else if (pinModalConfig.mode === 'SET_NEW') {
                // Store first entry and move to Confirm
                setTempNewPin(pin);
                openPinModal('CONFIRM_NEW');
                return null;

            } else if (pinModalConfig.mode === 'CONFIRM_NEW') {
                // Compare with temp
                if (pin === tempNewPin) {
                    // Match -> Register (overwrite)
                    const response = await fetch('http://localhost:8080/api/pin/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ pin })
                    });

                    if (response.ok) {
                        setShowPinInputModal(false);
                        setTempNewPin(''); // Clear temp
                        return null;
                    } else {
                        return 'PIN 변경 실패. 다시 시도해주세요.';
                    }
                } else {
                    return 'PIN 번호가 일치하지 않습니다.';
                }
            } else if (pinModalConfig.mode === 'DISABLE') {
                // 1. Verify first
                const verifyResponse = await fetch('http://localhost:8080/api/pin/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ pin })
                });

                const isCorrect = await verifyResponse.json();
                if (isCorrect === true) {
                    // 2. Delete if correct
                    const deleteResponse = await fetch('http://localhost:8080/api/pin', {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (deleteResponse.ok) {
                        setUsePin(false); // Turn off toggle
                        setShowPinInputModal(false);
                        return null;
                    } else {
                        return 'PIN 해제에 실패했습니다.';
                    }
                } else {
                    // Fetch status for count
                    const statusRes = await fetch('http://localhost:8080/api/pin/status', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (statusRes.ok) {
                        const status = await statusRes.json();
                        if (status.locked) {
                            openPinModal('LOCKED_EMAIL_VERIFY');
                            return '계정이 잠겼습니다. 이메일 인증을 진행해주세요.';
                        }
                        return `PIN이 일치하지 않습니다. (${status.failureCount}/5)`;
                    }
                    return 'PIN이 일치하지 않습니다.';
                }
            } else if (pinModalConfig.mode === 'LOCKED_EMAIL_VERIFY') {
                const error = await unlockVerify(pin);
                if (!error) {
                    setShowPinInputModal(false);
                    setUsePin(false); // PIN is now deleted
                    setConfirmModal({
                        isOpen: true,
                        title: "PIN 해제",
                        message: "PIN 잠금이 해제되었으며, PIN 기능이 비활성화되었습니다.",
                        type: 'success',
                        singleButton: true,
                        onConfirm: closeConfirmModal
                    });
                    return null;
                }
                return error;
            }
        } catch (error) {
            console.error("PIN processing error", error);
            return "오류가 발생했습니다.";
        }
        return "알 수 없는 오류";
    };


    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type?: 'info' | 'danger' | 'success';
        singleButton?: boolean;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

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
                        <button
                            onClick={() => navigate('/profile/analysis')} // 경로 이동 추가
                            className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border">
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
                            className={`w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border`}
                        >
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 theme-text-secondary" />
                                <span className="theme-text-primary">프로필 수정</span>
                            </div>
                        </button>
                        {!['GOOGLE', 'NAVER'].includes(provider) && (
                            <button
                                onClick={() => navigate('/profile/password')}
                                className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border"
                            >
                                <div className="flex items-center gap-3">
                                    <Lock className="w-5 h-5 theme-text-secondary" />
                                    <span className="theme-text-primary">비밀번호 변경</span>
                                </div>
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/profile/delete')}
                            className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80 rounded-b-2xl"
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-5 h-5 flex items-center justify-center">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 theme-text-secondary">
                                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                                    </svg>
                                </span>
                                <span className="theme-text-primary">회원탈퇴</span>
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
                        <button
                            onClick={() => {
                                const newValue = !showSessionTimer;
                                setShowSessionTimer(newValue);
                                localStorage.setItem('showSessionTimer', newValue.toString());
                                window.dispatchEvent(new CustomEvent('session-timer-change', { detail: { show: newValue } }));
                            }}
                            className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border"
                        >
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 theme-text-secondary" />
                                <div>
                                    <span className="block theme-text-primary">접속 시간 표시</span>
                                    <span className="text-sm theme-text-secondary">상단바에 현재 접속 시간 표시</span>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${showSessionTimer ? 'bg-[var(--btn-bg)]' : 'bg-gray-300'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showSessionTimer ? 'right-1' : 'left-1'}`}></div>
                            </div>
                        </button>

                        {/* PIN 기능 Accordion */}
                        <div className="border-b theme-border">
                            <button
                                onClick={() => setIsPinExpanded(!isPinExpanded)}
                                className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80"
                            >
                                <div className="flex items-center gap-3">
                                    <Lock className="w-5 h-5 theme-text-secondary" />
                                    <div>
                                        <span className="block theme-text-primary">PIN 기능</span>
                                        <span className="text-sm theme-text-secondary">앱 잠금 및 보안 설정</span>
                                    </div>
                                </div>
                                <ChevronDown className={`w-5 h-5 theme-text-secondary transition-transform duration-200 ${isPinExpanded ? 'transform rotate-180' : ''}`} />
                            </button>

                            <div className={`overflow-hidden transition-all duration-300 ${isPinExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-t theme-border hover:opacity-80 pl-10">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 theme-text-secondary" />
                                        <div>
                                            <span className="block theme-text-primary">PIN 사용</span>
                                            <span className="text-sm theme-text-secondary">앱 실행 시 PIN으로 잠금 해제</span>
                                        </div>
                                    </div>
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!usePin) {
                                                openPinModal('REGISTER');
                                            } else {
                                                // Disable PIN flow
                                                openPinModal('DISABLE');
                                            }
                                        }}
                                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${usePin ? 'bg-[var(--btn-bg)]' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${usePin ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </button>

                                {/* PIN Change Button (Visible only when PIN is enabled) */}
                                {usePin && (
                                    <button
                                        onClick={() => openPinModal('VERIFY_OLD')}
                                        className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-t theme-border hover:opacity-80 pl-10"
                                    >
                                        <div className="flex items-center gap-3">
                                            <RefreshCw className="w-5 h-5 theme-text-secondary" />
                                            <div>
                                                <span className="block theme-text-primary">PIN 번호 변경</span>
                                                <span className="text-sm theme-text-secondary">기존 PIN 입력 후 재설정</span>
                                            </div>
                                        </div>
                                        <span className="theme-text-secondary">→</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {showPinInputModal && (
                            <PinInputModal
                                title={pinModalConfig.title}
                                subtitle={pinModalConfig.subtitle}
                                isLocked={pinModalConfig.mode === 'LOCKED_EMAIL_VERIFY'}
                                onClose={() => setShowPinInputModal(false)}
                                onSubmit={handlePinSubmit}
                                onUnlockRequest={unlockRequest}
                            />
                        )}
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

                <ConfirmationModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    type={confirmModal.type}
                    singleButton={confirmModal.singleButton}
                    onConfirm={() => {
                        confirmModal.onConfirm();
                        if (confirmModal.singleButton) closeConfirmModal();
                    }}
                    onCancel={closeConfirmModal}
                />
            </main>
        </div>
    );
}

export default ProfilePage;
