import React, { useState, useRef } from 'react';
import SettingsModal from '../settings/Settings';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Settings } from 'lucide-react';
import { useMenu } from '../settings/menu/MenuSettings';
import { useAuth } from '../../context/AuthContext';
import { useDrag, useDrop } from 'react-dnd';

interface DraggableMenuItemProps {
    id: string;
    index: number;
    moveMenuItem: (dragIndex: number, hoverIndex: number) => void;
    children: React.ReactNode;
    isEditMode: boolean;
}

const DraggableMenuItem: React.FC<DraggableMenuItemProps> = ({ id, index, moveMenuItem, children, isEditMode }) => {
    const ref = useRef<HTMLDivElement>(null);

    interface DragItem {
        index: number;
        id: string;
        type: string;
    }

    const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: any }>({
        accept: 'MENU_ITEM',
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
            return { id, index };
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
    const { isLoggedIn } = useAuth();

    // Menu Context
    const { menuItems, isEditMode, setIsEditMode, moveMenuItem } = useMenu();

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Top Header */}
            <header className={`sticky top-0 z-50 flex justify-between items-center px-4 md:px-6 py-3 md:py-4 theme-bg-header shadow-sm border-b theme-border transition-colors duration-300`}>
                {/* Logo */}
                <div
                    className={`flex items-center ${isEditMode ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
                    onClick={() => !isEditMode && navigate('/')}
                >
                    <img src="/logo.png" alt="Logo" className="w-18 md:w-20" />
                </div>

                {/* Desktop Center Navigation */}
                <nav className="hidden md:flex items-center justify-center">
                    {menuItems.map((item, index) => {
                        return (
                            <DraggableMenuItem
                                key={item.id}
                                index={index}
                                id={item.id}
                                moveMenuItem={moveMenuItem}
                                isEditMode={isEditMode}
                            >
                                <Link
                                    to={item.path}
                                    onClick={(e) => isEditMode && e.preventDefault()}
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
                <div className="flex items-center space-x-2 md:space-x-4 theme-text-secondary">
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
                                key={item.id}
                                index={index}
                                id={item.id}
                                moveMenuItem={moveMenuItem}
                                isEditMode={isEditMode}
                            >
                                <div className={`flex flex-col items-center justify-center w-full h-full space-y-1 p-2 ${active ? 'theme-text-primary' : 'theme-text-secondary'}`}>
                                    <Link
                                        to={item.path}
                                        onClick={(e) => isEditMode && e.preventDefault()}
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
                onMenuEditMode={() => {
                    setIsEditMode(true);
                    navigate('/home');
                }}
            />
        </>
    );
};

export default Navigation;
