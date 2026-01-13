import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, ImageIcon, User, Lock } from "lucide-react";

import FloatingPanelSettings from "./security/FloatingPanelSettings"; // ✨
import SessionSettings from "./security/SessionSettings"; // ✨
import CreditSettings from "./security/CreditSettings"; // ✨
import WidgetZoomSettings from "./security/WidgetZoomSettings"; // ✨

interface ProfileMenuProps {
  provider: string;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ provider }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* My Diary Section */}
      <div className="rounded-2xl shadow-sm border overflow-hidden theme-bg-card theme-border">
        <h3 className="px-6 py-4 border-b font-medium theme-text-primary theme-border">
          내 일기
        </h3>
        <button
          onClick={() => navigate("/profile/analysis")}
          className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 theme-text-secondary" />
            <div>
              <span className="block font-medium theme-text-primary">
                분석 & 인사이트
              </span>
              <span className="text-sm theme-text-secondary">
                감정 분포, 페르소나 카드, 성장 리포트
              </span>
            </div>
          </div>
          <span className="theme-text-secondary">→</span>
        </button>
        <button className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between hover:opacity-80">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 theme-text-secondary" />
            <div>
              <span className="block font-medium theme-text-primary">
                사진 관리
              </span>
              <span className="text-sm theme-text-secondary">
                AI 자동 분류, 카테고리별 정리
              </span>
            </div>
          </div>
          <span className="theme-text-secondary">→</span>
        </button>
      </div>

      {/* Account Settings Section */}
      <div className="rounded-2xl shadow-sm border overflow-hidden theme-bg-card theme-border">
        <h3 className="px-6 py-4 border-b font-medium theme-text-primary theme-border">
          계정
        </h3>
        <button
          onClick={() => navigate("/profile/edit")}
          className={`w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border`}
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 theme-text-secondary" />
            <span className="theme-text-primary">프로필 수정</span>
          </div>
        </button>

        {/* ✨ Floating Panel Settings Toggle */}
        <FloatingPanelSettings />

        {/* ✨ UI Settings (Moved from Security) */}
        <SessionSettings />
        <CreditSettings />
        <WidgetZoomSettings />

        {!["GOOGLE", "NAVER"].includes(provider) && (
          <button
            onClick={() => navigate("/profile/password")}
            className="w-full px-6 py-4 text-left transition-colors flex items-center justify-between border-b hover:opacity-80 theme-border"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 theme-text-secondary" />
              <span className="theme-text-primary">비밀번호 변경</span>
            </div>
          </button>
        )}
      </div>
    </>
  );
};

export default ProfileMenu;
