import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Filter, X, Menu, ChevronDown } from 'lucide-react';

const HistoryPage = ({ sessions }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
    const [filterExercise, setFilterExercise] = useState('all');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const weeksPerPage = 4;

    // Calculate all weeks from sessions
    const allWeeks = useMemo(() => {
        if (sessions.length === 0) return [];

        // Group sessions by week
        const weekMap = new Map();

        sessions.forEach(session => {
            const sessionDate = new Date(session.date);
            const weekStart = new Date(sessionDate);
            const day = weekStart.getDay();
            const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
            weekStart.setDate(diff);
            weekStart.setHours(0, 0, 0, 0);

            const weekKey = weekStart.toISOString().split('T')[0];

            if (!weekMap.has(weekKey)) {
                weekMap.set(weekKey, {
                    startDate: weekStart,
                    exercises: [],
                    totalExercises: 0,
                    completedExercises: 0
                });
            }

            const week = weekMap.get(weekKey);

            // Aggregate exercise data
            if (session.exercises) {
                session.exercises.forEach(exercise => {
                    week.totalExercises += 1;
                    if (exercise.completed) {
                        week.completedExercises += 1;
                    }

                    const existingExercise = week.exercises.find(ex => ex.name === exercise.name);
                    if (existingExercise) {
                        existingExercise.completedReps += exercise.reps || 0;
                        existingExercise.completedSets += exercise.sets || 0;
                        existingExercise.count += 1;
                        if (exercise.completed) existingExercise.timesCompleted += 1;
                    } else {
                        week.exercises.push({
                            name: exercise.name,
                            plannedSets: exercise.sets || 0,
                            plannedReps: exercise.reps || 0,
                            completedSets: exercise.sets || 0,
                            completedReps: exercise.reps || 0,
                            timesCompleted: exercise.completed ? 1 : 0,
                            count: 1
                        });
                    }
                });
            }
        });

        const weeksArray = Array.from(weekMap.values());
        weeksArray.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

        return weeksArray.map((week, index) => {
            const consistencyScore = week.totalExercises > 0
                ? Math.round((week.completedExercises / week.totalExercises) * 100)
                : 0;
            return {
                ...week,
                weekNumber: weeksArray.length - index,
                consistencyScore: isNaN(consistencyScore) ? 0 : consistencyScore
            };
        });
    }, [sessions]);

    // Get all unique exercises for filter
    const allExercises = useMemo(() => {
        const exerciseSet = new Set();
        allWeeks.forEach(week => {
            week.exercises.forEach(ex => {
                exerciseSet.add(ex.name);
            });
        });
        return Array.from(exerciseSet).sort();
    }, [allWeeks]);

    // Filter exercises in selected week
    const selectedWeek = useMemo(() => {
        const index = Math.min(selectedWeekIndex, allWeeks.length - 1);
        const week = allWeeks[index] || null;

        if (!week) return null;

        if (filterExercise === 'all') {
            return week;
        }

        return {
            ...week,
            exercises: week.exercises.filter(ex => ex.name === filterExercise)
        };
    }, [allWeeks, selectedWeekIndex, filterExercise]);

    const paginatedWeeks = useMemo(() => {
        return allWeeks.slice(
            currentPage * weeksPerPage,
            (currentPage + 1) * weeksPerPage
        );
    }, [allWeeks, currentPage]);

    const totalPages = Math.ceil(allWeeks.length / weeksPerPage);

    if (allWeeks.length === 0) {
        return (
            <div className="p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                    <h1 className="text-3xl font-bold">Workout History</h1>
                    <p className="text-[var(--text-secondary)]">Track all your training sessions and progress</p>
                </div>
                <div className="bg-[var(--bg-secondary)] organic-shape organic-border p-8 text-center subtle-depth">
                    <TrendingUp size={40} className="text-[var(--text-secondary)] mx-auto mb-4 opacity-40" />
                    <p className="text-[var(--text-secondary)]">No workout history yet. Start training to see your progress!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
                <h1 className="text-3xl font-bold">Workout History</h1>
                <p className="text-[var(--text-secondary)]">Track all your training sessions and progress</p>
            </div>

            {/* Mobile Filter Section */}
            <div className="md:hidden space-y-3">
                <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="flex items-center justify-between w-full text-left bg-[var(--bg-secondary)] p-3 rounded-lg organic-border"
                >
                    <span className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                        Filter Exercise {filterExercise !== 'all' && `• ${filterExercise}`}
                    </span>
                    <ChevronDown size={20} className={`text-[var(--text-secondary)] transition-transform duration-300 ${showFilterMenu ? 'rotate-180' : ''}`} />
                </button>

                {showFilterMenu && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <button
                            onClick={() => {
                                setFilterExercise('all');
                                setShowFilterMenu(false);
                            }}
                            className={`block w-full text-left px-3 py-2 rounded transition-organic ${filterExercise === 'all'
                                    ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                                    : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/80'
                                }`}
                        >
                            All Exercises
                        </button>
                        {allExercises.map(exercise => (
                            <button
                                key={exercise}
                                onClick={() => {
                                    setFilterExercise(exercise);
                                    setShowFilterMenu(false);
                                }}
                                className={`block w-full text-left px-3 py-2 rounded transition-organic ${filterExercise === exercise
                                        ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                                        : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/80'
                                    }`}
                            >
                                {exercise}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop Filter Section */}
            <div className="hidden md:block relative">
                <button
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-secondary)] organic-shape organic-border text-[var(--text-secondary)] hover:text-[var(--accent)] transition-organic"
                >
                    <Filter size={18} />
                    <span className="text-sm font-medium">
                        {filterExercise === 'all' ? 'All Exercises' : filterExercise}
                    </span>
                </button>

                {showFilterMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-[var(--bg-secondary)] organic-shape organic-border p-3 subtle-depth z-50 min-w-[200px]">
                        <button
                            onClick={() => {
                                setFilterExercise('all');
                                setShowFilterMenu(false);
                            }}
                            className={`block w-full text-left px-3 py-2 rounded mb-2 transition-organic ${filterExercise === 'all'
                                    ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                                }`}
                        >
                            All Exercises
                        </button>
                        {allExercises.map(exercise => (
                            <button
                                key={exercise}
                                onClick={() => {
                                    setFilterExercise(exercise);
                                    setShowFilterMenu(false);
                                }}
                                className={`block w-full text-left px-3 py-2 rounded mb-2 transition-organic ${filterExercise === exercise
                                        ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'
                                    }`}
                            >
                                {exercise}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop Week Selector - Hidden on Mobile */}
            <div className="hidden md:block bg-[var(--bg-secondary)] organic-shape organic-border p-6 subtle-depth">
                <h3 className="text-white text-lg font-semibold mb-4 uppercase tracking-wide">Select Week</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {paginatedWeeks.map((week, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedWeekIndex(currentPage * weeksPerPage + idx)}
                            className={`p-3 rounded-lg transition-all text-sm font-medium ${selectedWeekIndex === currentPage * weeksPerPage + idx
                                    ? 'bg-[var(--accent)] text-[var(--bg-primary)] shadow-lg'
                                    : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]/80'
                                }`}
                        >
                            <div className="font-bold">Week {week.weekNumber}</div>
                            <div className="text-xs opacity-75">
                                {week.startDate.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </div>
                        </button>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                        <button
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className="p-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-primary)]/80 transition-organic"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-[var(--text-secondary)] text-sm">
                            Page {currentPage + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="p-2 bg-[var(--bg-primary)] text-[var(--text-secondary)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-primary)]/80 transition-organic"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            {/* Week Statistics */}
            {selectedWeek && (
                <div className="bg-[var(--bg-secondary)] organic-shape organic-border p-6 subtle-depth space-y-4">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h4 className="text-white text-lg font-semibold uppercase tracking-wide">
                                Week {selectedWeek.weekNumber}
                            </h4>
                            <p className="text-[var(--text-secondary)] text-sm">
                                {selectedWeek.startDate.toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-[var(--accent)]">
                                {selectedWeek.consistencyScore}%
                            </div>
                            <div className="text-[var(--text-secondary)] text-sm">Consistency</div>
                        </div>
                    </div>

                    {/* Exercise Details */}
                    <div className="space-y-3">
                        <h5 className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-widest">
                            Exercise Breakdown {filterExercise !== 'all' && `- ${filterExercise}`}
                        </h5>
                        {selectedWeek.exercises.length > 0 ? (
                            selectedWeek.exercises.map((exercise, idx) => {
                                const completionRate = Math.round(
                                    (exercise.timesCompleted / exercise.count) * 100
                                );
                                return (
                                    <div key={idx} className="bg-[var(--bg-primary)] rounded-lg p-4 border border-[var(--border)]">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-white font-medium">{exercise.name}</span>
                                            <span className="text-[var(--accent)] font-semibold text-sm">
                                                {isNaN(completionRate) ? 0 : completionRate}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 mb-4">
                                            <div
                                                className="bg-[var(--accent)] h-2 rounded-full transition-all"
                                                style={{ width: `${isNaN(completionRate) ? 0 : completionRate}%` }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div className="bg-[var(--bg-secondary)] rounded p-3">
                                                <div className="text-[var(--text-secondary)] text-xs mb-1 uppercase tracking-wide">Sets Avg</div>
                                                <div className="font-semibold text-white text-lg">
                                                    {Math.round(exercise.completedSets / exercise.count)}
                                                </div>
                                            </div>
                                            <div className="bg-[var(--bg-secondary)] rounded p-3">
                                                <div className="text-[var(--text-secondary)] text-xs mb-1 uppercase tracking-wide">Reps Avg</div>
                                                <div className="font-semibold text-white text-lg">
                                                    {Math.round(exercise.completedReps / exercise.count)}
                                                </div>
                                            </div>
                                            <div className="bg-[var(--bg-secondary)] rounded p-3">
                                                <div className="text-[var(--text-secondary)] text-xs mb-1 uppercase tracking-wide">Times Done</div>
                                                <div className="font-semibold text-white text-lg">
                                                    {exercise.timesCompleted}/{exercise.count}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-[var(--text-secondary)] text-sm text-center py-4">
                                No exercises recorded for this filter
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;

