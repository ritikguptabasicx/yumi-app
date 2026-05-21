import { View, Text, Pressable } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
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
    : "No name provided";

  const schoolName = selectedChild?.school?.name || "No school assigned";
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
    <View
      style={{
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
          paddingVertical: 10,
          minHeight: 56,
        }}
      >
        {/* Back button */}
        {showBack ? (
          <Pressable
            onPress={handleBackNavigation}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed ? "#F1F5F9" : "transparent",
              marginRight: 4,
              flexShrink: 0,
            })}
          >
            <ArrowLeft size={20} color="#374151" strokeWidth={2} />
          </Pressable>
        ) : (
          <View style={{ width: 8 }} />
        )}

        {/* Content */}
        {isMealPlanner && selectedChild ? (
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 2,
                borderColor: "#E8F5F0",
              }}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage source={profilePicture} />
                <AvatarFallback
                  style={{
                    backgroundColor: "#E8F5F0",
                  }}
                >
                  <Text style={{ color: "#00A76F", fontWeight: "600", fontSize: 14 }}>
                    {childName.charAt(0).toUpperCase()}
                  </Text>
                </AvatarFallback>
              </Avatar>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#111827",
                  textTransform: "capitalize",
                  letterSpacing: -0.2,
                }}
                numberOfLines={1}
              >
                {childName}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  marginTop: 1,
                  letterSpacing: 0.1,
                }}
                numberOfLines={1}
              >
                {schoolName}
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "600",
                color: "#111827",
                letterSpacing: -0.3,
              }}
              numberOfLines={1}
            >
              {headerTitle}
            </Text>
          </View>
        )}

        <View style={{ width: 8 }} />
      </View>
    </View>
  );
};

export default ScreenHeader;
