import React, { useState, useRef, useEffect } from 'react';
import SettingsModal from '../settings/Settings';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Settings, Coins } from 'lucide-react';
import { useCredits } from '../../context/CreditContext';
import { useMenu } from '../settings/menu/MenuSettings';
import { useAuth } from '../../context/AuthContext';
import { usePlayTime } from '../../hooks';
import DailyQuestModal from '../Credit/DailyQuestModal'; // Import Modal
import { useDrag, useDrop } from 'react-dnd';

interface DraggableMenuItemProps {
    id: string;
    index: number;
    moveMenuItem: (dragIndex: number, hoverIndex: number) => void;
    children: React.ReactNode;
    isEditMode: boolean;
    label: string; // ✨ Added label prop
}

const DraggableMenuItem: React.FC<DraggableMenuItemProps> = ({ id, index, moveMenuItem, children, isEditMode, label }) => {
    const ref = useRef<HTMLDivElement>(null);

    interface DragItem {
        index: number;
        id: string;
        type: string;
        label?: string;
        initialWidth?: number;
        initialHeight?: number;
    }

    const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: any }>({
        accept: 'MENU_ITEM', // String literal matches useDrag type
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover(item: DragItem, monitor) {
            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current?.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleX =
                (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the left
            const hoverClientX = (clientOffset as any).x - hoverBoundingRect.left;

            // Only perform the move when the mouse has crossed half of the items width
            if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
                return;
            }

            if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
                return;
            }

            // Time to actually perform the action
            moveMenuItem(dragIndex, hoverIndex);

            // Note: we're mutating the monitor item here!
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'MENU_ITEM',
        item: () => {
            // ✨ Capture dimensions
            const { offsetWidth, offsetHeight } = ref.current || { offsetWidth: 0, offsetHeight: 0 };
            return {
                id,
                index,
                label, // ✨ Pass label
                initialWidth: offsetWidth, // ✨ Pass dimensions
                initialHeight: offsetHeight
            };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: isEditMode,
    });

    // Provide a proper handle or just drag the whole item.
    // For mobile touch, we usually want to drag the whole item.
    drag(drop(ref));

    const opacity = isDragging ? 0.3 : 1;

    return (
        <div
            ref={ref}
            style={{ opacity }}
            data-handler-id={handlerId}
            className={`relative rounded-lg transition-all duration-200 md:w-32 md:flex-none flex-1 flex justify-center items-center py-0 md:py-2 mx-1 ${isEditMode
                ? 'border-2 border-dashed border-primary/50 cursor-grab active:cursor-grabbing hover:bg-primary/5'
                : ''
                }`}
        >
            {children}
        </div>
    );
};

