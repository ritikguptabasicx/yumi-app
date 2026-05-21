import { Stack } from "expo-router";
import { Redirect } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import Loader from "@/components/Loader";

export default function AppLayout() {
  const { isAuthenticated, isReady } = useUser();

  if (!isReady) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/signin" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="about" />
      <Stack.Screen name="faq" />
      <Stack.Screen name="support" />
      <Stack.Screen name="add-child" />
      <Stack.Screen name="edit-child" />
      <Stack.Screen name="order-summary" />
      <Stack.Screen name="active-order" />
    </Stack>
  );
}
