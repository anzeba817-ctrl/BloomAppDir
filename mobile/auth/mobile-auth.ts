import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "bloom-mobile-auth-token";

export async function setMobileAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function getMobileAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

export async function clearMobileAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}
