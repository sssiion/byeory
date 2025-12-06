import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ThemeCheckbox } from "../common/ThemeCheckbox";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import type { DragSourceMonitor, DropTargetMonitor } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { Todo } from "../../types";
import { TodoItem } from "./TodoItem";
import { AddTodoModal } from "./AddTodoModal";
import { EditTodoModal } from "./EditTodoModal";

// --- [수정 1] 날짜 헬퍼 함수 추가 ---
// 문자열 날짜를 로컬 시간 기준으로 안전하게 변환하여 시차 문제를 방지합니다.
const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
interface WeeklyViewProps {
  todos: Todo[];
  onAddTodo: (todo: Omit<Todo, "id">) => void;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
  onDeleteTodo: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

interface DraggableTodoItemProps {
  todo: Todo;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onSelect: (todo: Todo) => void;
}

function DraggableTodoItem({
  todo,
  onToggleComplete,
  onEdit,
  onSelect,
}: DraggableTodoItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TODO",
    item: { todo },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [todo]);

  return (
    <div
      ref={drag as any}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="cursor-pointer hover:opacity-80 transition-opacity"
      onClick={() => onSelect(todo)}
    >
      <TodoItem
        todo={todo}
        onToggleComplete={onToggleComplete}
        onEdit={onEdit}
      />
    </div>
  );
}

