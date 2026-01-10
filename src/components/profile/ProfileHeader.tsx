import React from 'react';
import { User } from 'lucide-react';

interface ProfileHeaderProps {
    profile: {
        name?: string;
        nickname?: string;
        email?: string;
        profilePhoto?: string;
    } | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
    const userName = profile?.nickname || profile?.name || '';
    const userEmail = profile?.email || '';

    return (
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
    );
};

export default ProfileHeader;
