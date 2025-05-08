// app/loading.tsx
import React, { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { auth } from "../lib/firebase";
import { styled } from "nativewind";

const AnimatedImage = styled(Animated.Image);
const AnimatedText  = styled(Animated.Text);

export default function LoadingScreen() {
  const router = useRouter();
  const logoScale      = useSharedValue(1);
  const titleOpacity   = useSharedValue(0);
  const titleTranslate = useSharedValue(10);

  const animateLogo = () => {
    logoScale.value = withSequence(
      withTiming(1.15, { duration: 900 }),
      withTiming(1,    { duration: 900 })
    );
  };

  const animateTitle = () => {
    titleOpacity.value   = withDelay(2000, withTiming(1, { duration: 800 }));
    titleTranslate.value = withDelay(2000, withTiming(0, { duration: 800 }));
  };

  useEffect(() => {
    animateLogo();
    animateTitle();

    const timeout = setTimeout(() => {
      runOnJS(finishIntro)();
    }, 4000);
    return () => clearTimeout(timeout);
  }, []);

  function finishIntro() {
    const user = auth.currentUser;
    console.log(user)
    if (user && user.emailVerified) {
      router.replace("/(tabs)/home");
    } else {
      router.replace("/(auth)/login");
    }
  }

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity:     titleOpacity.value,
    transform:   [{ translateY: titleTranslate.value }],
  }));

  return (
    <View className="flex-1 bg-white justify-center items-center">
      <AnimatedImage
        source={require("../assets/logo.png")}
        className="w-44 h-44 mb-6"
        style={logoStyle}
        resizeMode="contain"
      />
      <AnimatedText className="text-5xl font-bold text-black" style={titleStyle}>
        LookOut
      </AnimatedText>
    </View>
  );
}
