
import React, { useState, useEffect } from 'react';
import { Zap, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';
import { AppScreen, WorkoutSession, WeeklyPlan } from './types';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import WeeklySchedule from './components/WeeklySchedule';
import AICoach from './components/AICoach';
import Settings from './components/Settings';
import { WEEKLY_DEFAULT_PLAN } from './constants';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.Dashboard);
  const [sessions, setSessions] = useState<WorkoutSession[]>(() => {
    const saved = localStorage.getItem('fitflow_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() => {
    const saved = localStorage.getItem('fitflow_weekly_plan');
    return saved ? JSON.parse(saved) : WEEKLY_DEFAULT_PLAN;
  });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ show: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    localStorage.setItem('fitflow_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('fitflow_weekly_plan', JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
    }
  }, [isDarkMode]);

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    setModal({ show: true, title, message, onConfirm });
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const updateSession = (updatedSession: WorkoutSession) => {
    setSessions(prev => {
      const exists = prev.find(s => s.id === updatedSession.id);
      if (exists) {
        return prev.map(s => s.id === updatedSession.id ? updatedSession : s);
      }
      return [...prev, updatedSession];
    });
  };

  const deleteSession = (sessionId: string) => {
    confirmAction(
      "Delete Workout?",
      "This will permanently remove this recorded session from your history.",
      () => setSessions(prev => prev.filter(s => s.id !== sessionId))
    );
  };

  const getTodayWorkout = () => {
    const today = new Date().toDateString();
    let session = sessions.find(s => new Date(s.date).toDateString() === today);
    
    if (!session) {
      const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const plan = weeklyPlan[dayName];
      if (plan) {
        session = {
          id: `session-${Date.now()}`,
          date: new Date().toISOString(),
          title: plan.title,
          exercises: plan.exercises.map((ex, i) => ({
            ...ex,
            id: `ex-${i}-${Date.now()}`,
            weight: 0,
            completed: false
          }))
        };
      }
    }
    return session;
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.Dashboard:
        return <Dashboard 
          sessions={sessions} 
          todayWorkout={getTodayWorkout()} 
          onUpdateSession={updateSession}
        />;
      case AppScreen.Calendar:
        return <CalendarView sessions={sessions} onDeleteSession={deleteSession} />;
      case AppScreen.Exercises:
        return <WeeklySchedule 
          weeklyPlan={weeklyPlan} 
          setWeeklyPlan={setWeeklyPlan} 
          confirmAction={confirmAction}
        />;
      case AppScreen.AICoach:
        return <AICoach />;
      case AppScreen.Settings:
        return <Settings 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
          confirmAction={confirmAction}
          onClearData={() => {
            localStorage.clear();
            window.location.reload();
          }}
        />;
      default:
        return <Dashboard sessions={sessions} todayWorkout={getTodayWorkout()} onUpdateSession={updateSession} />;
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Navigation 
        currentScreen={currentScreen} 
        onScreenChange={setCurrentScreen} 
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      <main className="max-w-7xl mx-auto pb-24 md:pb-8">
        {renderScreen()}
      </main>

      {/* Confirmation Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-overlay animate-in fade-in duration-200">
          <div className="bg-[var(--bg-secondary)] organic-shape organic-border subtle-depth p-8 max-w-sm w-full space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 organic-shape flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">{modal.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm">{modal.message}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setModal({ ...modal, show: false })}
                className="flex-1 py-3 bg-[var(--bg-primary)] organic-shape border border-[var(--border)] font-bold text-sm transition-organic hover:bg-[var(--bg-secondary)]"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  modal.onConfirm();
                  setModal({ ...modal, show: false });
                }}
                className="flex-1 py-3 bg-rose-500 organic-shape text-white font-bold text-sm transition-organic hover:brightness-110 active:scale-95"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Nav Overlay */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 bg-[var(--bg-secondary)]/90 backdrop-blur-lg organic-shape organic-border flex justify-around p-4 z-50 subtle-depth border-t border-[var(--border)]">
        {[AppScreen.Dashboard, AppScreen.Calendar, AppScreen.Exercises, AppScreen.AICoach].map((screen) => (
          <button
            key={screen}
            onClick={() => setCurrentScreen(screen)}
            className={`transition-organic p-3 rounded-xl ${currentScreen === screen ? 'bg-[var(--accent)] text-[var(--bg-primary)]' : 'text-[var(--text-secondary)]'}`}
          >
            {screen === AppScreen.Dashboard && <Zap size={24} />}
            {screen === AppScreen.Calendar && <Calendar size={24} />}
            {screen === AppScreen.Exercises && <Zap size={24} className="rotate-90" />}
            {screen === AppScreen.AICoach && <MessageSquare size={24} />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
