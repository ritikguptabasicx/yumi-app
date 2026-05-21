import * as SecureStore from "expo-secure-store";

const USER_KEY = "user";

export async function getStoredUser() {
  try {
    const data = await SecureStore.getItemAsync(USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setStoredUser(user) {
  if (user) {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  } else {
    await SecureStore.deleteItemAsync(USER_KEY);
  }
}

export async function clearStoredUser() {
  await SecureStore.deleteItemAsync(USER_KEY);
}
