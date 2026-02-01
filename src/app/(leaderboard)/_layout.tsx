import Stack from 'expo-router/stack';
import * as AC from '@bacons/apple-colors';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function LeaderboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: {
          backgroundColor: 'transparent',
        },
        headerTitleStyle: {
          color: AC.label as any,
        },
        headerBlurEffect: process.env.EXPO_OS === 'ios' ? 'systemChromeMaterial' : undefined,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Leaderboard',
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
}
