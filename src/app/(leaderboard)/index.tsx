import { useState, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as AC from '@bacons/apple-colors';
import { storage } from '@/utils/storage';
import { getExerciseStats } from '@/utils/ranking';
import { ExerciseStats, Rank } from '@/types/workout';

const RANK_COLORS: Record<Rank, string> = {
  Gold: '#FFD700',
  Silver: '#C0C0C0',
  Bronze: '#CD7F32',
};

const RANK_EMOJI: Record<Rank, string> = {
  Gold: '🥇',
  Silver: '🥈',
  Bronze: '🥉',
};

export default function LeaderboardScreen() {
  const [stats, setStats] = useState<ExerciseStats[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    const workouts = await storage.getWorkouts();
    const exerciseStats = getExerciseStats(workouts);
    setStats(exerciseStats);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const getRankDescription = (rank: Rank) => {
    switch (rank) {
      case 'Gold':
        return '15K+ volume or 200+ lbs';
      case 'Silver':
        return '5K+ volume or 100+ lbs';
      case 'Bronze':
        return 'Getting started';
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
          ...(process.env.EXPO_OS === 'web' && { paddingTop: 80 })
        }}
      >
        {loading ? (
          <Text style={{ color: AC.secondaryLabel, textAlign: 'center', marginTop: 40 }}>
            Loading leaderboard...
          </Text>
        ) : stats.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>🏆</Text>
            <Text style={{ fontSize: 18, fontWeight: '600', color: AC.label, marginBottom: 8 }}>
              No Rankings Yet
            </Text>
            <Text style={{ fontSize: 15, color: AC.secondaryLabel, textAlign: 'center' }}>
              Complete workouts to see your exercise rankings!
            </Text>
          </View>
        ) : (
          <>
            {/* Summary Card */}
            <View
              style={{
                backgroundColor: AC.secondarySystemBackground,
                borderRadius: 12,
                padding: 16,
                borderCurve: 'continuous',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: AC.label, marginBottom: 12 }}>
                Your Stats
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: AC.label, fontVariant: ['tabular-nums'] }}>
                    {stats.filter(s => s.rank === 'Gold').length}
                  </Text>
                  <Text style={{ fontSize: 13, color: AC.secondaryLabel }}>🥇 Gold</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: AC.label, fontVariant: ['tabular-nums'] }}>
                    {stats.filter(s => s.rank === 'Silver').length}
                  </Text>
                  <Text style={{ fontSize: 13, color: AC.secondaryLabel }}>🥈 Silver</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: AC.label, fontVariant: ['tabular-nums'] }}>
                    {stats.filter(s => s.rank === 'Bronze').length}
                  </Text>
                  <Text style={{ fontSize: 13, color: AC.secondaryLabel }}>🥉 Bronze</Text>
                </View>
              </View>
            </View>

            {/* Exercise Rankings */}
            <Text style={{ fontSize: 20, fontWeight: '700', color: AC.label, marginTop: 8, marginBottom: 4 }}>
              Exercise Rankings
            </Text>

            {stats.map((exercise, index) => (
              <View
                key={exercise.exercise}
                style={{
                  backgroundColor: AC.secondarySystemBackground,
                  borderRadius: 12,
                  padding: 16,
                  borderCurve: 'continuous',
                  borderLeftWidth: 4,
                  borderLeftColor: RANK_COLORS[exercise.rank],
                }}
              >
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <Text style={{ fontSize: 24 }}>{RANK_EMOJI[exercise.rank]}</Text>
                    <Text style={{ fontSize: 17, fontWeight: '600', color: AC.label, flex: 1 }}>
                      {exercise.exercise}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: RANK_COLORS[exercise.rank] + '20',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                      borderCurve: 'continuous',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: RANK_COLORS[exercise.rank] }}>
                      {exercise.rank}
                    </Text>
                  </View>
                </View>

                {/* Stats */}
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, color: AC.secondaryLabel }}>Total Volume</Text>
                    <Text style={{ fontSize: 14, color: AC.label, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
                      {exercise.totalVolume.toLocaleString()} lbs
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, color: AC.secondaryLabel }}>Max Weight</Text>
                    <Text style={{ fontSize: 14, color: AC.label, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
                      {exercise.maxWeight} lbs
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 14, color: AC.secondaryLabel }}>Workouts</Text>
                    <Text style={{ fontSize: 14, color: AC.label, fontWeight: '600', fontVariant: ['tabular-nums'] }}>
                      {exercise.totalWorkouts}
                    </Text>
                  </View>
                </View>

                {/* Progress hint */}
                <View
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: AC.separator,
                  }}
                >
                  <Text style={{ fontSize: 12, color: AC.tertiaryLabel }}>
                    {getRankDescription(exercise.rank)}
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
