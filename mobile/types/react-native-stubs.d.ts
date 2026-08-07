declare module "react-native" {
  export const View: any;
  export const Text: any;
  export const Pressable: any;
  export const SafeAreaView: any;
  export const FlatList: any;
  export const StyleSheet: any;
  export const TextInput: any;
  export const ActivityIndicator: any;
  export const useColorScheme: any;
  export const useWindowDimensions: any;
  export type NativeScrollEvent = any;
  export type NativeSyntheticEvent<T> = any;
  export type ListRenderItemInfo<T> = { item: T };
}

declare module "@react-native-async-storage/async-storage" {
  const AsyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  };
  export default AsyncStorage;
}

declare module "expo-notifications" {
  export const SchedulableTriggerInputTypes: {
    DAILY: string;
  };
  export function setNotificationHandler(handler: any): void;
  export function dismissNotificationAsync(identifier: string): Promise<void>;
  export function scheduleNotificationAsync(input: any): Promise<string>;
  export function cancelScheduledNotificationAsync(identifier: string): Promise<void>;
}

declare module "expo-sqlite" {
  export type SQLiteBindParams = ReadonlyArray<unknown>;

  export interface SQLiteDatabase {
    execAsync(sql: string): Promise<void>;
    runAsync(sql: string, params?: SQLiteBindParams): Promise<void>;
    getFirstAsync<T = unknown>(sql: string, params?: SQLiteBindParams): Promise<T | null>;
    getAllAsync<T = unknown>(sql: string, params?: SQLiteBindParams): Promise<T[]>;
  }

  export function openDatabaseAsync(name: string): Promise<SQLiteDatabase>;
}

declare module "@react-navigation/native" {
  export const NavigationContainer: any;
}

declare module "@react-navigation/native-stack" {
  export function createNativeStackNavigator<T>(): any;
}

declare module "@react-navigation/bottom-tabs" {
  export function createBottomTabNavigator<T>(): any;
}

declare module "expo-web-browser" {
  export function maybeCompleteAuthSession(): void;
}

declare module "expo-auth-session/providers/google" {
  export type GoogleAuthRequestConfig = {
    androidClientId?: string;
    iosClientId?: string;
    webClientId?: string;
  };

  export type GoogleAuthResponse = {
    type: string;
    authentication?: {
      idToken?: string;
    };
  };

  export function useAuthRequest(
    config: GoogleAuthRequestConfig
  ): [unknown, GoogleAuthResponse | null, () => Promise<GoogleAuthResponse>];
}
