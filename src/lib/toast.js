import Toast from "react-native-toast-message";

export const toast = {
  success: (message) =>
    Toast.show({ type: "success", text1: message, position: "top" }),
  error: (message) =>
    Toast.show({ type: "error", text1: message, position: "top" }),
  promise: async (promise, messages) => {
    Toast.show({ type: "info", text1: messages.loading, position: "top" });
    try {
      const result = await promise;
      Toast.show({ type: "success", text1: messages.success, position: "top" });
      return result;
    } catch {
      Toast.show({ type: "error", text1: messages.error, position: "top" });
      throw new Error(messages.error);
    }
  },
};

export default toast;