const Navigation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isQuestModalOpen, setIsQuestModalOpen] = useState(false); // Modal State
    const { isLoggedIn } = useAuth();
    const { credits } = useCredits();

    // Menu Context
    const { menuItems, isEditMode, setIsEditMode, moveMenuItem } = useMenu();

    const [settingsInitialView, setSettingsInitialView] = useState<'main' | 'theme' | 'custom' | 'defaultPage' | 'widget'>('main');

    // Listen for custom event to open settings
    React.useEffect(() => {
        const handleOpenSettings = (e: CustomEvent) => {
            const view = e.detail?.view || 'main';
            setSettingsInitialView(view);
            setIsSettingsOpen(true);
        };

        window.addEventListener('open-settings-modal', handleOpenSettings as EventListener);
        return () => window.removeEventListener('open-settings-modal', handleOpenSettings as EventListener);
    }, []);

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    // Playtime Timer Logic
    const playTime = usePlayTime();
    const [formattedPlayTime, setFormattedPlayTime] = useState<string>('');
    const [showTimer, setShowTimer] = useState(false);

    useEffect(() => {
        const checkTimerSetting = () => {
            const saved = localStorage.getItem('showSessionTimer') === 'true';
            setShowTimer(saved);
        };

        checkTimerSetting();

        const handleTimerChange = (e: CustomEvent) => {
            setShowTimer(e.detail.show);
        };

        window.addEventListener('session-timer-change', handleTimerChange as EventListener);
        return () => window.removeEventListener('session-timer-change', handleTimerChange as EventListener);
    }, []);

    useEffect(() => {
        if (!showTimer) {
            setFormattedPlayTime('');
            return;
        }

        const hours = Math.floor(playTime / 3600);
        const minutes = Math.floor((playTime % 3600) / 60);
        const seconds = playTime % 60;

        setFormattedPlayTime(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
    }, [showTimer, playTime]);

    return (
        <>
            {/* Top Header */}
            <header className={`sticky top-0 z-50 flex h-16 md:h-20 md:grid md:grid-cols-3 justify-between items-center px-4 md:px-6 py-0 theme-bg-header shadow-sm border-b theme-border transition-colors duration-300`}>
                {/* Logo */}
                <div
                    className={`flex items-center justify-self-start ${isEditMode ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
                    onClick={() => !isEditMode && navigate('/')}
                >
                    <img src="/logo.png" alt="Logo" className="w-18 md:w-20" />
                </div>

                {/* Desktop Center Navigation */}
                <nav className="hidden md:flex items-center justify-center justify-self-center">
                    {menuItems.map((item, index) => {
                        return (
                            <DraggableMenuItem
                                key={`nav-item-${item.id || 'none'}-${index}`}
                                index={index}
                                id={item.id}
                                moveMenuItem={moveMenuItem}
                                isEditMode={isEditMode}
                                label={item.name} // ✨ Pass label
                            >
                                <Link
                                    to={item.path}
                                    onClick={(e) => {
                                        if (isEditMode) {
                                            e.preventDefault();
                                            return;
                                        }
                                        // ✨ Custom logic for Post tab: Dispatch event if already on /post
                                        if (item.path === '/post' && isActive('/post')) {
                                            e.preventDefault();
                                            window.dispatchEvent(new CustomEvent('post-tab-click'));
                                        }
                                    }}
                                    className={`text-lg font-medium transition-colors duration-200 block ${isActive(item.path)
                                        ? 'theme-text-primary font-bold'
                                        : 'theme-text-secondary hover:theme-text-primary'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            </DraggableMenuItem>
                        )
                    })}
                </nav>

                {/* Right Icons */}
                <div className="flex items-center space-x-2 md:space-x-4 theme-text-secondary justify-self-end">
                    {showTimer && formattedPlayTime && (
                        <div className={`font-mono text-xs md:text-sm font-medium mr-2 theme-text-primary bg-[var(--bg-secondary)] px-2 md:px-3 py-1 md:py-1.5 rounded-full border theme-border whitespace-nowrap ${isEditMode ? 'opacity-50 cursor-not-allowed select-none' : ''}`}>
                            {formattedPlayTime}
                        </div>
                    )}

                    <div
                        className={`flex items-center space-x-1 font-mono text-xs md:text-sm font-medium mr-2 theme-text-primary bg-[var(--bg-secondary)] px-2 md:px-3 py-1 md:py-1.5 rounded-full border theme-border whitespace-nowrap transition-transform ${isEditMode
                            ? 'opacity-50 cursor-not-allowed select-none'
                            : 'cursor-pointer hover:scale-105 active:scale-95'
                            }`}
                        title="Daily Quests & Rewards"
                        onClick={() => !isEditMode && setIsQuestModalOpen(true)}
                    >
                        <Coins className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-yellow-500/20" />
                        <span>{credits.toLocaleString()}</span>
                    </div>

                    <button
                        className={`p-2 hover:bg-black/5 rounded-full transition-colors ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                            if (isEditMode) return;
                            isLoggedIn ? navigate('/profile') : navigate('/login');
                        }}
                        disabled={isEditMode}
                        title={isLoggedIn ? "프로필" : "로그인"}
                    >
                        {isLoggedIn ? <User className="w-5 h-5 md:w-6 md:h-6" /> : <User className="w-5 h-5 md:w-6 md:h-6" />}
                    </button>
                    <button
                        className={`p-2 hover:bg-black/5 rounded-full transition-colors ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => {
                            if (isEditMode) return;
                            setSettingsInitialView('main');
                            setIsSettingsOpen(true);
                        }}
                        disabled={isEditMode}
                    >
                        <Settings className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 theme-bg-header border-t theme-border z-50 pb-safe transition-colors duration-300">
                <div className="flex justify-around items-center h-16 w-full">
                    {menuItems.map((item, index) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;
                        return (
                            <DraggableMenuItem
                                key={`nav-mobile-${item.id || 'none'}-${index}`}
                                index={index}
                                id={item.id}
                                moveMenuItem={moveMenuItem}
                                isEditMode={isEditMode}
                                label={item.name} // ✨ Pass label
                            >
                                <div className={`flex flex-col items-center justify-center w-full h-full space-y-1 p-2 ${active ? 'theme-text-primary' : 'theme-text-secondary'}`}>
                                    <Link
                                        to={item.path}
                                        onClick={(e) => {
                                            if (isEditMode) {
                                                e.preventDefault();
                                                return;
                                            }
                                            if (item.path === '/post' && isActive('/post')) {
                                                e.preventDefault();
                                                window.dispatchEvent(new CustomEvent('post-tab-click'));
                                            }
                                        }}
                                        className="flex flex-col items-center"
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span className="text-[10px] font-medium">{item.name}</span>
                                    </Link>
                                </div>
                            </DraggableMenuItem>
                        );
                    })}
                </div>
            </nav>
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                initialView={settingsInitialView}
                onMenuEditMode={() => {
                    setIsEditMode(true);
                    navigate('/home');
                }}
            />
            {/* Daily Quest Modal */}
            <DailyQuestModal
                isOpen={isQuestModalOpen}
                onClose={() => setIsQuestModalOpen(false)}
            />
        </>
    );
};

export default Navigation;
