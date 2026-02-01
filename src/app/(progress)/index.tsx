import { useState, useCallback } from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as AC from '@bacons/apple-colors';
import { storage } from '@/utils/storage';
import { WorkoutEntry } from '@/types/workout';

export default function ProgressScreen() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

  const loadWorkouts = async () => {
    setLoading(true);
    const data = await storage.getWorkouts();
    setWorkouts(data);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
    }, [])
  );

  // Group workouts by exercise
  const exerciseData = workouts.reduce((acc, workout) => {
    if (!acc[workout.exercise]) {
      acc[workout.exercise] = [];
    }
    acc[workout.exercise].push(workout);
    return acc;
  }, {} as Record<string, WorkoutEntry[]>);

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekWorkouts = workouts.filter(w => new Date(w.date) >= weekAgo);

    return {
      count: weekWorkouts.length,
      volume: weekWorkouts.reduce((sum, w) => sum + w.totalVolume, 0),
    };
  };

  const weeklyStats = getWeeklyStats();

  // Get last 7 days of activity
  const getLast7Days = () => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === date.getTime();
      });

      days.push({
        date,
        count: dayWorkouts.length,
        volume: dayWorkouts.reduce((sum, w) => sum + w.totalVolume, 0),
      });
    }

    return days;
  };

  const last7Days = getLast7Days();
  const maxVolume = Math.max(...last7Days.map(d => d.volume), 1);

  const chartHeight = 120;
  const chartWidth = width - 64;
  const barWidth = Math.max(chartWidth / 7 - 8, 20);

  return (
    <View style={{ flex: 1, backgroundColor: AC.systemBackground }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          ...(process.env.EXPO_OS === 'web' && { paddingTop: 80 })
        }}
      >
        {loading ? (
          <Text style={{ color: AC.secondaryLabel, textAlign: 'center', marginTop: 40 }}>
            Loading progress...
          </Text>
        ) : workouts.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📊</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: AC.label, marginBottom: 8 }}>
              No Progress Yet
            </Text>
            <Text style={{ fontSize: 15, color: AC.secondaryLabel, textAlign: 'center' }}>
              Start logging workouts to see your progress!
            </Text>
          </View>
        ) : (
          <>
            {/* Weekly Summary */}
            <View
              style={{
                backgroundColor: AC.secondarySystemBackground,
                borderRadius: 12,
                padding: 16,
                borderCurve: 'continuous',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: AC.label, marginBottom: 12 }}>
                Last 7 Days
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: AC.systemBlue, fontVariant: ['tabular-nums'] }}>
                    {weeklyStats.count}
                  </Text>
                  <Text style={{ fontSize: 13, color: AC.secondaryLabel }}>Workouts</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 28, fontWeight: '700', color: AC.systemGreen, fontVariant: ['tabular-nums'] }}>
                    {(weeklyStats.volume / 1000).toFixed(1)}K
                  </Text>
                  <Text style={{ fontSize: 13, color: AC.secondaryLabel }}>Volume (lbs)</Text>
                </View>
              </View>
            </View>

            {/* Activity Chart */}
            <View
              style={{
                backgroundColor: AC.secondarySystemBackground,
                borderRadius: 12,
                padding: 16,
                borderCurve: 'continuous',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: AC.label, marginBottom: 16 }}>
                Daily Volume
              </Text>

              <View style={{ height: chartHeight, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', gap: 4 }}>
                {last7Days.map((day, index) => {
                  const barHeight = maxVolume > 0 ? (day.volume / maxVolume) * chartHeight : 0;
                  const hasWorkout = day.count > 0;

                  return (
                    <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                      <View
                        style={{
                          width: barWidth,
                          height: Math.max(barHeight, hasWorkout ? 4 : 2),
                          backgroundColor: hasWorkout ? AC.systemBlue : AC.tertiarySystemFill,
                          borderRadius: 4,
                          borderCurve: 'continuous',
                          marginBottom: 8,
                        }}
                      />
                      <Text style={{ fontSize: 11, color: AC.tertiaryLabel, fontWeight: hasWorkout ? '600' : '400' }}>
                        {day.date.toLocaleDateString('en-US', { weekday: 'short' })[0]}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Exercise Progress */}
            <Text style={{ fontSize: 20, fontWeight: '700', color: AC.label, marginTop: 8 }}>
              By Exercise
            </Text>

            {Object.entries(exerciseData)
              .sort(([, a], [, b]) => b.length - a.length)
              .map(([exercise, entries]) => {
                const totalVolume = entries.reduce((sum, e) => sum + e.totalVolume, 0);
                const avgVolume = totalVolume / entries.length;
                const maxWeight = Math.max(...entries.flatMap(e => e.sets.map(s => s.weight)));
                const recentEntries = entries.slice(0, 5).reverse();

                // Simple trend calculation
                const isImproving = recentEntries.length >= 2 &&
                  recentEntries[recentEntries.length - 1].totalVolume > recentEntries[0].totalVolume;

                return (
                  <View
                    key={exercise}
                    style={{
                      backgroundColor: AC.secondarySystemBackground,
                      borderRadius: 12,
                      padding: 16,
                      borderCurve: 'continuous',
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Text style={{ fontSize: 17, fontWeight: '600', color: AC.label }}>
                        {exercise}
                      </Text>
                      {isImproving && (
                        <Text style={{ fontSize: 20 }}>📈</Text>
                      )}
                    </View>

                    <View style={{ gap: 6 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, color: AC.secondaryLabel }}>Sessions</Text>
                        <Text style={{ fontSize: 14, color: AC.label, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
                          {entries.length}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, color: AC.secondaryLabel }}>Total Volume</Text>
                        <Text style={{ fontSize: 14, color: AC.label, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
                          {totalVolume.toLocaleString()} lbs
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, color: AC.secondaryLabel }}>Avg per Session</Text>
                        <Text style={{ fontSize: 14, color: AC.label, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
                          {Math.round(avgVolume).toLocaleString()} lbs
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, color: AC.secondaryLabel }}>Max Weight</Text>
                        <Text style={{ fontSize: 14, color: AC.label, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
                          {maxWeight} lbs
                        </Text>
                      </View>
                    </View>

                    {/* Mini chart */}
                    {recentEntries.length > 1 && (
                      <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: AC.separator }}>
                        <Text style={{ fontSize: 12, color: AC.tertiaryLabel, marginBottom: 8 }}>
                          Recent sessions
                        </Text>
                        <View style={{ height: 40, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
                          {recentEntries.map((entry, index) => {
                            const maxInRecent = Math.max(...recentEntries.map(e => e.totalVolume));
                            const barHeight = (entry.totalVolume / maxInRecent) * 40;

                            return (
                              <View
                                key={entry.id}
                                style={{
                                  flex: 1,
                                  height: Math.max(barHeight, 4),
                                  backgroundColor: AC.systemGreen,
                                  borderRadius: 2,
                                  borderCurve: 'continuous',
                                }}
                              />
                            );
                          })}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
          </>
        )}
      </ScrollView>
    </View>
  );
}
