import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { getStoredUser, setStoredUser, clearStoredUser } from "@/lib/storage";

const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getStoredUser().then((stored) => {
      setUserState(stored);
      setIsReady(true);
    });
  }, []);

  const isTokenExpired = (token) => {
    try {
      if (!token) return true;
      const payload = jwtDecode(token);
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const handleLogout = useCallback(async () => {
    setUserState(null);
    await clearStoredUser();
    router.replace("/(auth)/signin");
  }, [router]);

  const setUser = useCallback(async (newUser) => {
    setUserState(newUser);
    await setStoredUser(newUser);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (user) {
      if (isTokenExpired(user.token)) {
        handleLogout();
      } else {
        setStoredUser(user);
      }
    } else {
      clearStoredUser();
    }
  }, [user, isReady, handleLogout]);

  const value = {
    user,
    setUser,
    isAuthenticated: !!user && !isTokenExpired(user?.token),
    isReady,
    logout: handleLogout,
  };

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
