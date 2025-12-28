
import React from 'react';
import { LayoutDashboard, Calendar, Dumbbell, MessageSquare, Settings, Sun, Moon, Zap } from 'lucide-react';
import { AppScreen } from '../types';

interface NavigationProps {
  currentScreen: AppScreen;
  onScreenChange: (screen: AppScreen) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentScreen, onScreenChange, isDarkMode, toggleTheme }) => {
  const navItems = [
    { id: AppScreen.Dashboard, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: AppScreen.Calendar, icon: <Calendar size={20} />, label: 'Calendar' },
    { id: AppScreen.Exercises, icon: <Dumbbell size={20} />, label: 'Schedule' },
    { id: AppScreen.AICoach, icon: <MessageSquare size={20} />, label: 'Coach' },
    { id: AppScreen.Settings, icon: <Settings size={20} />, label: 'Settings' },
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
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-organic hover:text-[var(--accent)] ${
              currentScreen === item.id ? 'active-nav text-[var(--accent)]' : 'text-[var(--text-secondary)]'
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
