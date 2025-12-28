
import React from 'react';
import { ChevronLeft, ChevronRight, Trash2, Check, CircleDashed } from 'lucide-react';

const CalendarView = ({ sessions, onDeleteSession, weeklyPlan, onMarkComplete }) => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getSessionsForDay = (day) => {

        return sessions.filter(s => {
            const d = new Date(s.date);
            return d.getDate() === day && d.getMonth() === new Date().getMonth();
        });
    };

    const getScheduledForDay = (day) => {
        if (!weeklyPlan) return null;
        const date = new Date();
        date.setDate(day);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
        const plan = weeklyPlan[dayName];
        if (plan && plan.exercises && plan.exercises.length > 0) {
            return { ...plan, dayName };
        }
        return null;
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold">Training History</h1>
                <p className="text-[var(--text-secondary)]">Track your consistency over time</p>
            </div>

            <div className="bg-[var(--bg-secondary)] organic-shape organic-border p-4 sm:p-8 subtle-depth overflow-x-auto">
                <div className="flex items-center justify-between mb-8 px-2 min-w-[600px]">
                    <button className="p-2 hover:bg-[var(--bg-primary)] organic-shape transition-organic border border-transparent hover:border-[var(--border)]">
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </h2>
                    <button className="p-2 hover:bg-[var(--bg-primary)] organic-shape transition-organic border border-transparent hover:border-[var(--border)]">
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="min-w-[700px]">
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {weekDays.map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest py-2">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-4">
                        {days.map(day => {
                            const daySessions = getSessionsForDay(day);
                            const scheduled = getScheduledForDay(day);
                            const isToday = day === new Date().getDate();
                            const hasSession = daySessions.length > 0;

                            return (
                                <div
                                    key={day}
                                    className={`min-h-[140px] p-3 organic-shape border transition-organic group relative flex flex-col justify-between ${isToday
                                        ? 'bg-[var(--accent)]/5 border-[var(--accent)] ring-1 ring-[var(--accent)]'
                                        : 'bg-[var(--bg-primary)] border-[var(--border)] hover:border-[var(--accent)]/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-lg font-bold ${isToday ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                                            {day}
                                        </span>
                                    </div>

                                    <div className="space-y-1 mt-2">
                                        {daySessions.map(s => (
                                            <div key={s.id} className="relative group/sess">
                                                <div className="text-[9px] font-bold text-[var(--accent)] uppercase truncate bg-[var(--accent)]/10 px-2 py-1 rounded-lg border border-[var(--accent)]/20">
                                                    {s.title}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteSession(s.id);
                                                    }}
                                                    className="absolute -top-1 -right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover/sess:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        ))}

                                        {!hasSession && scheduled && (
                                            <div className="relative group/sched opacity-60 hover:opacity-100 transition-opacity">
                                                <div className="flex items-center gap-1 text-[9px] font-semibold text-[var(--text-secondary)] uppercase truncate border border-dashed border-[var(--border)] px-2 py-1 rounded-lg">
                                                    <CircleDashed size={8} /> {scheduled.title}
                                                </div>
                                                {isToday && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const date = new Date();
                                                            date.setDate(day);
                                                            onMarkComplete(date, scheduled);
                                                        }}
                                                        className="absolute -top-1 -right-1 p-1 bg-[var(--accent)] text-[var(--bg-primary)] rounded-full opacity-0 group-hover/sched:opacity-100 transition-opacity"
                                                        title="Mark as Done"
                                                    >
                                                        <Check size={10} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {isToday && !hasSession && !scheduled && (
                                        <div className="text-[10px] text-[var(--text-secondary)] font-medium italic opacity-40">
                                            Rest Day
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
