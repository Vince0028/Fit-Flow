
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
    'Monday': { title: 'Rest Day', exercises: [] },
    'Tuesday': { title: 'Rest Day', exercises: [] },
    'Wednesday': { title: 'Rest Day', exercises: [] },
    'Thursday': { title: 'Rest Day', exercises: [] },
    'Friday': { title: 'Rest Day', exercises: [] },
    'Saturday': { title: 'Rest Day', exercises: [] },
    'Sunday': { title: 'Rest Day', exercises: [] }
};

export const MUSCLE_ICONS = {
    Shoulder: <Zap size={18} className="text-amber-600 dark:text-amber-300" />,
    Back: <Anchor size={18} className="text-blue-600 dark:text-blue-300" />,
    Chest: <Heart size={18} className="text-rose-600 dark:text-rose-300" />,
    Tricep: <Zap size={18} className="text-emerald-600 dark:text-emerald-300" />,
    Bicep: <Dumbbell size={18} className="text-indigo-600 dark:text-indigo-300" />,
    Legs: <CircleDot size={18} className="text-orange-600 dark:text-orange-300" />,
    Core: <ShieldCheck size={18} className="text-purple-600 dark:text-purple-300" />,
    Forearm: <Activity size={18} className="text-cyan-600 dark:text-cyan-300" />,
    Stretches: <Target size={18} className="text-lime-600 dark:text-lime-300" />
};

export const getMuscleGroup = (name) => {
    const n = name.toLowerCase();
    if (n.includes('shoulder') || n.includes('overhead') || n.includes('raise') || n.includes('military')) return 'Shoulder';
    if (n.includes('row') || n.includes('pull') || n.includes('back') || n.includes('lat') || n.includes('chin')) return 'Back';
    if (n.includes('bench') || n.includes('chest') || n.includes('push') || n.includes('dip') || n.includes('fly')) return 'Chest';
    if (n.includes('tricep') || n.includes('extension') || n.includes('skull')) return 'Tricep';
    if (n.includes('curl') || n.includes('bicep')) return 'Bicep';
    if (n.includes('squat') || n.includes('leg') || n.includes('lunge') || n.includes('calf') || n.includes('deadlift')) return 'Legs';
    if (n.includes('plank') || n.includes('crunch') || n.includes('sit') || n.includes('abs') || n.includes('core')) return 'Core';
    if (n.includes('wrist') || n.includes('forearm')) return 'Forearm';
    if (n.includes('stretch') || n.includes('yoga') || n.includes('mobility')) return 'Stretches';
    return 'Core'; // Default
};

export const COMMON_EXERCISES = [
    'Bench Press', 'Incline Bench Press', 'Dips', 'Push Ups',
    'Squat', 'Deadlift', 'Leg Press', 'Lunges', 'Calf Raise',
    'Pull Ups', 'Lat Pulldown', 'Barbell Row', 'Face Pulls',
    'Overhead Press', 'Lateral Raise', 'Front Raise',
    'Bicep Curl', 'Hammer Curl', 'Tricep Extension', 'Skullcrushers',
    'Plank', 'Crunches', 'Leg Raise', 'Russian Twist',
    'Running', 'Cycling', 'Jump Rope', 'Stretching'
];
