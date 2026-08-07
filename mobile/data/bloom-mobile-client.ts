import { BloomDashboardData, DashboardMode, HabitCard } from "../navigation/logic";
import { getMobileAuthToken } from "../auth/mobile-auth";

type ApiHabit = {
  id: string;
  titre: string;
  type: DashboardMode;
  cadence: string;
  date_creation: string;
  streak: number;
  today_checked: boolean;
};

type ApiDashboardResponse = {
  activeStreak: number;
  sobrietyDays: number;
  shieldActive: boolean;
  missedDays: number;
  currency: {
    petales: number;
    crystalPetales: number;
  };
  heatmapValues: number[];
  habits: ApiHabit[];
};

function mapHabit(api: ApiHabit): HabitCard {
  return {
    id: api.id,
    title: api.titre,
    mode: api.type,
    streak: api.streak,
    todayChecked: api.today_checked,
  };
}

export async function fetchBloomDashboardData(
  profileId = "local-user"
): Promise<BloomDashboardData> {
  const authToken = await getMobileAuthToken();
  if (!authToken) {
    throw new Error("Missing auth token for /dashboard");
  }

  const baseUrl = process.env.EXPO_PUBLIC_BLOOM_API_URL ?? "http://localhost:8010";
  const response = await fetch(`${baseUrl}/dashboard?profile_id=${encodeURIComponent(profileId)}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Dashboard request failed: ${response.status}`);
  }

  const body = (await response.json()) as ApiDashboardResponse;

  return {
    activeStreak: body.activeStreak,
    sobrietyDays: body.sobrietyDays,
    currency: body.currency,
    habits: body.habits.map(mapHabit),
    heatmapValues: body.heatmapValues,
    shieldActive: body.shieldActive,
    missedDays: body.missedDays,
  };
}
