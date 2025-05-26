import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

import React from "react";
import { Stack } from "expo-router";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <View className="flex-1 font-serif">
        <Stack
          initialRouteName="loading"
          screenOptions={{ headerShown: false }}
        />
      </View>
  );
}
