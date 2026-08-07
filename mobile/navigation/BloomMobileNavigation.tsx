import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { SunnyMascot } from "../components/SunnyMascot";
import { getMobileAuthToken, setMobileAuthToken } from "../auth/mobile-auth";
import { fetchBloomDashboardData } from "../data/bloom-mobile-client";
import {
  getShieldStatus,
  initMobileOfflineStore,
  queueMobileCheckIn,
  readWalletState,
  trySyncMobileQueue,
} from "../data/mobile-offline-sqlite";
import {
  configureSmartNotificationFilter,
  scheduleMorningAndEveningHabitReminders,
} from "../system/notifications-smart-filter";
import { AdBannerSlot, useInterstitialAdGate } from "../system/ads-hooks";
import { BloomPlan, shouldRenderInterstitial } from "../system/paywall-ads-policy";
import {
  AppearanceMode,
  BloomDashboardData,
  buildPalette,
  DashboardMode,
  determineSunnyState,
  getModeFromOffset,
  isMilestone,
  Language,
  ONBOARDING_TEXT,
  PREF_KEYS,
  resolvePersistedPreferences,
  resolveSunnyIteration,
  STRINGS,
} from "./logic";

type DashboardPage = {
  id: DashboardMode;
};

const PAGES: DashboardPage[] = [{ id: "build" }, { id: "quit" }];

type BloomMobileNavigationProps = {
  profileId?: string;
  authToken?: string;
  renderBannerAd?: () => React.ReactNode;
  showInterstitialAd?: () => Promise<void> | void;
};

type OnboardingScreenProps = {
  title: string;
  buttonText: string;
  backgroundColor: string;
  textColor: string;
  accent: string;
  onContinue: () => void;
};

function OnboardingScreen(props: OnboardingScreenProps): React.JSX.Element {
  const { title, buttonText, backgroundColor, textColor, accent, onContinue } = props;
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.onboardingWrap}>
        <Text style={[styles.onboardingTitle, { color: textColor }]}>{title}</Text>
        <View style={styles.onboardingSunnyWrap}>
          <SunnyMascot state="neutral" iteration={resolveSunnyIteration("onboarding")} size={120} />
        </View>
        <Text style={[styles.onboardingText, { color: textColor }]}>{ONBOARDING_TEXT}</Text>
        <Pressable onPress={onContinue} style={[styles.primaryButton, { backgroundColor: accent }]}>
          <Text style={styles.primaryButtonLabel}>{buttonText}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function useBloomMobileData(profileId: string, authToken: string | null) {
  const [data, setData] = useState<BloomDashboardData | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        if (!authToken) {
          setData(null);
          return;
        }
        const liveData = await fetchBloomDashboardData(profileId);
        if (mounted) setData(liveData);
      } catch {
        if (!mounted) return;
        setData({
          activeStreak: 0,
          sobrietyDays: 0,
          shieldActive: false,
          missedDays: 0,
          currency: { petales: 0, crystalPetales: 0 },
          heatmapValues: Array.from({ length: 35 }, () => 0),
          habits: [],
        });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authToken, profileId]);

  return data;
}

