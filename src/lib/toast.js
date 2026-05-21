import Toast from "react-native-toast-message";
import { Platform } from "react-native";

export const toast = {
  success: (message) =>
    Toast.show({
      type: "success",
      text1: message,
      position: "bottom",
      autoHide: true,
      visibilityTime: 2500,
      bottomOffset: Platform.OS === "ios" ? 55 : 40,
    }),
  error: (message) =>
    Toast.show({
      type: "error",
      text1: message,
      position: "bottom",
      autoHide: true,
      visibilityTime: 3000, // Error toasts can stay slightly longer
      bottomOffset: Platform.OS === "ios" ? 55 : 40,
    }),
  promise: async (promise, messages) => {
    Toast.show({
      type: "info",
      text1: messages.loading,
      position: "bottom",
      autoHide: false,
      bottomOffset: Platform.OS === "ios" ? 55 : 40,
    });
    try {
      const result = await promise;
      Toast.show({
        type: "success",
        text1: messages.success,
        position: "bottom",
        autoHide: true,
        visibilityTime: 2500,
        bottomOffset: Platform.OS === "ios" ? 55 : 40,
      });
      return result;
    } catch {
      Toast.show({
        type: "error",
        text1: messages.error,
        position: "bottom",
        autoHide: true,
        visibilityTime: 3000,
        bottomOffset: Platform.OS === "ios" ? 55 : 40,
      });
      throw new Error(messages.error);
    }
  },
};

export default toast;

