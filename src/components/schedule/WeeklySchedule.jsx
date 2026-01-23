
import React, { useState } from 'react';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { MUSCLE_ICONS, getMuscleGroup, COMMON_EXERCISES } from '../../constants';
import { convertWeight, toKg } from '../common/UnitConverter';

const WeeklySchedule = ({ weeklyPlan, setWeeklyPlan, confirmAction, units }) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [editingDay, setEditingDay] = useState(null);
    const [activeMuscleDropdown, setActiveMuscleDropdown] = useState({ day: null, index: null });
    const [deleteModal, setDeleteModal] = useState({ show: false, day: null, exIndex: null, exerciseName: '', otherDays: [] });

    // Find which other days have the same exercise
    const getOtherDaysWithExercise = (exerciseName, currentDay) => {
        return Object.keys(weeklyPlan).filter(d => 
            d !== currentDay && 
            weeklyPlan[d]?.exercises?.some(ex => ex.name === exerciseName)
        );
    };

    const openDeleteModal = (day, exIndex) => {
        const exerciseName = weeklyPlan[day].exercises[exIndex]?.name;
        const otherDays = getOtherDaysWithExercise(exerciseName, day);
        setDeleteModal({ show: true, day, exIndex, exerciseName, otherDays });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ show: false, day: null, exIndex: null, exerciseName: '', otherDays: [] });
    };

    const removeExerciseFromDay = (day, exIndex) => {
        setWeeklyPlan(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                exercises: prev[day].exercises.filter((_, i) => i !== exIndex)
            }
        }));
        closeDeleteModal();
    };

    const removeExerciseFromAllDays = (exerciseName) => {
        setWeeklyPlan(prev => {
            const newPlan = { ...prev };
            Object.keys(newPlan).forEach(d => {
                if (newPlan[d] && newPlan[d].exercises) {
                    newPlan[d] = {
                        ...newPlan[d],
                        exercises: newPlan[d].exercises.filter(ex => ex.name !== exerciseName)
                    };
                }
            });
            return newPlan;
        });
        closeDeleteModal();
    };

    const addExercise = (day) => {
        const newEx = { name: 'New Exercise', sets: 3, reps: 10, weight: 0, muscleGroup: 'Core' };
        setWeeklyPlan(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                exercises: [...prev[day].exercises, newEx]
            }
        }));
    };

    const updateExercise = (day, index, field, value) => {
        setWeeklyPlan(prev => {
            const dayPlan = prev[day];
            const newExs = [...dayPlan.exercises];


            if (field === 'name') {
                newExs[index] = {
                    ...newExs[index],
                    name: value,
                    muscleGroup: getMuscleGroup(value)
                };
            } else if (['weight', 'sets', 'reps'].includes(field)) {
                // Ensure no negative numbers logic
                let valueToStore = Number(value);

                if (field === 'weight') {
                    // Convert back to kg if needed
                    valueToStore = toKg(value, units);
                }

                const validValue = Math.max(0, valueToStore);
                newExs[index] = { ...newExs[index], [field]: validValue };

                // SYNC LOGIC: If updating weight, sync to all other days for the same exercise
                if (field === 'weight') {
                    const exerciseName = newExs[index].name;
                    const updatedWeight = validValue;

                    // Create a new full plan object
                    const newPlan = { ...prev };

                    // Iterate over all days to sync weight
                    Object.keys(newPlan).forEach(d => {
                        if (newPlan[d] && newPlan[d].exercises) {
                            // Map through exercises for this day
                            newPlan[d] = {
                                ...newPlan[d],
                                exercises: newPlan[d].exercises.map(ex => {
                                    // If name matches, update weight
                                    if (ex.name === exerciseName) {
                                        return { ...ex, weight: updatedWeight };
                                    }
                                    return ex;
                                })
                            };
                        }
                    });

                    // We've already updated the specific day's specific index in 'newExs', 
                    // but the loop above might have overwritten it or we need to ensure consistency.
                    // The loop above updates ALL matching exercises. The currently edited one is also matching.
                    // However, we started by creating `newExs` which is the array for the *current* day.
                    // The loop above updates `newPlan[d]`.
                    // So we should just return `newPlan` directly, but we need to ensure the *current* editing session
                    // works fine. 
                    // Actually, the loop updates `newPlan` based on `prev`. `newExs` was derived from `current day`.
                    // So we should effectively apply the sync to `newPlan`.

                    // Let's discard `newExs` local mutation for the return and rely on the global sync
                    // BUT for non-weight fields, we still need the local update.

                    // Refined approach:
                    // 1. Update the local exercise in the plan
                    newPlan[day] = { ...newPlan[day], exercises: newExs };

                    // 2. NOW sync that change to other days
                    Object.keys(newPlan).forEach(d => {
                        if (d === day) return; // Skip current day as we just updated it

                        if (newPlan[d] && newPlan[d].exercises) {
                            newPlan[d] = {
                                ...newPlan[d],
                                exercises: newPlan[d].exercises.map(ex => {
                                    if (ex.name === exerciseName) {
                                        return { ...ex, weight: updatedWeight };
                                    }
                                    return ex;
                                })
                            };
                        }
                    });

                    return newPlan;
                }
            } else {
                newExs[index] = { ...newExs[index], [field]: value };
            }

            return { ...prev, [day]: { ...dayPlan, exercises: newExs } };
        });
    };

    const updateDayTitle = (day, newTitle) => {
        setWeeklyPlan(prev => ({
            ...prev,
            [day]: { ...prev[day], title: newTitle }
        }));
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">Training Plan</h1>
                    <p className="text-[var(--text-secondary)]">Your recurring weekly schedule</p>
                </div>
            </div>

            <div className="space-y-4">
                {days.map((day) => {
                    const plan = weeklyPlan[day];
                    const isEditing = editingDay === day;
                    return (
                        <div key={day} className="bg-[var(--bg-secondary)] organic-shape organic-border p-6 subtle-depth transition-organic">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 organic-shape bg-[var(--accent)]/10 border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] text-sm font-bold rotate-[-2deg]">
                                        {day.substring(0, 3)}
                                    </div>
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <input
                                                className="text-lg font-bold bg-transparent border-b border-[var(--accent)] focus:outline-none w-full mb-1"
                                                value={plan.title}
                                                onChange={(e) => updateDayTitle(day, e.target.value)}
                                                placeholder="Day Title (e.g. Chest Day)"
                                            />
                                        ) : (
                                            <h3 className="text-lg font-bold">{plan.title}</h3>
                                        )}
                                        <p className="text-xs text-[var(--text-secondary)]">{plan.exercises.length} activities planned</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditingDay(isEditing ? null : day)}
                                        className={`p-2 organic-shape border border-[var(--border)] transition-organic ${isEditing ? 'bg-[var(--accent)] text-[var(--bg-primary)]' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)]'}`}
                                    >
                                        {isEditing ? <X size={16} /> : <Pencil size={16} />}
                                    </button>
                                </div>
                            </div>

                            {plan.exercises.length === 0 ? (
                                plan.isRestDay ? (
                                    <div className="p-8 border-2 border-dashed border-[var(--border)] organic-shape flex flex-col items-center justify-center gap-3 bg-[var(--bg-secondary)]/50">
                                        <div className="w-12 h-12 rounded-full bg-[var(--text-secondary)]/10 flex items-center justify-center text-[var(--text-secondary)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20" /><path d="M5 20v-8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8" /><path d="M10 10V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2v4" /></svg>
                                        </div>
                                        <div className="text-center">
                                            <h4 className="font-bold text-[var(--text-secondary)]">Rest Day Set</h4>
                                            <p className="text-xs text-[var(--text-secondary)]/70">Enjoy your recovery!</p>
                                        </div>
                                        {isEditing && (
                                            <button
                                                onClick={() => {
                                                    const newPlan = { ...weeklyPlan };
                                                    newPlan[day] = { ...newPlan[day], isRestDay: false };
                                                    setWeeklyPlan(newPlan);
                                                }}
                                                className="px-4 py-2 mt-2 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg transition-colors"
                                            >
                                                Undo Rest Day
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        {isEditing && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => addExercise(day)}
                                                    className="flex-1 py-4 bg-[var(--accent)]/10 border-2 border-dashed border-[var(--accent)]/30 text-[var(--accent)] organic-shape flex items-center justify-center gap-2 font-bold hover:bg-[var(--accent)]/20 transition-organic"
                                                >
                                                    <Plus size={20} /> Add Exercise
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newPlan = { ...weeklyPlan };
                                                        newPlan[day] = { ...newPlan[day], isRestDay: true };
                                                        setWeeklyPlan(newPlan);
                                                    }}
                                                    className="px-6 py-4 bg-[var(--bg-secondary)] border-2 border-dashed border-[var(--border)] text-[var(--text-secondary)] organic-shape flex flex-col items-center justify-center gap-1 font-bold hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-organic"
                                                    title="Set as Rest Day"
                                                >
                                                    <span className="text-xl">☕</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            ) : (
                                <div className="mt-6 space-y-3">
                                    {plan.exercises.map((ex, i) => (
                                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[var(--bg-primary)]/50 border border-[var(--border)] organic-shape">
                                            <div className="flex items-center gap-3 flex-1">
                                                {/* ... (Existing muscle icon and active dropdown code) ... */}
                                                <div
                                                    className={`relative p-2 bg-[var(--bg-secondary)] organic-shape border border-[var(--border)] transition-colors ${isEditing ? 'cursor-pointer hover:border-[var(--accent)]' : ''}`}
                                                    onClick={(e) => {
                                                        if (isEditing) {
                                                            e.stopPropagation();
                                                            setActiveMuscleDropdown(activeMuscleDropdown.day === day && activeMuscleDropdown.index === i ? { day: null, index: null } : { day, index: i });
                                                        }
                                                    }}
                                                >
                                                    {MUSCLE_ICONS[ex.muscleGroup]}


                                                    {isEditing && activeMuscleDropdown.day === day && activeMuscleDropdown.index === i && (
                                                        <div className="absolute top-12 left-0 z-[100] w-48 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                                                            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                                                                {Object.keys(MUSCLE_ICONS).map(m => (
                                                                    <button
                                                                        key={m}
                                                                        onClick={() => {
                                                                            updateExercise(day, i, 'muscleGroup', m);
                                                                            setActiveMuscleDropdown({ day: null, index: null });
                                                                        }}
                                                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${ex.muscleGroup === m ? 'bg-[var(--accent)] text-[var(--bg-primary)]' : 'hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                                                    >
                                                                        {React.cloneElement(MUSCLE_ICONS[m], { size: 16 })} {m}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {isEditing && activeMuscleDropdown.day === day && activeMuscleDropdown.index === i && (
                                                    <div className="fixed inset-0 z-[99]" onClick={(e) => { e.stopPropagation(); setActiveMuscleDropdown({ day: null, index: null }); }} />
                                                )}
                                                {isEditing ? (
                                                    <input
                                                        className="bg-transparent border-b border-[var(--accent)] font-medium w-full"
                                                        value={ex.name}
                                                        onChange={(e) => updateExercise(day, i, 'name', e.target.value)}
                                                        list="exercise-list"
                                                        placeholder="Exercise Name"
                                                    />
                                                ) : (
                                                    <span className="font-medium">{ex.name}</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)] uppercase">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="w-16 bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-1"
                                                            value={convertWeight(ex.weight || 0, units).value === 0 ? '' : convertWeight(ex.weight || 0, units).value}
                                                            onChange={(e) => updateExercise(day, i, 'weight', e.target.value)}
                                                            placeholder="0"
                                                        />
                                                    ) : <span>{convertWeight(ex.weight || 0, units).value}</span>}
                                                    <span>{units}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)] uppercase">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="w-10 bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-1"
                                                            value={ex.sets === 0 ? '' : ex.sets}
                                                            onChange={(e) => updateExercise(day, i, 'sets', Number(e.target.value))}
                                                            placeholder="0"
                                                        />
                                                    ) : <span>{ex.sets}</span>}
                                                    <span>sets</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs font-bold text-[var(--text-secondary)] uppercase">
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            className="w-10 bg-[var(--bg-secondary)] border border-[var(--border)] rounded p-1"
                                                            value={ex.reps === 0 ? '' : ex.reps}
                                                            onChange={(e) => updateExercise(day, i, 'reps', Number(e.target.value))}
                                                            placeholder="0"
                                                        />
                                                    ) : <span>{ex.reps}</span>}
                                                    <span>reps</span>
                                                </div>

                                                {isEditing && (
                                                    <button
                                                        onClick={() => openDeleteModal(day, i)}
                                                        className="p-2 text-rose-400 hover:text-rose-500 transition-organic"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {isEditing && (
                                        <button
                                            onClick={() => addExercise(day)}
                                            className="w-full py-4 bg-[var(--accent)]/10 border-2 border-dashed border-[var(--accent)]/30 text-[var(--accent)] organic-shape flex items-center justify-center gap-2 font-bold hover:bg-[var(--accent)]/20 transition-organic"
                                        >
                                            <Plus size={20} /> Add Exercise
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <datalist id="exercise-list">
                {COMMON_EXERCISES.map((ex, i) => (
                    <option key={i} value={ex} />
                ))}
            </datalist>

            {/* Delete Exercise Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDeleteModal} />
                    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] organic-shape p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={closeDeleteModal}
                            className="absolute top-4 right-4 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <X size={20} />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-rose-500/10 rounded-full">
                                <Trash2 size={24} className="text-rose-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Remove Exercise?</h3>
                                <p className="text-sm text-[var(--text-secondary)]">"{deleteModal.exerciseName}"</p>
                            </div>
                        </div>

                        {deleteModal.otherDays.length > 0 ? (
                            <>
                                <p className="text-sm text-[var(--text-secondary)] mb-4">
                                    This exercise also appears on: <span className="font-semibold text-[var(--text-primary)]">{deleteModal.otherDays.join(', ')}</span>
                                </p>
                                
                                <div className="space-y-3">
                                    <button
                                        onClick={() => removeExerciseFromDay(deleteModal.day, deleteModal.exIndex)}
                                        className="w-full py-3 px-4 bg-[var(--bg-primary)] border border-[var(--border)] organic-shape font-semibold hover:bg-[var(--bg-secondary)] transition-organic flex items-center justify-center gap-2"
                                    >
                                        Remove from {deleteModal.day} only
                                    </button>
                                    <button
                                        onClick={() => removeExerciseFromAllDays(deleteModal.exerciseName)}
                                        className="w-full py-3 px-4 bg-rose-500/20 border border-rose-500/30 text-rose-400 organic-shape font-semibold hover:bg-rose-500/30 transition-organic flex items-center justify-center gap-2"
                                    >
                                        Remove from all days ({deleteModal.otherDays.length + 1} total)
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-[var(--text-secondary)] mb-4">
                                    This will remove the exercise from {deleteModal.day}.
                                </p>
                                <button
                                    onClick={() => removeExerciseFromDay(deleteModal.day, deleteModal.exIndex)}
                                    className="w-full py-3 px-4 bg-rose-500/20 border border-rose-500/30 text-rose-400 organic-shape font-semibold hover:bg-rose-500/30 transition-organic"
                                >
                                    Remove Exercise
                                </button>
                            </>
                        )}

                        <button
                            onClick={closeDeleteModal}
                            className="w-full mt-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklySchedule;
