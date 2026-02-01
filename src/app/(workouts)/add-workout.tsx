import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as AC from '@bacons/apple-colors';
import { WorkoutEntry, WorkoutSet } from '@/types/workout';
import { storage } from '@/utils/storage';

const COMMON_EXERCISES = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Overhead Press',
  'Barbell Row',
  'Pull-ups',
  'Dumbbell Curl',
  'Tricep Dips',
  'Leg Press',
  'Lat Pulldown',
];

export default function AddWorkoutScreen() {
  const router = useRouter();
  const [exercise, setExercise] = useState('');
  const [sets, setSets] = useState<WorkoutSet[]>([{ reps: 0, weight: 0 }]);

  const addSet = () => {
    setSets([...sets, { reps: 0, weight: 0 }]);
  };

  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const updateSet = (index: number, field: 'reps' | 'weight', value: string) => {
    const newSets = [...sets];
    newSets[index][field] = parseInt(value) || 0;
    setSets(newSets);
  };

  const handleSave = async () => {
    if (!exercise.trim()) {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    const validSets = sets.filter((set) => set.reps > 0 && set.weight > 0);
    if (validSets.length === 0) {
      Alert.alert('Error', 'Please add at least one set with reps and weight');
      return;
    }

    const totalVolume = validSets.reduce((sum, set) => sum + set.reps * set.weight, 0);

    const workout: WorkoutEntry = {
      id: Date.now().toString(),
      exercise: exercise.trim(),
      sets: validSets,
      date: new Date().toISOString(),
      totalVolume,
    };

    try {
      await storage.saveWorkout(workout);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: AC.systemBackground }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          gap: 20,
          ...(process.env.EXPO_OS === 'web' && { paddingTop: 80 })
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Exercise Name */}
        <View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: AC.label, marginBottom: 8 }}>
            Exercise
          </Text>
          <TextInput
            style={{
              backgroundColor: AC.secondarySystemBackground,
              borderRadius: 10,
              padding: 12,
              fontSize: 16,
              color: AC.label,
              borderCurve: 'continuous',
            }}
            placeholder="Enter exercise name"
            placeholderTextColor={AC.placeholderText}
            value={exercise}
            onChangeText={setExercise}
            autoCapitalize="words"
          />

          {/* Quick Select Exercises */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 12 }}
          >
            {COMMON_EXERCISES.map((ex) => (
              <Pressable
                key={ex}
                onPress={() => setExercise(ex)}
                style={({ pressed }) => ({
                  backgroundColor: exercise === ex ? AC.systemBlue : AC.tertiarySystemBackground,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 16,
                  borderCurve: 'continuous',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: exercise === ex ? 'white' : AC.label,
                    fontWeight: exercise === ex ? '600' : '400',
                  }}
                >
                  {ex}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Sets */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: AC.label }}>Sets</Text>
            <Pressable
              onPress={addSet}
              style={({ pressed }) => ({
                backgroundColor: AC.systemGreen,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                borderCurve: 'continuous',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>+ Add Set</Text>
            </Pressable>
          </View>

          {sets.map((set, index) => (
            <View
              key={index}
              style={{
                backgroundColor: AC.secondarySystemBackground,
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
                borderCurve: 'continuous',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: AC.label }}>Set {index + 1}</Text>
                {sets.length > 1 && (
                  <Pressable
                    onPress={() => removeSet(index)}
                    style={({ pressed }) => ({
                      padding: 4,
                      opacity: pressed ? 0.5 : 1,
                    })}
                  >
                    <Text style={{ fontSize: 18, color: AC.systemRed }}>×</Text>
                  </Pressable>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: AC.secondaryLabel, marginBottom: 6 }}>Reps</Text>
                  <TextInput
                    style={{
                      backgroundColor: AC.tertiarySystemBackground,
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 16,
                      color: AC.label,
                      fontVariant: ['tabular-nums'],
                      borderCurve: 'continuous',
                    }}
                    placeholder="0"
                    placeholderTextColor={AC.placeholderText}
                    keyboardType="number-pad"
                    value={set.reps > 0 ? set.reps.toString() : ''}
                    onChangeText={(value) => updateSet(index, 'reps', value)}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: AC.secondaryLabel, marginBottom: 6 }}>Weight (lbs)</Text>
                  <TextInput
                    style={{
                      backgroundColor: AC.tertiarySystemBackground,
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 16,
                      color: AC.label,
                      fontVariant: ['tabular-nums'],
                      borderCurve: 'continuous',
                    }}
                    placeholder="0"
                    placeholderTextColor={AC.placeholderText}
                    keyboardType="number-pad"
                    value={set.weight > 0 ? set.weight.toString() : ''}
                    onChangeText={(value) => updateSet(index, 'weight', value)}
                  />
                </View>
              </View>

              {set.reps > 0 && set.weight > 0 && (
                <Text style={{ fontSize: 13, color: AC.tertiaryLabel, marginTop: 8, textAlign: 'right' }}>
                  Volume: {(set.reps * set.weight).toLocaleString()} lbs
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => ({
            backgroundColor: AC.systemBlue,
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            borderCurve: 'continuous',
            opacity: pressed ? 0.8 : 1,
            marginBottom: 40,
          })}
        >
          <Text style={{ fontSize: 17, fontWeight: '600', color: 'white' }}>Save Workout</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
