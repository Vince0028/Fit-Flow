
import React from 'react';
import {
    Dumbbell,
    Target,
    User,
    Zap,
    Activity,
    ShieldCheck,
    Heart,
    Anchor,
    CircleDot
} from 'lucide-react';

export const WEEKLY_DEFAULT_PLAN = {
    'Monday': {
        title: 'Shoulder & Back Day',
        exercises: [
            { name: 'Lateral Raise', sets: 3, reps: 8, muscleGroup: 'Shoulder' },
            { name: 'Shoulder Press', sets: 3, reps: 8, muscleGroup: 'Shoulder' },
            { name: 'Pseudo Push Up', sets: 3, reps: 10, muscleGroup: 'Shoulder' },
            { name: 'Pull Ups', sets: 3, reps: 8, muscleGroup: 'Back' }
        ]
    },
    'Tuesday': {
        title: 'Tricep & Chest Day',
        exercises: [
            { name: 'Dips', sets: 3, reps: 10, muscleGroup: 'Tricep' },
            { name: 'Wide Push Up', sets: 3, reps: 10, muscleGroup: 'Chest' },
            { name: 'Diamond Push Up', sets: 3, reps: 10, muscleGroup: 'Tricep' }
        ]
    },
    'Wednesday': {
        title: 'Full Arms Day',
        exercises: [
            { name: 'Hammer Curl', sets: 3, reps: 8, muscleGroup: 'Bicep' },
            { name: 'Bicep Curl', sets: 3, reps: 8, muscleGroup: 'Bicep' },
            { name: 'Wrist Curl', sets: 3, reps: 8, muscleGroup: 'Forearm' }
        ]
    },
    'Thursday': {
        title: 'Shoulder & Back Day',
        exercises: [
            { name: 'Lateral Raise', sets: 3, reps: 8, muscleGroup: 'Shoulder' },
            { name: 'Shoulder Press', sets: 3, reps: 8, muscleGroup: 'Shoulder' },
            { name: 'Pull Ups', sets: 3, reps: 8, muscleGroup: 'Back' }
        ]
    },
    'Friday': {
        title: 'Core & Legs Day',
        exercises: [
            { name: 'Squats', sets: 3, reps: 8, muscleGroup: 'Legs' },
            { name: 'Leg Raises', sets: 3, reps: 15, muscleGroup: 'Core' },
            { name: 'Plank', sets: 3, reps: 60, muscleGroup: 'Core' }
        ]
    },
    'Saturday': {
        title: 'Stretches & Recovery',
        exercises: [
            { name: 'Mobility Work', sets: 1, reps: 15, muscleGroup: 'Stretches' },
            { name: 'Foam Rolling', sets: 1, reps: 10, muscleGroup: 'Stretches' }
        ]
    },
    'Sunday': {
        title: 'Active Recovery',
        exercises: [
            { name: 'Light Stretching', sets: 1, reps: 20, muscleGroup: 'Stretches' }
        ]
    }
};

export const MUSCLE_ICONS = {
    Shoulder: <Zap size={18} className="text-amber-200/60" />,
    Back: <Anchor size={18} className="text-blue-200/60" />,
    Chest: <Heart size={18} className="text-rose-200/60" />,
    Tricep: <Zap size={18} className="text-emerald-200/60" />,
    Bicep: <Dumbbell size={18} className="text-indigo-200/60" />,
    Legs: <CircleDot size={18} className="text-orange-200/60" />,
    Core: <ShieldCheck size={18} className="text-purple-200/60" />,
    Forearm: <Activity size={18} className="text-cyan-200/60" />,
    Stretches: <Target size={18} className="text-lime-200/60" />
};
