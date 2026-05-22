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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  }}
>
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
      minHeight: 64,
    }}
  >
    {showBack && (
      <Pressable
        onPress={handleBackNavigation}
        hitSlop={{
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        }}
        style={({ pressed }) => ({
          width: 36,
          height: 36,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: pressed ? "#F8FAFC" : "#fff",
          borderWidth: 1,
          borderColor: "#EEF2F7",
        })}
      >
        <ArrowLeft
          size={19}
          color="#374151"
          strokeWidth={2.5}
        />
      </Pressable>
    )}

    {isMealPlanner && selectedChild ? (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          marginLeft: showBack ? 10 : 0,
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            overflow: "hidden",
            borderWidth: 2,
            borderColor: "#ECFDF5",
            backgroundColor: "#E8F5F0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {profilePicture ? (
            <Avatar className="h-full w-full">
              <AvatarImage source={{ uri: profilePicture }} />
            </Avatar>
          ) : (
            <Text
              style={{
                color: "#00A76F",
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              {childName?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          )}
        </View>

        <View
          style={{
            flex: 1,
            marginLeft: 12,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
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
              color: "#94A3B8",
              marginTop: 2,
              letterSpacing: 0.1,
            }}
            numberOfLines={1}
          >
            {schoolName}
          </Text>
        </View>
      </View>
    ) : (
      <View
        style={{
          flex: 1,
          marginLeft: showBack ? 10 : 0,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#111827",
            letterSpacing: -0.3,
          }}
          numberOfLines={1}
        >
          {headerTitle}
        </Text>
      </View>
    )}
  </View>
</View>
  );
};

export default ScreenHeader;
