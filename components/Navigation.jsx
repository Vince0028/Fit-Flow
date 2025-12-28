
import React from 'react';
import { LayoutDashboard, Calendar, Dumbbell, MessageSquare, Settings as SettingsIcon, Sun, Moon, Zap } from 'lucide-react';

const Navigation = ({ currentScreen, onScreenChange, isDarkMode, toggleTheme }) => {
    // Using strings or integers for enum values since AppScreen is gone
    // Assuming 0: Dashboard, 1: Calendar, 2: Exercises, 3: AICoach, 4: Settings
    // Or better, logic from App.jsx will define these.
    // Wait, I should probably check what AppScreen was.
    // In App.tsx:
    // enum AppScreen { Dashboard, Calendar, Exercises, AICoach, Settings }
    // So they are 0, 1, 2, 3, 4.
    // I'll stick to 0, 1, 2, 3, 4 usage.

    const navItems = [
        { id: 0, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { id: 1, icon: <Calendar size={20} />, label: 'Calendar' },
        { id: 2, icon: <Dumbbell size={20} />, label: 'Schedule' },
        { id: 3, icon: <MessageSquare size={20} />, label: 'Coach' },
        { id: 4, icon: <SettingsIcon size={20} />, label: 'Settings' },
    ];

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-[var(--bg-primary)] border-b border-[var(--border)] sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <div className="bg-[var(--accent)] p-2 organic-shape rotate-[-2deg]">
                    <Zap size={20} className="text-[var(--bg-primary)]" />
                </div>
                <span className="text-xl font-bold tracking-tight text-[var(--text-primary)]">FitFlow</span>
            </div>

            <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onScreenChange(item.id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-organic hover:text-[var(--accent)] ${currentScreen === item.id ? 'active-nav text-[var(--accent)]' : 'text-[var(--text-secondary)]'
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-organic"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </nav>
    );
};

export default Navigation;
