import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, User, Calendar, Smile, ArrowRight, Phone, FileText } from 'lucide-react';
// import { useAuth } from '../../context/AuthContext'; // Not used locally

const InitialProfileSetup: React.FC = () => {
    const navigate = useNavigate();
    // const { user } = useAuth();

    const [name, setName] = useState("");
    const [nickname, setNickname] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [gender, setGender] = useState("unspecified");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const handlePhotoUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                setIsUploading(true);
                setTimeout(() => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setProfilePhoto(reader.result as string);
                        setIsUploading(false);
                    };
                    reader.readAsDataURL(file);
                }, 800);
            }
        };
        input.click();
    };

    const handleComplete = () => {
        if (!name.trim()) {
            alert("이름을 입력해주세요!");
            return;
        }
        if (!nickname.trim()) {
            alert("닉네임을 입력해주세요!");
            return;
        }

        console.log("Saving profile:", { name, nickname, birthDate, gender, phone, bio, profilePhoto });

        // Save to LocalStorage mock for now (or call API)
        // In a real app, you would PATCH /user/profile here

        localStorage.setItem('isProfileSetupCompleted', 'true');
        navigate('/home', { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-500 overflow-y-auto">
            <div className="max-w-xl w-full theme-bg-card rounded-3xl shadow-2xl p-8 border theme-border relative overflow-hidden my-8">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold theme-text-primary mb-2">프로필 설정</h1>
                    <p className="theme-text-secondary text-sm">
                        다른 사용자들에게 보여질 멋진 프로필을 완성해보세요.<br />
                        <span className="text-xs opacity-70">(이메일과 비밀번호는 회원가입 시 이미 입력되었습니다)</span>
                    </p>
                </div>

                <div className="space-y-5">
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={handlePhotoUpload}>
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-700 shadow-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-transform group-hover:scale-105">
                                {profilePhoto ? (
                                    <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 text-slate-300" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md">
                                {isUploading ? <span className="text-[10px]">...</span> : <Camera size={14} />}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">이름 <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-slate-400 w-5 h-5 scale-90" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="실명 입력"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 theme-text-primary"
                                />
                            </div>
                        </div>

                        {/* Nickname */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">닉네임 <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Smile className="absolute left-3 top-3 text-slate-400 w-5 h-5 scale-90" />
                                <input
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="별명 입력"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 theme-text-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Birth Date */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">생년월일</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 text-slate-400 w-5 h-5 scale-90" />
                                <input
                                    type="date"
                                    value={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 theme-text-primary"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">전화번호</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-slate-400 w-5 h-5 scale-90" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="010-0000-0000"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 theme-text-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Gender */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">성별</label>
                        <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                            {['male', 'female', 'unspecified'].map((g) => (
                                <button
                                    key={g}
                                    onClick={() => setGender(g)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${gender === g
                                        ? 'bg-white dark:bg-slate-600 shadow-sm theme-text-primary scale-[1.02] border dark:border-slate-500'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {g === 'male' ? '남성' : g === 'female' ? '여성' : '비공개'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold theme-text-secondary uppercase tracking-wider ml-1">자기소개</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-slate-400 w-5 h-5 scale-90" />
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="자신을 자유롭게 소개해주세요..."
                                rows={3}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 theme-text-primary resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                    <button
                        onClick={handleComplete}
                        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group"
                    >
                        완료 및 시작하기
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InitialProfileSetup;
