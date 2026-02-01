export interface WorkoutSet {
  reps: number;
  weight: number;
}

export interface WorkoutEntry {
  id: string;
  exercise: string;
  sets: WorkoutSet[];
  date: string;
  totalVolume: number; // reps * weight summed across all sets
}

export type Rank = 'Bronze' | 'Silver' | 'Gold';

export interface ExerciseStats {
  exercise: string;
  totalWorkouts: number;
  maxWeight: number;
  totalVolume: number;
  rank: Rank;
  lastWorkout: string;
}
