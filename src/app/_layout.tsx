import { ThemeProvider } from "@/components/theme-provider";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs as WebTabs } from "expo-router/tabs";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform, useWindowDimensions } from "react-native";

export default function Layout() {
  return (
    <ThemeProvider>
      <TabsLayout />
    </ThemeProvider>
  );
}

function TabsLayout() {
  if (process.env.EXPO_OS === "web") {
    return <WebTabsLayout />;
  } else {
    return <NativeTabsLayout />;
  }
}

function WebTabsLayout() {
  const { width } = useWindowDimensions();
  const isMd = width >= 768;
  const isLg = width >= 1024;

  return (
    <WebTabs
      screenOptions={{
        headerShown: false,
        ...(isMd
          ? {
              tabBarPosition: "left",
              tabBarVariant: "material",
              tabBarLabelPosition: isLg ? undefined : "below-icon",
            }
          : {
              tabBarPosition: "bottom",
            }),
      }}
    >
      <WebTabs.Screen
        name="(workouts)"
        options={{
          title: "Workouts",
          tabBarIcon: (props) => <MaterialIcons {...props} name="fitness-center" />,
        }}
      />
      <WebTabs.Screen
        name="(leaderboard)"
        options={{
          title: "Leaderboard",
          tabBarIcon: (props) => <MaterialIcons {...props} name="leaderboard" />,
        }}
      />
      <WebTabs.Screen
        name="(progress)"
        options={{
          title: "Progress",
          tabBarIcon: (props) => <MaterialIcons {...props} name="show-chart" />,
        }}
      />
    </WebTabs>
  );
}

function NativeTabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(workouts)">
        <NativeTabs.Trigger.Label>Workouts</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          {...Platform.select({
            ios: { sf: { default: "figure.strengthtraining.traditional", selected: "figure.strengthtraining.traditional" } },
            default: {
              src: <NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="fitness-center" />,
            },
          })}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(leaderboard)">
        <NativeTabs.Trigger.Label>Leaderboard</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          {...Platform.select({
            ios: { sf: { default: "trophy", selected: "trophy.fill" } },
            default: {
              src: <NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="leaderboard" />,
            },
          })}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(progress)">
        <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          {...Platform.select({
            ios: { sf: { default: "chart.bar", selected: "chart.bar.fill" } },
            default: {
              src: <NativeTabs.Trigger.VectorIcon family={MaterialIcons} name="show-chart" />,
            },
          })}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
