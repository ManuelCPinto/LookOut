// app/loading.tsx
import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";

export default function LoadingScreen() {
  const router = useRouter();

  const logoScale = useSharedValue(1);
  const titleOpacity = useSharedValue(0);
  const titleTranslate = useSharedValue(10);

  const animateLogo = () => {
    logoScale.value = withSequence(
      withTiming(1.15, { duration: 900 }),
      withTiming(1, { duration: 900 })
    );
  };

  const animateTitle = () => {
    titleOpacity.value = withDelay(2000, withTiming(1, { duration: 800 }));
    titleTranslate.value = withDelay(2000, withTiming(0, { duration: 800 }));
  };

  useEffect(() => {
    animateLogo();
    animateTitle();
    setTimeout(() => runOnJS(() => router.replace("/(tabs)"))(), 4000);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslate.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/logo.png")}
        style={[styles.logo, logoStyle]}
        resizeMode="contain"
      />
      <Animated.Text style={[styles.title, titleStyle]}>LookOut</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  title: {
    fontSize: 44,
    fontWeight: "bold",
    color: "#000",
  },
});