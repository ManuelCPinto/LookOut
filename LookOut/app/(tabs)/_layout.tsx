import { Tabs } from "expo-router";
import {
  Entypo,
  MaterialIcons,
  AntDesign,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useColorScheme, Text, View } from "react-native";

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#333333",
        tabBarInactiveTintColor: "#A0A0A0",
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#FFFFFF",
          borderTopWidth: 0,
          height: 80,
          paddingTop: 8,
          elevation: 12,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: -4 },
          shadowRadius: 8,
        },
        tabBarIcon: ({ focused, color }) => {
          let icon;
          const iconColor = focused ? "#333333" : "#A0A0A0";

          if (route.name === "index") {
            icon = <Entypo name="home" size={24} color={iconColor} />;
          } else if (route.name === "devices/index") {
            icon = <MaterialIcons name="camera" size={24} color={iconColor} />;
          } else if (route.name === "profile/index") {
            icon = <AntDesign name="user" size={24} color={iconColor} />;
          } else if (route.name === "activity/index") {
            icon = <FontAwesome5 name="clipboard" size={24} color={iconColor} />;
          } else if (route.name === "settings/index") {
            icon = <Ionicons name="settings-sharp" size={24} color={iconColor} />;
          }

          return (
            <View style={{ alignItems: "center" }}>
              {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: -8,
                    height: 2,
                    width: 34,
                    borderRadius: 1,
                    backgroundColor: "#007AFF",
                  }}
                />
              )}
              {icon}
            </View>
          );
        },
        tabBarLabel: ({ focused }) => {
          let label = "";
          if (route.name === "index") label = "Home";
          else if (route.name === "devices/index") label = "Devices";
          else if (route.name === "profile/index") label = "Profile";
          else if (route.name === "activity/index") label = "Activity";
          else if (route.name === "settings/index") label = "Settings";

          return (
            <Text
              style={{
                fontSize: 13,
                color: focused ? "#333333" : "#A0A0A0",
                marginTop: 4,
              }}
            >
              {label}
            </Text>
          );
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="devices/index" options={{ title: "Devices" }} />
      <Tabs.Screen name="profile/index" options={{ title: "Profile" }} />
      <Tabs.Screen name="activity/index" options={{ title: "Activity" }} />
      <Tabs.Screen name="settings/index" options={{ title: "Settings" }} />
    </Tabs>
  );
}
