import { WorkoutEntry, ExerciseStats, Rank } from '@/types/workout';

// Calculate ranking based on total volume and max weight
export function calculateRank(totalVolume: number, maxWeight: number): Rank {
  // Bronze: < 5000 volume or < 100 lbs max
  // Silver: 5000-15000 volume or 100-200 lbs max
  // Gold: > 15000 volume or > 200 lbs max

  if (totalVolume >= 15000 || maxWeight >= 200) {
    return 'Gold';
  } else if (totalVolume >= 5000 || maxWeight >= 100) {
    return 'Silver';
  } else {
    return 'Bronze';
  }
}

export function getExerciseStats(workouts: WorkoutEntry[]): ExerciseStats[] {
  const exerciseMap = new Map<string, {
    totalVolume: number;
    maxWeight: number;
    count: number;
    lastWorkout: string;
  }>();

  // Aggregate stats by exercise
  workouts.forEach(workout => {
    const existing = exerciseMap.get(workout.exercise) || {
      totalVolume: 0,
      maxWeight: 0,
      count: 0,
      lastWorkout: workout.date,
    };

    const maxWeightInWorkout = Math.max(...workout.sets.map(s => s.weight), 0);

    exerciseMap.set(workout.exercise, {
      totalVolume: existing.totalVolume + workout.totalVolume,
      maxWeight: Math.max(existing.maxWeight, maxWeightInWorkout),
      count: existing.count + 1,
      lastWorkout: workout.date > existing.lastWorkout ? workout.date : existing.lastWorkout,
    });
  });

  // Convert to ExerciseStats array with ranks
  const stats: ExerciseStats[] = [];
  exerciseMap.forEach((data, exercise) => {
    stats.push({
      exercise,
      totalWorkouts: data.count,
      maxWeight: data.maxWeight,
      totalVolume: data.totalVolume,
      rank: calculateRank(data.totalVolume, data.maxWeight),
      lastWorkout: data.lastWorkout,
    });
  });

  // Sort by rank (Gold > Silver > Bronze), then by total volume
  const rankOrder: Record<Rank, number> = { Gold: 3, Silver: 2, Bronze: 1 };
  stats.sort((a, b) => {
    if (a.rank !== b.rank) {
      return rankOrder[b.rank] - rankOrder[a.rank];
    }
    return b.totalVolume - a.totalVolume;
  });

  return stats;
}
