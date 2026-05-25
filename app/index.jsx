import { Redirect } from "expo-router";
import { useUser } from "@/contexts/UserContext";
import Loader from "@/components/Loader";

export default function Index() {
  const { user, isAuthenticated, isReady } = useUser();

  if (!isReady) {
    return <Loader />;
  }

  if (isAuthenticated && user?.isTeacher) {
    return <Redirect href="/(app)/teacher" />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/signin" />;
}
