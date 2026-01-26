
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X, AlertTriangle, CheckCircle2, Info, Check } from 'lucide-react';
import { MUSCLE_ICONS, getMuscleGroup, COMMON_EXERCISES } from '../../constants';
import { convertWeight, toKg } from '../common/UnitConverter';

const WeeklySchedule = ({ weeklyPlan, setWeeklyPlan, confirmAction, units }) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [editingDay, setEditingDay] = useState(null);
    const [editBuffer, setEditBuffer] = useState(null); // Local buffer for edits
    const [activeMuscleDropdown, setActiveMuscleDropdown] = useState({ day: null, index: null });
    const [deleteModal, setDeleteModal] = useState({ show: false, day: null, exIndex: null, exerciseName: '', otherDays: [] });
    const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, exerciseName: '', scope: '' });
    // Modal for delete during editing
    const [editDeleteModal, setEditDeleteModal] = useState({ show: false, index: null, exercise: null });

    // When starting to edit a day, copy its data to the buffer (deep copy)
    const startEditing = (day) => {
        const dayPlan = weeklyPlan[day];
        setEditBuffer({
            ...dayPlan,
            exercises: dayPlan.exercises.map(ex => ({ ...ex })) // Deep copy exercises
        });
        setEditingDay(day);
    };

    // Save changes from buffer to actual plan
    const saveChanges = () => {
        if (editingDay && editBuffer) {
            setWeeklyPlan(prev => ({
                ...prev,
                [editingDay]: editBuffer
            }));
        }
        setEditingDay(null);
        setEditBuffer(null);
    };

    // Cancel editing and discard changes
    const cancelEditing = () => {
        setEditingDay(null);
        setEditBuffer(null);
    };

    // Get the end of current week (Sunday)
    const getEndOfWeek = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + daysUntilSunday);
        return endOfWeek.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

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
        const exerciseName = weeklyPlan[day].exercises[exIndex]?.name;
        setWeeklyPlan(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                exercises: prev[day].exercises.filter((_, i) => i !== exIndex)
            }
        }));
        closeDeleteModal();
        // Show confirmation notification
        setDeleteConfirmation({ show: true, exerciseName, scope: day });
        setTimeout(() => setDeleteConfirmation({ show: false, exerciseName: '', scope: '' }), 5000);
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
        // Show confirmation notification
        setDeleteConfirmation({ show: true, exerciseName, scope: 'all days' });
        setTimeout(() => setDeleteConfirmation({ show: false, exerciseName: '', scope: '' }), 5000);
    };

    // Add exercise to the local buffer (not saved until Save is clicked)
    const addExerciseToBuffer = () => {
        if (!editBuffer) return;
        const newEx = { name: 'New Exercise', sets: 3, reps: 10, weight: 0, muscleGroup: 'Core' };
        setEditBuffer(prev => ({
            ...prev,
            exercises: [...prev.exercises, newEx]
        }));
    };

    // Update exercise in the local buffer
    const updateExerciseInBuffer = (index, field, value) => {
        if (!editBuffer) return;

        setEditBuffer(prev => {
            const newExs = [...prev.exercises];

            if (field === 'name') {
                newExs[index] = {
                    ...newExs[index],
                    name: value,
                    muscleGroup: getMuscleGroup(value)
                };
            } else if (['weight', 'sets', 'reps'].includes(field)) {
                let valueToStore = Number(value);

                if (field === 'weight') {
                    valueToStore = toKg(value, units);
                }

                const validValue = Math.max(0, valueToStore);
                newExs[index] = { ...newExs[index], [field]: validValue };
            } else {
                newExs[index] = { ...newExs[index], [field]: value };
            }

            return { ...prev, exercises: newExs };
        });
    };

    // Update title in the local buffer
    const updateTitleInBuffer = (newTitle) => {
        if (!editBuffer) return;
        setEditBuffer(prev => ({ ...prev, title: newTitle }));
    };

    // Open delete modal during editing
    const openEditDeleteModal = (index) => {
        if (!editBuffer) return;
        const exercise = editBuffer.exercises[index];
        setEditDeleteModal({ show: true, index, exercise });
    };

    // Remove exercise from buffer only (this day only)
    const removeFromThisDayOnly = () => {
        if (!editBuffer || editDeleteModal.index === null) return;
        const exerciseName = editDeleteModal.exercise?.name;
        setEditBuffer(prev => ({
            ...prev,
            exercises: prev.exercises.filter((_, i) => i !== editDeleteModal.index)
        }));
        setEditDeleteModal({ show: false, index: null, exercise: null });
        // Show confirmation
        setDeleteConfirmation({ show: true, exerciseName, scope: `${editingDay} (pending save)` });
        setTimeout(() => setDeleteConfirmation({ show: false, exerciseName: '', scope: '' }), 3000);
    };

    // Remove exercise from all days (immediately saves to plan, then updates buffer)
    const removeFromAllDays = () => {
        if (!editDeleteModal.exercise) return;
        const exerciseName = editDeleteModal.exercise.name;

        // 1. Remove from the actual weekly plan (all days)
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

        // 2. Also remove from current buffer
        if (editBuffer) {
            setEditBuffer(prev => ({
                ...prev,
                exercises: prev.exercises.filter(ex => ex.name !== exerciseName)
            }));
        }

        setEditDeleteModal({ show: false, index: null, exercise: null });
        // Show confirmation
        setDeleteConfirmation({ show: true, exerciseName, scope: 'all days' });
        setTimeout(() => setDeleteConfirmation({ show: false, exerciseName: '', scope: '' }), 5000);
    };

    // Close delete modal
    const closeEditDeleteModal = () => {
        setEditDeleteModal({ show: false, index: null, exercise: null });
    };

    // The old functions that directly update the plan (used for delete operations outside of edit mode)
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
                    // Use buffer when editing, otherwise use saved plan
                    const displayPlan = isEditing && editBuffer ? editBuffer : plan;
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
                                                value={displayPlan.title}
                                                onChange={(e) => updateTitleInBuffer(e.target.value)}
                                                placeholder="Day Title (e.g. Chest Day)"
                                            />
                                        ) : (
                                            <h3 className="text-lg font-bold">{displayPlan.title}</h3>
                                        )}
                                        <p className="text-xs text-[var(--text-secondary)]">{displayPlan.exercises.length} activities planned</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={saveChanges}
                                                className="p-2 organic-shape border border-emerald-500/50 bg-emerald-500/20 text-emerald-400 transition-organic hover:bg-emerald-500/30"
                                                title="Save changes"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="p-2 organic-shape border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-organic hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30"
                                                title="Cancel changes"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => startEditing(day)}
                                            className="p-2 organic-shape border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-organic"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {displayPlan.exercises.length === 0 ? (
                                displayPlan.isRestDay ? (
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
                                                    setEditBuffer(prev => ({ ...prev, isRestDay: false }));
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
                                                    onClick={addExerciseToBuffer}
                                                    className="flex-1 py-4 bg-[var(--accent)]/10 border-2 border-dashed border-[var(--accent)]/30 text-[var(--accent)] organic-shape flex items-center justify-center gap-2 font-bold hover:bg-[var(--accent)]/20 transition-organic"
                                                >
                                                    <Plus size={20} /> Add Exercise
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditBuffer(prev => ({ ...prev, isRestDay: true }));
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
                                    {displayPlan.exercises.map((ex, i) => (
                                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-[var(--bg-primary)]/50 border border-[var(--border)] organic-shape">
                                            <div className="flex items-center gap-3 flex-1">
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
                                                                            updateExerciseInBuffer(i, 'muscleGroup', m);
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
                                                        onChange={(e) => updateExerciseInBuffer(i, 'name', e.target.value)}
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
                                                            onChange={(e) => updateExerciseInBuffer(i, 'weight', e.target.value)}
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
                                                            onChange={(e) => updateExerciseInBuffer(i, 'sets', Number(e.target.value))}
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
                                                            onChange={(e) => updateExerciseInBuffer(i, 'reps', Number(e.target.value))}
                                                            placeholder="0"
                                                        />
                                                    ) : <span>{ex.reps}</span>}
                                                    <span>reps</span>
                                                </div>

                                                {isEditing && (
                                                    <button
                                                        onClick={() => openEditDeleteModal(i)}
                                                        className="p-2 text-rose-400 hover:text-rose-500 transition-organic"
                                                        title="Remove exercise"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {isEditing && (
                                        <button
                                            onClick={addExerciseToBuffer}
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

                        {/* Important Notice */}
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
                            <div className="flex items-start gap-2">
                                <Info size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-amber-200/80">
                                    <p className="font-semibold text-amber-400 mb-1">Important:</p>
                                    <ul className="space-y-1 list-disc pl-3">
                                        <li>Your <strong>workout history is NOT affected</strong> - all past records are safe</li>
                                        <li>Today's Dashboard workout remains unchanged</li>
                                        <li>This only changes your <strong>future schedule template</strong></li>
                                    </ul>
                                </div>
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
                                    This will remove the exercise from {deleteModal.day}'s schedule.
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

            {/* Edit Mode Delete Modal */}
            {editDeleteModal.show && editDeleteModal.exercise && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEditDeleteModal} />
                    <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] organic-shape p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
                        <button
                            onClick={closeEditDeleteModal}
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
                                <p className="text-sm text-[var(--text-secondary)]">"{editDeleteModal.exercise.name}"</p>
                            </div>
                        </div>

                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4">
                            <div className="flex items-start gap-2">
                                <Info size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-amber-200/80">
                                    <p className="font-semibold text-amber-400 mb-1">Important:</p>
                                    <ul className="space-y-1 list-disc pl-3">
                                        <li>Your <strong>workout history is NOT affected</strong></li>
                                        <li>Today's Dashboard workout remains unchanged</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={removeFromThisDayOnly}
                                className="w-full py-3 px-4 bg-[var(--bg-primary)] border border-[var(--border)] organic-shape font-semibold hover:bg-[var(--bg-secondary)] transition-organic text-left"
                            >
                                <div className="font-bold">Remove from {editingDay} Only</div>
                                <div className="text-xs text-[var(--text-secondary)] mt-1">Keep in other days' schedules</div>
                            </button>
                            <button
                                onClick={removeFromAllDays}
                                className="w-full py-3 px-4 bg-rose-500/20 border border-rose-500/30 text-rose-400 organic-shape font-semibold hover:bg-rose-500/30 transition-organic text-left"
                            >
                                <div className="font-bold">Remove from All Days</div>
                                <div className="text-xs text-rose-300/70 mt-1">Delete from entire weekly schedule</div>
                            </button>
                        </div>

                        <button
                            onClick={closeEditDeleteModal}
                            className="w-full mt-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Notification */}
            {deleteConfirmation.show && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="bg-[var(--bg-secondary)] border border-emerald-500/30 rounded-2xl p-4 shadow-2xl shadow-black/20 max-w-sm">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-full">
                                <CheckCircle2 size={20} className="text-emerald-500" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-[var(--text-primary)] text-sm">Exercise Removed</p>
                                <p className="text-xs text-[var(--text-secondary)] mt-1">
                                    "{deleteConfirmation.exerciseName}" removed from {deleteConfirmation.scope}.
                                </p>
                                <div className="mt-2 pt-2 border-t border-[var(--border)]">
                                    <p className="text-[10px] text-emerald-400 font-medium">
                                        ✓ Your past workout history is unchanged
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDeleteConfirmation({ show: false, exerciseName: '', scope: '' })}
                                className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WeeklySchedule;
