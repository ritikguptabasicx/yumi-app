import { useState, useCallback } from "react";
import { View, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Linking from "expo-linking";

const getPaymentResultFromUrl = (url = "") => {
  const parsed = Linking.parse(url);
  const queryParams = parsed.queryParams || {};
  let urlObject;

  try {
    urlObject = new URL(url);
  } catch {
    urlObject = null;
  }

  const target = [
    parsed.hostname,
    parsed.path,
    urlObject?.hostname,
    urlObject?.pathname,
  ]
    .filter(Boolean)
    .join("/")
    .toLowerCase();

  const isFailure = target.includes("failure") || target.includes("failed");
  const isSuccess = target.includes("success") && !isFailure;

  return {
    isPaymentResult: isSuccess || isFailure,
    isSuccess,
    queryParams,
  };
};

const buildPaymentRoute = ({ isSuccess, queryParams = {} }) => ({
  pathname: isSuccess ? "/(auth)/success" : "/(auth)/failure",
  params: {
    invoiceId:
      queryParams.invoice_id ||
      queryParams.invoiceId ||
      queryParams.orderId ||
      "",
    invoice_id:
      queryParams.invoice_id ||
      queryParams.invoiceId ||
      queryParams.orderId ||
      "",
    orderId: queryParams.orderId || queryParams.invoice_id || "",
    message: queryParams.message || (isSuccess ? "Approved" : "Declined"),
    amount: queryParams.amount || "",
    curr: queryParams.curr || "RON",
    timestamp: queryParams.timestamp || "",
    ep_id: queryParams.ep_id || "",
  },
});

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

  const handleNavigationChange = useCallback(
    (state) => {
      setCurrentUrl(state.url);

      const result = getPaymentResultFromUrl(state.url);

      if (result.isPaymentResult) {
        router.replace(buildPaymentRoute(result));
      }
    },
    [router]
  );

  // Handle postMessage from backend HTML (ReactNativeWebView.postMessage)
  const handleMessage = useCallback(
    (event) => {
      try {
        const payload = JSON.parse(event.nativeEvent.data);
        const result = getPaymentResultFromUrl(payload.url || "");
        const isSuccess = payload.status
          ? payload.status === "success"
          : result.isSuccess;

        router.replace(
          buildPaymentRoute({
            ...result,
            isSuccess,
          })
        );
      } catch (err) {
        console.error("onMessage parse error:", err);
      }
    },
    [router]
  );

  // Fallback: intercept yumi:// deep links when postMessage doesn't fire
  const handleShouldStartLoadWithRequest = useCallback(
    (request) => {
      const requestUrl = request.url;

      if (requestUrl.startsWith("yumi://")) {
        try {
          const result = getPaymentResultFromUrl(requestUrl);

          router.replace(buildPaymentRoute(result));
        } catch (err) {
          console.error("Deep link parse error:", err);
        }

        return false; // Stop WebView from trying to open yumi:// natively
      }

      return true;
    },
    [router]
  );

  if (!url) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-base text-red-500">No URL provided.</Text>
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
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text className="flex-1 text-sm text-gray-500" numberOfLines={1}>
            {currentUrl}
          </Text>
          {isLoading && <ActivityIndicator size="small" className="ml-2" />}
        </View>
      </View>

      {/* Error State */}
      {hasError ? (
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Ionicons name="wifi-outline" size={48} color="#9ca3af" />
          <Text className="text-lg font-semibold text-gray-800">
            Failed to load page
          </Text>
          <Text className="text-center text-sm text-gray-400">
            Check your connection and try again.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
            }}
            className="mt-2 rounded-full bg-black px-5 py-2"
          >
            <Text className="text-sm font-medium text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          source={{ uri: String(url) }}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          onNavigationStateChange={handleNavigationChange}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
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
