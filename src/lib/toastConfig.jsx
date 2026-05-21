import React from "react";
import { View, Text } from "react-native";
import { CheckCircle2, XCircle, Info } from "lucide-react-native";

export const toastConfig = {
  success: ({ text1 }) => (
    <View 
      className="flex-row items-center bg-white border border-[#E2F5F0] rounded-full px-4 py-2.5 self-center shadow-lg"
      style={{
        elevation: 8,
        shadowColor: "#019C7F",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        maxWidth: "85%",
      }}
    >
      <View className="w-6 h-6 rounded-full bg-[#E6F5F1] items-center justify-center mr-2.5">
        <CheckCircle2 size={14} color="#017A63" strokeWidth={3} />
      </View>
      <Text className="text-[#0C0C20] font-semibold text-[13px] tracking-wide flex-shrink">
        {text1}
      </Text>
    </View>
  ),

  error: ({ text1 }) => (
    <View 
      className="flex-row items-center bg-white border border-[#FEE2E2] rounded-full px-4 py-2.5 self-center shadow-lg"
      style={{
        elevation: 8,
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        maxWidth: "85%",
      }}
    >
      <View className="w-6 h-6 rounded-full bg-rose-50 items-center justify-center mr-2.5">
        <XCircle size={14} color="#EF4444" strokeWidth={3} />
      </View>
      <Text className="text-[#0C0C20] font-semibold text-[13px] tracking-wide flex-shrink">
        {text1}
      </Text>
    </View>
  ),

  info: ({ text1 }) => (
    <View 
      className="flex-row items-center bg-white border border-[#EFF6FF] rounded-full px-4 py-2.5 self-center shadow-lg"
      style={{
        elevation: 8,
        shadowColor: "#3B82F6",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        maxWidth: "85%",
      }}
    >
      <View className="w-6 h-6 rounded-full bg-blue-50 items-center justify-center mr-2.5">
        <Info size={14} color="#3B82F6" strokeWidth={3} />
      </View>
      <Text className="text-[#0C0C20] font-semibold text-[13px] tracking-wide flex-shrink">
        {text1}
      </Text>
    </View>
  ),
};


