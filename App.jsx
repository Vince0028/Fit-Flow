
import React, { useState, useEffect } from 'react';
import { Zap, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import WeeklySchedule from './components/WeeklySchedule';
import AICoach from './components/AICoach';
import Settings from './components/Settings';
import { WEEKLY_DEFAULT_PLAN } from './constants';
import { supabase } from './services/supabaseClient';

const AppScreen = {
    Dashboard: 0,
    Calendar: 1,
    Exercises: 2,
    AICoach: 3,
    Settings: 4
};

const App = () => {
    const [currentScreen, setCurrentScreen] = useState(AppScreen.Dashboard);
    const [sessions, setSessions] = useState([]);
    const [weeklyPlan, setWeeklyPlan] = useState(WEEKLY_DEFAULT_PLAN);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [userId, setUserId] = useState(null);
    const [modal, setModal] = useState({ show: false, title: '', message: '', onConfirm: () => { } });

    // Initialize User ID
    useEffect(() => {
        let storedId = localStorage.getItem('fitflow_user_id');
        if (!storedId) {
            storedId = crypto.randomUUID();
            localStorage.setItem('fitflow_user_id', storedId);
        }
        setUserId(storedId);
    }, []);

    // Fetch Data from Supabase
    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            // Fetch Sessions
            const { data: sessionsData, error: sessionsError } = await supabase
                .from('sessions')
                .select('*')
                .eq('user_id', userId);

            if (sessionsData) {
                setSessions(sessionsData);
            } else if (sessionsError) {
                console.error('Error fetching sessions:', sessionsError);
                // Fallback to local storage if DB fails (or table doesn't exist yet)
                const saved = localStorage.getItem('fitflow_sessions');
                if (saved) setSessions(JSON.parse(saved));
            }

            // Fetch Weekly Plan
            const { data: planData, error: planError } = await supabase
                .from('weekly_plan')
                .select('plan')
                .eq('user_id', userId)
                .single();

            if (planData) {
                setWeeklyPlan(planData.plan);
            } else {
                // If no plan, insert default
                if (planError && planError.code === 'PGRST116') { // No rows found
                    await supabase.from('weekly_plan').insert({ user_id: userId, plan: WEEKLY_DEFAULT_PLAN });
                }
            }
        };

        fetchData();
    }, [userId]);

    // Sync Theme
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.remove('light');
        } else {
            document.body.classList.add('light');
        }
    }, [isDarkMode]);

    const confirmAction = (title, message, onConfirm) => {
        setModal({ show: true, title, message, onConfirm });
    };

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    const updateSession = async (updatedSession) => {
        // Optimistic update
        setSessions(prev => {
            const exists = prev.find(s => s.id === updatedSession.id);
            if (exists) {
                return prev.map(s => s.id === updatedSession.id ? updatedSession : s);
            }
            return [...prev, updatedSession];
        });

        // Supabase Update
        if (userId) {
            const sessionPayload = { ...updatedSession, user_id: userId };
            const { error } = await supabase
                .from('sessions')
                .upsert(sessionPayload);

            if (error) console.error('Error updating session:', error);
        }
    };

    const deleteSession = async (sessionId) => {
        confirmAction(
            "Delete Workout?",
            "This will permanently remove this recorded session from your history.",
            async () => {
                setSessions(prev => prev.filter(s => s.id !== sessionId));
                if (userId) {
                    await supabase.from('sessions').delete().eq('id', sessionId);
                }
            }
        );
    };

    // Wrapper to intercept setWeeklyPlan and sync to DB
    const handleSetWeeklyPlan = (newValueOrFn) => {
        // Resolve functional state update if needed
        let newPlan;
        if (typeof newValueOrFn === 'function') {
            setWeeklyPlan(prev => {
                newPlan = newValueOrFn(prev);
                return newPlan;
            });
        } else {
            newPlan = newValueOrFn;
            setWeeklyPlan(newPlan);
        }

        // We need to wait for the state update, but here we just use the resolved value
        // Just wait a tick or fire and forget
        if (userId && newPlan) {
            supabase.from('weekly_plan').upsert({ user_id: userId, plan: newPlan }).then(({ error }) => {
                if (error) console.error("Failed to sync plan:", error);
            });
        }
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
                    setWeeklyPlan={handleSetWeeklyPlan}
                    confirmAction={confirmAction}
                />;
            case AppScreen.AICoach:
                return <AICoach />;
            case AppScreen.Settings:
                return <Settings
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                    confirmAction={confirmAction}
                    onClearData={async () => {
                        localStorage.clear();
                        if (userId) {
                            await supabase.from('sessions').delete().eq('user_id', userId);
                            await supabase.from('weekly_plan').delete().eq('user_id', userId);
                        }
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
