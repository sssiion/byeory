import React, { useState } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, Camera } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import Navigation from '../../components/Header/Navigation';
import { useAuth } from '../../context/AuthContext';

const ProfileEditScreen: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [name, setName] = useState(user?.email?.split('@')[0] || "User");
    const [nickname, setNickname] = useState("");
    const [gender, setGender] = useState("unspecified");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState("");
    const [birthDate, setBirthDate] = useState("");
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
                // Simulate upload delay
                setTimeout(() => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setProfilePhoto(reader.result as string);
                        setIsUploading(false);
                    };
                    reader.readAsDataURL(file);
                }, 1000);
            }
        };
        input.click();
    };

    const handleSave = async () => {
        if (!name.trim()) {
            alert("이름을 입력해주세요");
            return;
        }
        if (!email.trim()) {
            alert("이메일을 입력해주세요");
            return;
        }

        try {
            // Since AuthContext doesn't have updateProfile, we'll just log it for now
            // or use a mock update. In a real app we'd call an API.
            console.log("Updating profile:", { name, nickname, gender, email, phone, birthDate, bio, profilePhoto });

            // Navigate back
            navigate('/profile');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert("프로필 업데이트에 실패했습니다.");
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-solid)', backgroundImage: 'var(--bg-gradient)' }}>
            <Navigation />

            <div className="pt-16 pb-24 md:pt-20 md:pb-20">
                <div className="max-w-2xl mx-auto px-4">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 theme-text-primary" />
                        </button>
                        <h1 className="text-xl font-bold theme-text-primary">프로필 수정</h1>
                    </div>

                    <div className="rounded-2xl p-6 shadow-sm border theme-bg-card theme-border space-y-6">
                        {/* Profile Photo */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex items-center justify-center theme-bg-card">
                                    {profilePhoto ? (
                                        <img
                                            src={profilePhoto}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '';
                                                setProfilePhoto('');
                                            }}
                                        />
                                    ) : (
                                        <User className="w-16 h-16 theme-icon" />
                                    )}
                                </div>
                                <button
                                    onClick={handlePhotoUpload}
                                    disabled={isUploading}
                                    className="absolute bottom-0 right-0 w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all theme-btn"
                                >
                                    {isUploading ? (
                                        <span className="animate-spin text-white">⏳</span>
                                    ) : (
                                        <Camera className="w-5 h-5 text-white" />
                                    )}
                                </button>
                            </div>
                            <p className="text-sm theme-text-secondary">프로필 사진을 변경하려면 카메라 버튼을 클릭하세요</p>
                        </div>

                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-medium theme-text-primary">
                                <User className="w-5 h-5 theme-icon" />
                                <span>이름</span>
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="이름을 입력하세요"
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all theme-bg-card theme-border theme-text-primary"
                                maxLength={20}
                            />
                            <p className="text-xs theme-text-secondary">{name.length}/20자</p>
                        </div>

                        {/* Nickname Input */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-medium theme-text-primary">
                                <span className="text-xl">😊</span>
                                <span>닉네임</span>
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="닉네임을 입력하세요"
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all theme-bg-card theme-border theme-text-primary"
                                maxLength={15}
                            />
                        </div>

                        {/* Gender Selection */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-medium theme-text-primary">
                                <User className="w-5 h-5 theme-icon" />
                                <span>성별</span>
                            </label>
                            <div className="flex gap-4">
                                {['male', 'female', 'unspecified'].map((g) => (
                                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={g}
                                            checked={gender === g}
                                            onChange={(e) => setGender(e.target.value)}
                                            className="accent-[var(--btn-bg)] w-5 h-5"
                                        />
                                        <span className="theme-text-primary">
                                            {g === 'male' ? '남성' : g === 'female' ? '여성' : '선택 안함'}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-medium theme-text-primary">
                                <Mail className="w-5 h-5 theme-icon" />
                                <span>이메일</span>
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all theme-bg-card theme-border theme-text-primary"
                            />
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-medium theme-text-primary">
                                <Phone className="w-5 h-5 theme-icon" />
                                <span>전화번호</span>
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="010-0000-0000"
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all theme-bg-card theme-border theme-text-primary"
                            />
                        </div>

                        {/* Birth Date Input */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-medium theme-text-primary">
                                <Calendar className="w-5 h-5 theme-icon" />
                                <span>생년월일</span>
                            </label>
                            <input
                                type="date"
                                value={birthDate}
                                onChange={(e) => setBirthDate(e.target.value)}
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all theme-bg-card theme-border theme-text-primary"
                            />
                        </div>

                        {/* Bio Input */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 font-medium theme-text-primary">
                                <span>소개</span>
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="자신을 소개해주세요..."
                                rows={4}
                                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none theme-bg-card theme-border theme-text-primary"
                                maxLength={200}
                            />
                            <p className="text-xs theme-text-secondary">{bio.length}/200자</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex-1 py-3 rounded-xl transition-colors font-medium theme-bg-card theme-text-primary border theme-border"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 rounded-xl shadow-lg transition-all font-medium text-white theme-btn"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileEditScreen;
