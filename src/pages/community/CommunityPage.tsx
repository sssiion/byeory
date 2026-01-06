import React, { useEffect, useState } from 'react';
import Navigation from '../../components/Header/Navigation';
import CommunityFeed from './components/CommunityFeed';
import { fetchMyProfile } from './api';

const Community: React.FC = () => {
    const [userId, setUserId] = useState<number | undefined>(undefined);

    useEffect(() => {
        const initUser = async () => {
            const profile = await fetchMyProfile();
            if (profile) {
                setUserId(profile.id);
            }
        };
        initUser();
    }, []);

    return (
        <div className="min-h-screen">
            <Navigation />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 pb-32">
                <div className="mb-8 text-center space-y-2">
                    <h1 className="text-4xl font-bold theme-text-primary tracking-tight">Community</h1>
                    <p className="theme-text-secondary text-lg">
                        새로운 소식과 이야기를 만나보세요
                    </p>
                </div>

                <div className="w-full">
                    <CommunityFeed currentUserId={userId} />
                </div>
            </main>
        </div>
    );
};

export default Community;
