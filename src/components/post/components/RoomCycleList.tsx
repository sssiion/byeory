import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRoomCyclesApi, type RoomCycle } from "../api/roomCycle";
import { ScrollText, BookOpen, Clock, CheckCircle2, Lock } from "lucide-react";

interface Props {
  roomId: string | number;
  refreshTrigger?: number; // Prop to trigger reload
}

const RoomCycleList: React.FC<Props> = ({ roomId, refreshTrigger }) => {
  const navigate = useNavigate();
  const [cycles, setCycles] = useState<RoomCycle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCycles();
  }, [roomId, refreshTrigger]);

  const loadCycles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRoomCyclesApi(roomId);
      setCycles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && cycles.length === 0)
    return (
      <div className="py-4 text-center text-xs text-gray-400">
        활동 불러오는 중...
      </div>
    );
  if (cycles.length === 0) return null; // Hide if no activity

  const ongoing = cycles.filter((c) => c.status !== "COMPLETED");
  const completed = cycles.filter((c) => c.status === "COMPLETED");

  const renderCycleCard = (cycle: RoomCycle) => (
    <div
      key={cycle.id}
      onClick={() => navigate(`/cycles/${cycle.id}`)}
      className="bg-white p-5 rounded-xl border border-[var(--border-color)] shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
    >
      <div
        className={`p-3 rounded-xl ${
          cycle.type === "ROLLING_PAPER"
            ? "bg-orange-50 text-orange-500"
            : "bg-blue-50 text-blue-500"
        }`}
      >
        {cycle.type === "ROLLING_PAPER" ? (
          <ScrollText size={24} />
        ) : (
          <BookOpen size={24} />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-[var(--text-tertiary)] bg-[var(--bg-main)] px-1.5 py-0.5 rounded">
            {cycle.type === "ROLLING_PAPER" ? "롤링페이퍼" : "교환일기"}
          </span>
          {cycle.status === "COMPLETED" ? (
            <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
              <CheckCircle2 size={12} /> 완료됨
            </div>
          ) : (
            <div
              className={`flex items-center gap-1 text-xs font-bold ${
                cycle.isMyTurn
                  ? "text-indigo-500"
                  : "text-[var(--text-tertiary)]"
              }`}
            >
              {cycle.isMyTurn ? <Clock size={12} /> : <Lock size={12} />}
              {cycle.isMyTurn ? "내 차례" : "대기 중"}
            </div>
          )}
        </div>

        <h4
          className={`font-bold truncate mb-1 transition-colors ${
            cycle.isMyTurn
              ? "text-[var(--text-primary)] group-hover:text-indigo-600"
              : "text-[var(--text-secondary)]"
          }`}
        >
          {cycle.title}
        </h4>

        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
          <span>멤버 {cycle.totalMembers ?? "-"}명</span>
          {cycle.status === "IN_PROGRESS" && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span
                className={cycle.isMyTurn ? "text-indigo-600 font-bold" : ""}
              >
                {(() => {
                  if (cycle.isMyTurn) return "작성해주세요!";
                  const currentMember = cycle.members?.find(
                    (m) => (m.order ?? m.turnOrder) === cycle.currentTurnOrder
                  );
                  return currentMember
                    ? `${currentMember.nickname}님 작성 중`
                    : "작성 대기 중";
                })()}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mb-8 space-y-8">
      {/* Ongoing Section */}
      <div>
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <span className="text-indigo-500">✨</span> 진행 중인 활동
        </h3>
        {ongoing.length === 0 ? (
          <div className="text-sm text-[var(--text-secondary)] py-4">
            진행 중인 활동이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ongoing.map(renderCycleCard)}
          </div>
        )}
      </div>

      {/* Completed Section */}
      {completed.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <span className="text-green-500">📚</span> 완료된 활동
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.map(renderCycleCard)}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomCycleList;
