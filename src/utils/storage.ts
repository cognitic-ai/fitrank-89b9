import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutEntry } from '@/types/workout';

const WORKOUTS_KEY = 'workouts';

export const storage = {
  async getWorkouts(): Promise<WorkoutEntry[]> {
    try {
      const data = await AsyncStorage.getItem(WORKOUTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading workouts:', error);
      return [];
    }
  },

  async saveWorkout(workout: WorkoutEntry): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      workouts.unshift(workout); // Add to beginning
      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
    } catch (error) {
      console.error('Error saving workout:', error);
      throw error;
    }
  },

  async deleteWorkout(id: string): Promise<void> {
    try {
      const workouts = await this.getWorkouts();
      const filtered = workouts.filter(w => w.id !== id);
      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WORKOUTS_KEY);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  },
};
