import React, { useEffect, useMemo, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import { BloomMobileNavigation } from "../navigation/BloomMobileNavigation";
import { getMobileAuthToken, setMobileAuthToken } from "../auth/mobile-auth";
import {
  clearAuthSession,
  loginWithEmail,
  loginWithGoogleIdToken,
  MobileAuthSession,
  readPersistedProfileId,
  registerWithEmail,
} from "../data/auth-client";

WebBrowser.maybeCompleteAuthSession();

type RootStackParamList = {
  MainTabs: undefined;
};

type MainTabParamList = {
  Dashboard: undefined;
  Habits: undefined;
  Profile: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function HabitsScreen(): React.JSX.Element {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Habits</Text>
    </View>
  );
}

type ProfileScreenProps = {
  email: string;
  onLogout: () => Promise<void>;
};

function ProfileScreen(props: ProfileScreenProps): React.JSX.Element {
  const { email, onLogout } = props;
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await onLogout();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.centeredScreen}>
      <Text style={styles.profileTitle}>Profile</Text>
      <Text style={styles.profileEmail}>{email}</Text>
      <Pressable onPress={handleLogout} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>{loading ? "Déconnexion..." : "Se déconnecter"}</Text>
      </Pressable>
    </View>
  );
}

type MainTabsProps = {
  session: MobileAuthSession;
  onLogout: () => Promise<void>;
};

function MainTabs(props: MainTabsProps): React.JSX.Element {
  const { session, onLogout } = props;

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard">
        {() => (
          <BloomMobileNavigation profileId={session.profileId} authToken={session.accessToken} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Profile">
        {() => <ProfileScreen email={session.email} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

type AuthScreenProps = {
  onAuthenticated: (session: MobileAuthSession) => Promise<void>;
};

function AuthScreen(props: AuthScreenProps): React.JSX.Element {
  const { onAuthenticated } = props;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    void (async () => {
      if (response?.type !== "success") return;
      const idToken = response.authentication?.idToken;
      if (!idToken) {
        setErrorText("Token Google manquant.");
        return;
      }

      try {
        setBusy(true);
        setErrorText(null);
        const session = await loginWithGoogleIdToken(idToken);
        await onAuthenticated(session);
      } catch (error) {
        setErrorText(error instanceof Error ? error.message : "Google login failed");
      } finally {
        setBusy(false);
      }
    })();
  }, [onAuthenticated, response]);

  const submitLabel = useMemo(() => {
    if (busy) return mode === "login" ? "Connexion..." : "Création...";
    return mode === "login" ? "Se connecter" : "Créer un compte";
  }, [busy, mode]);

  const handleSubmit = async () => {
    try {
      setBusy(true);
      setErrorText(null);

      const session =
        mode === "login"
          ? await loginWithEmail({ email: email.trim(), password })
          : await registerWithEmail({ email: email.trim(), password, displayName: displayName.trim() });

      await onAuthenticated(session);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authCard}>
        <Text style={styles.authTitle}>{mode === "login" ? "Connexion Bloom" : "Créer un compte Bloom"}</Text>
        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Nom affiché (optionnel)"
          editable={!busy && mode === "register"}
          style={[styles.input, mode === "login" ? styles.hiddenInput : null]}
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!busy}
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Mot de passe"
          secureTextEntry
          editable={!busy}
          style={styles.input}
        />

        {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

        <Pressable onPress={handleSubmit} style={styles.primaryButton} disabled={busy}>
          <Text style={styles.primaryButtonText}>{submitLabel}</Text>
        </Pressable>

        <Pressable
          onPress={() => setMode((current) => (current === "login" ? "register" : "login"))}
          style={styles.linkButton}
          disabled={busy}
        >
          <Text style={styles.linkText}>
            {mode === "login" ? "Pas de compte ? Créer un compte" : "Déjà inscrit ? Se connecter"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => promptAsync()}
          disabled={busy || !request}
          style={[styles.secondaryButton, busy || !request ? styles.disabledButton : null]}
        >
          <Text style={styles.secondaryButtonText}>Continuer avec Google</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export function BloomMobileAppEntry(): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<MobileAuthSession | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const profileId = await readPersistedProfileId();
        const token = await getMobileAuthToken();
        if (mounted && token && profileId) {
          setSession({
            accessToken: token,
            profileId,
            email: "",
            displayName: null,
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleAuthenticated = async (nextSession: MobileAuthSession) => {
    await setMobileAuthToken(nextSession.accessToken);
    setSession(nextSession);
  };

  const handleLogout = async () => {
    await clearAuthSession();
    setSession(null);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingWrap}>
        <ActivityIndicator size="large" color="#1E6F5C" />
      </SafeAreaView>
    );
  }

  if (!session) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs">
          {() => <MainTabs session={session} onLogout={handleLogout} />}
        </RootStack.Screen>
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  centeredScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  authContainer: {
    flex: 1,
    backgroundColor: "#F6F3EA",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  authCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderColor: "#E0D7C6",
    borderWidth: 1,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2A1F",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CFD8CC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },
  hiddenInput: {
    display: "none",
  },
  errorText: {
    color: "#A12626",
    marginBottom: 10,
  },
  primaryButton: {
    marginTop: 4,
    backgroundColor: "#1E6F5C",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: "#E6F2EE",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: "#104B3F",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  linkButton: {
    marginTop: 10,
    alignItems: "center",
  },
  linkText: {
    color: "#1E6F5C",
    fontWeight: "600",
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F3EA",
  },
  profileTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2A1F",
    marginBottom: 8,
  },
  profileEmail: {
    color: "#4E5D4E",
    marginBottom: 14,
  },
});
