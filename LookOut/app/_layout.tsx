import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <>
      <Stack
        initialRouteName="loading"
        screenOptions={{ headerShown: false }}
      />
    </>
  );
}