export function BloomMobileNavigation(props: BloomMobileNavigationProps): React.JSX.Element {
  const { profileId = "local-user", authToken: authTokenProp, renderBannerAd, showInterstitialAd } = props;
  const systemScheme = useColorScheme() === "dark" ? "dark" : "light";
  const { width } = useWindowDimensions();
  const listRef = useRef<any>(null);

  const [language, setLanguage] = useState<Language>("fr");
  const [appearance, setAppearance] = useState<AppearanceMode>("system");
  const [mode, setMode] = useState<DashboardMode>("build");
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [authToken, setAuthToken] = useState<string | null>(authTokenProp ?? null);

  const strings = STRINGS[language];
  const liveData = useBloomMobileData(profileId, authToken);
  const [uiData, setUiData] = useState<BloomDashboardData | null>(null);
  const [walletOverride, setWalletOverride] = useState<{ petales: number; crystalPetales: number } | null>(null);
  const [shieldOverride, setShieldOverride] = useState<boolean | null>(null);
  const [plan, setPlan] = useState<BloomPlan>("seedling");

  useEffect(() => {
    if (liveData) setUiData(liveData);
  }, [liveData]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      if (authTokenProp) {
        await setMobileAuthToken(authTokenProp);
        if (mounted) setAuthToken(authTokenProp);
        return;
      }

      const savedToken = await getMobileAuthToken();
      if (mounted) setAuthToken(savedToken);
    })();

    return () => {
      mounted = false;
    };
  }, [authTokenProp]);

  useEffect(() => {
    void (async () => {
      await initMobileOfflineStore();
      await configureSmartNotificationFilter();
      const [wallet, shield] = await Promise.all([readWalletState(), getShieldStatus()]);

      setWalletOverride({
        petales: wallet.ordinaryPetales,
        crystalPetales: wallet.crystalPetales,
      });
      setShieldOverride(shield.active);

      if (wallet.plan === "bloom-forever") {
        setPlan("bloom-forever");
      } else {
        const savedPlan = await AsyncStorage.getItem("bloom-mobile-paywall-plan");
        if (savedPlan === "bloom-premium" || savedPlan === "bloom-forever" || savedPlan === "seedling") {
          setPlan(savedPlan);
        }
      }

      try {
        await trySyncMobileQueue(profileId, authToken ?? undefined);
      } catch {
        // Stay offline-first: queue remains local until next successful sync.
      }
    })();
  }, [authToken, profileId]);

  useEffect(() => {
    if (!uiData) return;
    void scheduleMorningAndEveningHabitReminders(uiData.habits);
  }, [uiData]);

  useEffect(() => {
    void (async () => {
      const [savedLang, savedAppearance, savedMode, seenOnboarding] = await Promise.all([
        AsyncStorage.getItem(PREF_KEYS.language),
        AsyncStorage.getItem(PREF_KEYS.appearance),
        AsyncStorage.getItem(PREF_KEYS.lastMode),
        AsyncStorage.getItem(PREF_KEYS.seenOnboarding),
      ]);

      const resolved = resolvePersistedPreferences({
        language: savedLang,
        appearance: savedAppearance,
        mode: savedMode,
        seenOnboarding,
      });

      setLanguage(resolved.language);
      setAppearance(resolved.appearance);
      setMode(resolved.mode);
      setShowOnboarding(!resolved.seenOnboarding);
    })();
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem(PREF_KEYS.language, language);
  }, [language]);

  useEffect(() => {
    void AsyncStorage.setItem(PREF_KEYS.appearance, appearance);
  }, [appearance]);

  useEffect(() => {
    void AsyncStorage.setItem(PREF_KEYS.lastMode, mode);
  }, [mode]);

  useEffect(() => {
    if (!showOnboarding && width > 0 && listRef.current) {
      listRef.current.scrollToIndex({ index: mode === "build" ? 0 : 1, animated: false });
    }
  }, [mode, showOnboarding, width]);

  const palette = useMemo(() => buildPalette(mode, appearance, systemScheme), [mode, appearance, systemScheme]);

  const sunnyState = useMemo(() => {
    if (!uiData) return "neutral" as const;
    return determineSunnyState({
      activeStreak: uiData.activeStreak,
      missedDays: uiData.missedDays,
      shieldActive: shieldOverride ?? uiData.shieldActive,
      milestoneReached: isMilestone(uiData.activeStreak),
    });
  }, [shieldOverride, uiData]);

  const { maybeShowInterstitial } = useInterstitialAdGate(plan, "dashboard");

  const handleCheckIn = useCallback(
    async (habitId: string) => {
      if (!uiData) return;

      const targetHabit = uiData.habits.find((habit) => habit.id === habitId);
      if (!targetHabit || targetHabit.todayChecked) return;

      const nextStreak = targetHabit.streak + 1;

      await queueMobileCheckIn({
        profileId,
        habitId,
        mood: "focused",
        note: "mobile-checkin",
        newStreak: nextStreak,
      });

      // Absolute ad exclusion is enforced for check-in screen context.
      if (shouldRenderInterstitial(plan, "checkin") && showInterstitialAd) {
        await maybeShowInterstitial(showInterstitialAd);
      }

      const wallet = await readWalletState();
      setWalletOverride({
        petales: wallet.ordinaryPetales,
        crystalPetales: wallet.crystalPetales,
      });

      setUiData((current) => {
        if (!current) return current;

        const habits = current.habits.map((habit) =>
          habit.id === habitId
            ? {
                ...habit,
                todayChecked: true,
                streak: nextStreak,
              }
            : habit
        );

        const activeStreak = habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
        const sobrietyDays = habits
          .filter((habit) => habit.mode === "quit")
          .reduce((max, habit) => Math.max(max, habit.streak), 0);

        return {
          ...current,
          habits,
          activeStreak,
          sobrietyDays,
        };
      });

      try {
        await trySyncMobileQueue(profileId, authToken ?? undefined);
      } catch {
        // No-op. Queue remains persisted locally.
      }
    },
    [authToken, maybeShowInterstitial, plan, profileId, showInterstitialAd, uiData]
  );

  const onContinueOnboarding = useCallback(() => {
    setShowOnboarding(false);
    void AsyncStorage.setItem(PREF_KEYS.seenOnboarding, "true");
  }, []);

  const onMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextMode = getModeFromOffset(event.nativeEvent.contentOffset.x, width);
      setMode(nextMode);
    },
    [width]
  );

  const renderBuild = useCallback(() => {
    const buildHabits = (uiData?.habits ?? []).filter((habit) => habit.mode === "build");

    return (
      <View style={styles.panelContent}>
        <Text style={[styles.panelTitle, { color: palette.text }]}>{strings.buildMode}</Text>
        <Text style={[styles.panelHint, { color: palette.mutedText }]}>{strings.swipeHintBuild}</Text>

        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.cardTitle, { color: palette.text }]}>{strings.heatmap}</Text>
          <View style={styles.heatmapGrid}>
            {(uiData?.heatmapValues ?? []).map((value, index) => {
              const shade =
                value >= 75
                  ? "#2E6A40"
                  : value >= 50
                    ? "#3A7D4F"
                    : value >= 25
                      ? "#6EA97F"
                      : "#C7DCCF";
              return (
                <View
                  key={`heat-${index}`}
                  style={[
                    styles.heatCell,
                    {
                      backgroundColor: shade,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.cardTitle, { color: palette.text }]}>{strings.checkboxes}</Text>
          {buildHabits.length === 0 ? (
            <Text style={[styles.emptyText, { color: palette.mutedText }]}>No build habits yet.</Text>
          ) : (
            buildHabits.map((habit) => (
              <Pressable key={habit.id} onPress={() => void handleCheckIn(habit.id)} style={styles.checkboxRow}>
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: palette.border,
                      backgroundColor: habit.todayChecked ? palette.accent : "transparent",
                    },
                  ]}
                />
                <Text style={[styles.checkboxLabel, { color: palette.text }]}>{habit.title}</Text>
              </Pressable>
            ))
          )}
        </View>
      </View>
    );
  }, [handleCheckIn, palette, strings.buildMode, strings.checkboxes, strings.heatmap, strings.swipeHintBuild, uiData]);

  const renderQuit = useCallback(() => {
    return (
      <View style={styles.panelContent}>
        <Text style={[styles.panelTitle, { color: palette.text }]}>{strings.quitMode}</Text>
        <Text style={[styles.panelHint, { color: palette.mutedText }]}>{strings.swipeHintQuit}</Text>

        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Text style={[styles.sobrietyValue, { color: "#6B4FA0" }]}>{uiData?.sobrietyDays ?? 0}</Text>
          <Text style={[styles.sobrietyLabel, { color: palette.text }]}>{strings.freedDays}</Text>
        </View>
      </View>
    );
  }, [palette, strings.freedDays, strings.quitMode, strings.swipeHintQuit, uiData?.sobrietyDays]);

  const renderPage = useCallback(
    ({ item }: ListRenderItemInfo<DashboardPage>) => (
      <View style={[styles.page, { width, backgroundColor: palette.bg }]}>
        {item.id === "build" ? renderBuild() : renderQuit()}
      </View>
    ),
    [palette.bg, renderBuild, renderQuit, width]
  );

  if (showOnboarding) {
    const onboardingPalette = buildPalette("build", appearance, systemScheme);
    return (
      <OnboardingScreen
        title={strings.onboardingTitle}
        buttonText={strings.onboardingCta}
        backgroundColor={onboardingPalette.bg}
        textColor={onboardingPalette.text}
        accent={onboardingPalette.accent}
        onContinue={onContinueOnboarding}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.bg }]}>
      <View style={[styles.topBar, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <View style={styles.topBarItem}>
          <Text style={[styles.topBarValue, { color: palette.text }]}>{walletOverride?.petales ?? uiData?.currency.petales ?? 0}</Text>
          <Text style={[styles.topBarLabel, { color: palette.mutedText }]}>{strings.petals}</Text>
        </View>
        <View style={[styles.topBarDivider, { backgroundColor: palette.border }]} />
        <View style={styles.topBarItem}>
          <Text style={[styles.topBarValue, { color: palette.text }]}>{walletOverride?.crystalPetales ?? uiData?.currency.crystalPetales ?? 0}</Text>
          <Text style={[styles.topBarLabel, { color: palette.mutedText }]}>{strings.crystalPetals}</Text>
        </View>
      </View>

      <View style={[styles.settingsWrap, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.settingsTitle, { color: palette.text }]}>{strings.language}</Text>
        <View style={styles.chipRow}>
          <Pressable onPress={() => setLanguage("fr")} style={[styles.chip, language === "fr" ? { borderColor: palette.accent } : { borderColor: palette.border }]}><Text style={{ color: palette.text }}>FR</Text></Pressable>
          <Pressable onPress={() => setLanguage("en")} style={[styles.chip, language === "en" ? { borderColor: palette.accent } : { borderColor: palette.border }]}><Text style={{ color: palette.text }}>EN</Text></Pressable>
          <Pressable onPress={() => setLanguage("es")} style={[styles.chip, language === "es" ? { borderColor: palette.accent } : { borderColor: palette.border }]}><Text style={{ color: palette.text }}>ES</Text></Pressable>
        </View>

        <Text style={[styles.settingsTitle, { color: palette.text }]}>{strings.appearance}</Text>
        <View style={styles.chipRow}>
          <Pressable onPress={() => setAppearance("light")} style={[styles.chip, appearance === "light" ? { borderColor: palette.accent } : { borderColor: palette.border }]}><Text style={{ color: palette.text }}>{strings.light}</Text></Pressable>
          <Pressable onPress={() => setAppearance("dark")} style={[styles.chip, appearance === "dark" ? { borderColor: palette.accent } : { borderColor: palette.border }]}><Text style={{ color: palette.text }}>{strings.dark}</Text></Pressable>
          <Pressable onPress={() => setAppearance("system")} style={[styles.chip, appearance === "system" ? { borderColor: palette.accent } : { borderColor: palette.border }]}><Text style={{ color: palette.text }}>{strings.system}</Text></Pressable>
        </View>
      </View>

      <View style={styles.dashboardArea}>
        <AdBannerSlot
          plan={plan}
          screen="dashboard"
          renderBanner={() =>
            renderBannerAd ? (
              renderBannerAd()
            ) : (
              <View style={styles.bannerPlaceholder}>
                <Text style={styles.bannerPlaceholderText}>Ad banner slot</Text>
              </View>
            )
          }
        />

        <FlatList
          ref={listRef}
          horizontal
          data={PAGES}
          renderItem={renderPage}
          keyExtractor={(item: DashboardPage) => item.id}
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumEnd}
          inverted={false}
          bounces={false}
          overScrollMode="never"
          getItemLayout={(_data: unknown, index: number) => ({ length: width, offset: width * index, index })}
        />

        <View pointerEvents="none" style={styles.centerZoneWrap}>
          <View style={[styles.centerZone, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <SunnyMascot state={sunnyState} iteration={resolveSunnyIteration("popup")} size={90} />
            <Text style={[styles.streakLabel, { color: palette.mutedText }]}>{strings.activeStreak}</Text>
            <Text style={[styles.streakValue, { color: palette.text }]}>{uiData?.activeStreak ?? 0}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  onboardingWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 18,
  },
  onboardingSunnyWrap: { alignItems: "center", marginVertical: 4 },
  onboardingTitle: { fontSize: 28, fontWeight: "700", textAlign: "center" },
  onboardingText: { fontSize: 18, lineHeight: 28, textAlign: "center" },
  primaryButton: {
    alignSelf: "center",
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  primaryButtonLabel: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  topBar: {
    marginTop: 8,
    marginHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  topBarItem: { alignItems: "center", gap: 2 },
  topBarValue: { fontSize: 18, fontWeight: "700" },
  topBarLabel: { fontSize: 12 },
  topBarDivider: { width: 1, height: 28 },
  settingsWrap: {
    marginTop: 10,
    marginHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  settingsTitle: { fontSize: 13, fontWeight: "600" },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dashboardArea: { flex: 1, marginTop: 8 },
  page: { flex: 1 },
  panelContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 14,
  },
  panelTitle: { fontSize: 28, fontWeight: "700" },
  panelHint: { fontSize: 13 },
  card: { borderRadius: 20, borderWidth: 1, padding: 14, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  emptyText: { fontSize: 13 },
  heatmapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  heatCell: { width: 18, height: 18, borderRadius: 5 },
  bannerPlaceholder: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: "#ECEFF3",
    borderWidth: 1,
    borderColor: "#D8DEE6",
    paddingVertical: 8,
    alignItems: "center",
  },
  bannerPlaceholderText: {
    color: "#2A3340",
    fontSize: 12,
    fontWeight: "600",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 5,
  },
  checkboxLabel: { fontSize: 15 },
  sobrietyValue: { textAlign: "center", fontSize: 56, fontWeight: "800" },
  sobrietyLabel: { textAlign: "center", fontSize: 20, fontWeight: "600" },
  centerZoneWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "31%",
    alignItems: "center",
  },
  centerZone: {
    minWidth: 188,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 4,
  },
  streakLabel: { fontSize: 12 },
  streakValue: { fontSize: 24, fontWeight: "800" },
});

export type { BloomMobileNavigationProps };
