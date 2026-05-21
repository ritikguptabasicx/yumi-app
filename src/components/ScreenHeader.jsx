import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { useChildren } from "@/hooks/useChildren";
import { useMemo } from "react";

const ScreenHeader = ({ showBackButton, title }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isTabScreen =
    pathname.includes("/(tabs)") ||
    pathname.endsWith("/meal-planner") ||
    pathname.endsWith("/order-history") ||
    pathname.endsWith("/profile") ||
    pathname === "/(app)" ||
    pathname.endsWith("/(app)");
  const isHomePage =
    pathname === "/" ||
    pathname.endsWith("/(app)/(tabs)") ||
    pathname.endsWith("/(app)/(tabs)/") ||
    /\/\(tabs\)\/?$/.test(pathname);
  const isMealPlanner = pathname.includes("meal-planner");
  const isOrderSummary = pathname.includes("order-summary");
  const { user } = useUser();
  const { children } = useChildren();

  const selectedChild = useMemo(() => {
    if (!user?.selectedChildId) return null;
    return children.find((c) => c.id === user.selectedChildId) || null;
  }, [user?.selectedChildId, children]);

  const childName = selectedChild
    ? `${selectedChild.firstName} ${selectedChild.lastName}`
    : "No name Provided";

  const schoolName = selectedChild?.school?.name || "No school Assigned";
  const profilePicture = selectedChild?.profilePictureURL;
  const headerTitle = isMealPlanner && !selectedChild ? "Meal Planner" : title;

  const showBack = showBackButton ?? !isTabScreen;

  const handleBackNavigation = () => {
    if (isOrderSummary) {
      router.push("/(app)/(tabs)/meal-planner");
    } else {
      router.back();
    }
  };

  if (isHomePage) return null;

  return (
    <View className="bg-headerBg">
      {!isMealPlanner && (
        <View className="flex-row items-center bg-white p-2 shadow-sm">
          {showBack && (
            <Button variant="ghost" size="icon" onPress={handleBackNavigation} className="mr-2">
              <ArrowLeft size={24} color="#0F172A" />
            </Button>
          )}
          <Text className="text-lg font-semibold text-gray-900">{headerTitle}</Text>
        </View>
      )}

      {isMealPlanner && selectedChild && (
        <View className="flex-row items-center bg-white px-2 py-3 shadow-sm">
          {showBack && (
            <Button variant="ghost" size="icon" onPress={handleBackNavigation} className="mr-2">
              <ArrowLeft size={24} color="#0F172A" />
            </Button>
          )}
          <Avatar className="h-9 w-9 rounded-full">
            <AvatarImage source={profilePicture} />
            <AvatarFallback>{childName.charAt(0)}</AvatarFallback>
          </Avatar>
          <View className="ml-3">
            <Text className="font-semibold capitalize text-gray-900">{childName}</Text>
            <Text className="text-sm text-gray-500">{schoolName}</Text>
          </View>
        </View>
      )}

      {isMealPlanner && !selectedChild && (
        <View className="flex-row items-center bg-white p-3 shadow-sm">
          <Text className="text-lg font-semibold text-gray-900">{headerTitle}</Text>
        </View>
      )}
    </View>
  );
};

export default ScreenHeader;