interface DayColumnProps {
  date: string;
  dayName: string;
  todos: Todo[];
  isToday: boolean;
  onDrop: (todo: Todo, newDate: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onSelectDate: (date: string) => void;
  isSelected: boolean;
}

function DayColumn({
  date,
  dayName,
  todos,
  isToday,
  onDrop,
  onToggleComplete,
  onEdit,
  onSelectDate,
  isSelected,
}: DayColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "TODO",
    drop: (item: { todo: Todo }) => {
      onDrop(item.todo, date);
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [date, onDrop]);

  // 화면 표시용 날짜 파싱
  const dateObj = parseLocalDate(date);
  const day = dateObj.getDate();

  return (
    <div
      onClick={() => onSelectDate(date)}
      className={`flex-1 min-w-0 flex flex-col cursor-pointer ${isOver ? "bg-blue-50" : isSelected ? "bg-blue-50/50" : ""
        } transition-colors`}
    >
      {/* 날짜 헤더 */}
      <div className="flex flex-col items-center mb-1 md:mb-4">
        <div className="text-[10px] md:text-sm text-gray-600 mb-0.5 md:mb-2">{dayName}</div>
        <div
          className={`w-8 h-8 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xs md:text-base ${isToday
            ? "text-white"
            : "bg-gray-200 text-gray-700"
            }`}
          style={{ backgroundColor: isToday ? 'var(--accent-primary)' : undefined }}
        >
          {day}
        </div>
      </div>

      {/* 할일 목록 영역 */}
      <div
        ref={drop as any}
        className={`flex-1 px-0.5 md:px-1 space-y-1 md:space-y-2 h-[300px] md:h-[500px] max-h-[300px] md:max-h-[500px] overflow-y-auto scrollbar-hide ${isOver ? "bg-blue-100/30 rounded-lg" : ""
          }`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {todos.map((todo) => (
          <DraggableTodoItem
            key={todo.id}
            todo={todo}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onSelect={() => onSelectDate(date)}
          />
        ))}
        {todos.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400 text-[10px] md:text-sm text-center px-0.5">
            할일을<br className="md:hidden" />추가해주세요
          </div>
        )}
      </div>
    </div>
  );
}

function WeeklyViewContent({
  todos,
  onAddTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleComplete,
}: WeeklyViewProps) {
  // 초기값을 오늘 날짜로 안전하게 설정 (시간 정보 제거)
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [selectedDate, setSelectedDate] = useState(formatLocalDate(new Date()));
  const [showCompleted, setShowCompleted] = useState(true);
  const [showIncomplete, setShowIncomplete] = useState(true);

  const getWeekDates = (baseDate: Date) => {
    const current = new Date(baseDate);
    const day = current.getDay(); // 0(일) ~ 6(토)
    // 월요일을 시작으로 계산 (일요일(0)인 경우 -6을 해서 지난 월요일로)
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(current);
    monday.setDate(current.getDate() + diffToMonday);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const formatWeekRange = (dates: Date[]) => {
    const first = dates[0];
    const last = dates[6];
    return `${first.getFullYear()}년 ${first.getMonth() + 1}월 ${first.getDate()}일 - ${last.getMonth() + 1
      }월 ${last.getDate()}일`;
  };

  const isDateInRange = (dateStr: string, startStr: string, endStr: string) => {
    return dateStr >= startStr && dateStr <= endStr;
  };

  const weekDates = getWeekDates(currentDate);
  const dayNames = ["월", "화", "수", "목", "금", "토", "일"];

  // 오늘 날짜 계산 (로컬 시간 기준)
  const todayDate = new Date();
  const today = formatLocalDate(todayDate);

  // --- [수정 2] 드롭 핸들러 로직 개선 ---
  const handleDrop = (todo: Todo, targetDateStr: string) => {
    // 같은 날짜에 드롭했으면 무시 (날짜 변경이 없는 경우)
    if (todo.startDate === targetDateStr) {
      return;
    }

    // 기존 기간(Duration) 계산
    const originalStart = parseLocalDate(todo.startDate);
    const originalEnd = parseLocalDate(todo.endDate);

    // 밀리초 단위 차이 계산
    const diffTime = originalEnd.getTime() - originalStart.getTime();

    // 새로운 시작 날짜와 종료 날짜 계산
    const newStartDate = parseLocalDate(targetDateStr);
    const newEndDate = new Date(newStartDate.getTime() + diffTime);

    onUpdateTodo(todo.id, {
      startDate: targetDateStr,
      endDate: formatLocalDate(newEndDate),
    });
  };
  // -------------------------------------

  const filteredTodos = todos.filter((todo) => {
    if (!showCompleted && todo.completed) return false;
    if (!showIncomplete && !todo.completed) return false;
    return true;
  });

  return (
    <div>
      {/* Week Navigation */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-4 justify-center md:justify-start">
          <button
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg md:text-2xl min-w-[250px] md:min-w-[350px] text-center">
            {formatWeekRange(weekDates)}
          </h2>
          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 md:gap-4 justify-between md:justify-start">
          {/* Filter */}
          <div className="flex items-center gap-3 md:border-r md:pr-4">
            <ThemeCheckbox
              checked={showIncomplete}
              onChange={setShowIncomplete}
              label="미완료"
            />
            <ThemeCheckbox
              checked={showCompleted}
              onChange={setShowCompleted}
              label="완료"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">할일 추가</span>
            <span className="sm:hidden">추가</span>
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="flex gap-0.5 md:gap-4">
        {weekDates.map((date, index) => {
          const dateString = formatLocalDate(date);
          const dayTodos = filteredTodos.filter((todo) => {
            return isDateInRange(dateString, todo.startDate, todo.endDate);
          });

          return (
            <DayColumn
              key={dateString}
              date={dateString}
              dayName={dayNames[index]}
              todos={dayTodos}
              isToday={dateString === today}
              onDrop={handleDrop}
              onToggleComplete={onToggleComplete}
              onEdit={setEditingTodo}
              onSelectDate={setSelectedDate}
              isSelected={dateString === selectedDate}
            />
          );
        })}
      </div>

      {/* Selected Date Todos (Matching MonthlyView Style) */}
      <div className="bg-gray-50 rounded-lg p-4 md:p-6 mt-6">
        <h3 className="text-base md:text-lg mb-4">
          {new Date(selectedDate).getFullYear()}년 {new Date(selectedDate).getMonth() + 1}월{' '}
          {new Date(selectedDate).getDate()}일 할일
        </h3>

        <div className="space-y-2">
          {todos.filter(todo => {
            const start = new Date(todo.startDate);
            const end = new Date(todo.endDate);
            const selected = new Date(selectedDate);
            // 날짜 비교 (시간 제외)
            const selectedTime = selected.setHours(0, 0, 0, 0);
            const startTime = start.setHours(0, 0, 0, 0);
            const endTime = end.setHours(0, 0, 0, 0);
            return selectedTime >= startTime && selectedTime <= endTime;
          }).filter(todo => {
            if (!showCompleted && todo.completed) return false;
            if (!showIncomplete && !todo.completed) return false;
            return true;
          }).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              이 날짜에 등록된 할일이 없습니다
            </div>
          ) : (
            todos.filter(todo => {
              const start = new Date(todo.startDate);
              const end = new Date(todo.endDate);
              const selected = new Date(selectedDate);
              const selectedTime = selected.setHours(0, 0, 0, 0);
              const startTime = start.setHours(0, 0, 0, 0);
              const endTime = end.setHours(0, 0, 0, 0);
              return selectedTime >= startTime && selectedTime <= endTime;
            })
              .filter(todo => {
                if (!showCompleted && todo.completed) return false;
                if (!showIncomplete && !todo.completed) return false;
                return true;
              })
              .map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={onToggleComplete}
                  onEdit={setEditingTodo}
                />
              ))
          )}
        </div>
      </div>

      {/* 모달 컴포넌트들 */}
      {showAddModal && (
        <AddTodoModal
          onClose={() => setShowAddModal(false)}
          onAdd={(todo) => {
            onAddTodo(todo);
            setShowAddModal(false);
          }}
        />
      )}

      {editingTodo && (
        <EditTodoModal
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onUpdate={(updates) => {
            onUpdateTodo(editingTodo.id, updates);
            setEditingTodo(null);
          }}
          onDelete={() => {
            onDeleteTodo(editingTodo.id);
            setEditingTodo(null);
          }}
        />
      )}
    </div>
  );
}

export function WeeklyView(props: WeeklyViewProps) {
  // 주의: App.tsx 등 상위 컴포넌트에서 이미 <DndProvider>를 사용 중이라면 
  // 여기서는 제거하고 WeeklyViewContent만 렌더링해야 합니다.
  return (
    <DndProvider backend={HTML5Backend}>
      <WeeklyViewContent {...props} />
    </DndProvider>
  );
}