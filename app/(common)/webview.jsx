import { useState, useCallback } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

export default function WebViewScreen() {
  const { url } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  const handleNavigationChange = useCallback((state) => {
    setCurrentUrl(state.url);
  }, []);

  // ✅ Deep link handler
  const handleShouldStartLoadWithRequest = useCallback((request) => {
    const requestUrl = request.url;

    console.log("WEBVIEW URL:", requestUrl);

    // Success Deep Link
    if (requestUrl.startsWith("yumi://success")) {
      Linking.openURL(requestUrl);
      return false;
    }

    // Failure Deep Link
    if (requestUrl.startsWith("yumi://failure")) {
      Linking.openURL(requestUrl);
      return false;
    }

    return true;
  }, []);

  if (!url) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500 text-base">
          No URL provided.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="border-b border-gray-200 bg-white"
      >
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-3"
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#111"
            />
          </TouchableOpacity>

          <Text
            className="flex-1 text-sm text-gray-500"
            numberOfLines={1}
          >
            {currentUrl}
          </Text>

          {isLoading && (
            <ActivityIndicator
              size="small"
              className="ml-2"
            />
          )}
        </View>
      </View>

      {hasError ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Ionicons
            name="wifi-outline"
            size={48}
            color="#9ca3af"
          />

          <Text className="text-gray-800 text-lg font-semibold">
            Failed to load page
          </Text>

          <Text className="text-gray-400 text-sm text-center">
            Check your connection and try again.
          </Text>

          <TouchableOpacity
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            className="mt-2 px-5 py-2 bg-black rounded-full"
          >
            <Text className="text-white text-sm font-medium">
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          source={{ uri: String(url) }}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onNavigationStateChange={handleNavigationChange}
          onShouldStartLoadWithRequest={
            handleShouldStartLoadWithRequest
          }
          startInLoadingState={false}
          javaScriptEnabled
          domStorageEnabled
          thirdPartyCookiesEnabled
          mixedContentMode="always"
          originWhitelist={["*"]}
          allowsInlineMediaPlayback
          setSupportMultipleWindows={false}
        />
      )}
    </View>
  );
}