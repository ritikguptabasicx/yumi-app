// app/(common)/webview.tsx

import { View, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function WebviewScreen() {
  const { url } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);

  return (
    <View className="flex-1 bg-white">
      {loading && (
        <View className="absolute inset-0 items-center justify-center z-10">
          <ActivityIndicator size="large" />
        </View>
      )}

      <WebView
        source={{ uri: String(url) }}
        onLoadEnd={() => setLoading(false)}
        startInLoadingState
      />
    </View>
  );
}