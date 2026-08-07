const AUTH_PROFILE_ID_KEY = "bloom-mobile-auth-profile-id";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearMobileAuthToken, setMobileAuthToken } from "../auth/mobile-auth";

export type MobileAuthSession = {
  accessToken: string;
  profileId: string;
  email: string;
  displayName?: string | null;
};

type AuthApiResponse = {
  access_token: string;
  token_type: "bearer";
  profile_id: string;
  email: string;
  display_name?: string | null;
};

const baseUrl = process.env.EXPO_PUBLIC_BLOOM_API_URL ?? "http://localhost:8010";

function toSession(body: AuthApiResponse): MobileAuthSession {
  return {
    accessToken: body.access_token,
    profileId: body.profile_id,
    email: body.email,
    displayName: body.display_name ?? null,
  };
}

async function persistSession(session: MobileAuthSession): Promise<void> {
  await Promise.all([
    setMobileAuthToken(session.accessToken),
    AsyncStorage.setItem(AUTH_PROFILE_ID_KEY, session.profileId),
  ]);
}

export async function readPersistedProfileId(): Promise<string | null> {
  return AsyncStorage.getItem(AUTH_PROFILE_ID_KEY);
}

export async function clearAuthSession(): Promise<void> {
  await Promise.all([clearMobileAuthToken(), AsyncStorage.removeItem(AUTH_PROFILE_ID_KEY)]);
}

export async function registerWithEmail(params: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<MobileAuthSession> {
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: params.email,
      password: params.password,
      display_name: params.displayName?.trim() || undefined,
    }),
  });

  if (!response.ok) {
    throw new Error(`Register failed: ${response.status}`);
  }

  const body = (await response.json()) as AuthApiResponse;
  const session = toSession(body);
  await persistSession(session);
  return session;
}

export async function loginWithEmail(params: {
  email: string;
  password: string;
}): Promise<MobileAuthSession> {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: params.email,
      password: params.password,
    }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const body = (await response.json()) as AuthApiResponse;
  const session = toSession(body);
  await persistSession(session);
  return session;
}

export async function loginWithGoogleIdToken(idToken: string): Promise<MobileAuthSession> {
  const response = await fetch(`${baseUrl}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id_token: idToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google login failed: ${response.status}`);
  }

  const body = (await response.json()) as AuthApiResponse;
  const session = toSession(body);
  await persistSession(session);
  return session;
}
