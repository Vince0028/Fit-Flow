
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  completed: boolean;
  muscleGroup: MuscleGroup;
}

export type MuscleGroup = 
  | 'Shoulder' 
  | 'Back' 
  | 'Chest' 
  | 'Tricep' 
  | 'Bicep' 
  | 'Legs' 
  | 'Core' 
  | 'Forearm' 
  | 'Stretches';

export interface WorkoutSession {
  id: string;
  date: string; // ISO String
  title: string;
  exercises: Exercise[];
  notes?: string;
}

export interface WeeklyPlan {
  [key: string]: {
    title: string;
    exercises: Omit<Exercise, 'id' | 'completed' | 'weight'>[];
  };
}

export enum AppScreen {
  Dashboard = 'Dashboard',
  Calendar = 'Calendar',
  Exercises = 'Exercises',
  AICoach = 'AICoach',
  Settings = 'Settings'
}
