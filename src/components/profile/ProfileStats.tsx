import React from 'react';
import { BarChart3, Calendar, Heart } from 'lucide-react';

interface ProfileStatsProps {
    profile: {
        totalEntries?: number;
        streakDays?: number;
        receivedLikes?: number;
    } | null;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ profile }) => {
    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl p-4 shadow-sm border text-center theme-bg-card theme-border">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--bg-solid)' }}>
                    <Calendar className="w-5 h-5 theme-icon" />
                </div>
                <div className="text-2xl font-bold mb-1 theme-text-primary">{profile?.totalEntries || 0}</div>
                <p className="text-xs theme-text-secondary">작성한 일기</p>
            </div>
            <div className="rounded-2xl p-4 shadow-sm border text-center theme-bg-card theme-border">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--bg-solid)' }}>
                    <BarChart3 className="w-5 h-5 theme-icon" />
                </div>
                <div className="text-2xl font-bold mb-1 theme-text-primary">{profile?.streakDays || 0}</div>
                <p className="text-xs theme-text-secondary">연속 작성일</p>
            </div>
            <div className="rounded-2xl p-4 shadow-sm border text-center theme-bg-card theme-border">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: 'var(--bg-solid)' }}>
                    <Heart className="w-5 h-5 theme-icon text-red-500 fill-red-500" />
                </div>
                <div className="text-2xl font-bold mb-1 theme-text-primary">{profile?.receivedLikes || 0}</div>
                <p className="text-xs theme-text-secondary">받은 좋아요</p>
            </div>
        </div>
    );
};

export default ProfileStats;
