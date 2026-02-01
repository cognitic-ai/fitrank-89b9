import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import * as AC from '@bacons/apple-colors';
import { WorkoutEntry } from '@/types/workout';
import { storage } from '@/utils/storage';

export default function WorkoutsScreen() {
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = (id: string) => {
    Alert.alert('Delete Workout', 'Are you sure you want to delete this workout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await storage.deleteWorkout(id);
          loadWorkouts();
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: AC.systemBackground }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          gap: 12,
          paddingBottom: 100,
          ...(process.env.EXPO_OS === 'web' && { paddingTop: 80 })
        }}
      >
        {loading ? (
          <Text style={{ color: AC.secondaryLabel, textAlign: 'center', marginTop: 40 }}>
            Loading workouts...
          </Text>
        ) : workouts.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>💪</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: AC.label, marginBottom: 8 }}>
              No Workouts Yet
            </Text>
            <Text style={{ fontSize: 15, color: AC.secondaryLabel, textAlign: 'center', marginBottom: 24 }}>
              Start logging your workouts to track progress and earn ranks!
            </Text>
            <Link href="/add-workout" asChild>
              <Pressable
                style={({ pressed }) => ({
                  backgroundColor: AC.systemBlue,
                  paddingHorizontal: 32,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderCurve: 'continuous',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ fontSize: 17, fontWeight: '600', color: 'white' }}>
                  Log Your First Workout
                </Text>
              </Pressable>
            </Link>
          </View>
        ) : (
          workouts.map((workout) => (
            <Pressable
              key={workout.id}
              onLongPress={() => handleDelete(workout.id)}
              style={({ pressed }) => ({
                backgroundColor: AC.secondarySystemBackground,
                borderRadius: 12,
                padding: 16,
                borderCurve: 'continuous',
                opacity: pressed ? 0.7 : 1,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
              })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: AC.label }}>
                  {workout.exercise}
                </Text>
                <Text style={{ fontSize: 14, color: AC.secondaryLabel }}>
                  {formatDate(workout.date)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
                {workout.sets.map((set, index) => (
                  <View key={index} style={{ flexDirection: 'row', gap: 4 }}>
                    <Text style={{ fontSize: 14, color: AC.tertiaryLabel }}>Set {index + 1}:</Text>
                    <Text style={{ fontSize: 14, color: AC.label, fontVariant: ['tabular-nums'] }}>
                      {set.reps} reps × {set.weight} lbs
                    </Text>
                  </View>
                ))}
              </View>
              <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: AC.separator }}>
                <Text style={{ fontSize: 13, color: AC.secondaryLabel }}>
                  Total Volume: {workout.totalVolume.toLocaleString()} lbs
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <Link href="/add-workout" asChild>
        <Pressable
          style={({ pressed }) => ({
            position: 'absolute',
            bottom: process.env.EXPO_OS === 'ios' ? 90 : 32,
            right: 20,
            backgroundColor: AC.systemBlue,
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          })}
        >
          <Text style={{ fontSize: 36, color: 'white', lineHeight: 40, fontWeight: '300' }}>+</Text>
        </Pressable>
      </Link>
    </View>
  );
}
