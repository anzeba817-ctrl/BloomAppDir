export type BloomPlan = "seedling" | "bloom-premium" | "bloom-forever";
export type AdFormat = "banner" | "interstitial";

export type ProtectedScreen =
  | "checkin"
  | "journal"
  | "milestone-popup"
  | "petal-crystal-conversion"
  | "dashboard"
  | "settings"
  | "paywall";

export type PlanOffer = {
  plan: BloomPlan;
  priceLabel: string;
  adsEnabled: boolean;
};

export const PLAN_OFFERS: PlanOffer[] = [
  { plan: "seedling", priceLabel: "$0", adsEnabled: true },
  { plan: "bloom-premium", priceLabel: "$4.99/mo", adsEnabled: false },
  { plan: "bloom-forever", priceLabel: "$79.99 lifetime", adsEnabled: false },
];

const ABSOLUTE_AD_BLOCK_SCREENS: ReadonlySet<ProtectedScreen> = new Set([
  "checkin",
  "journal",
  "milestone-popup",
  "petal-crystal-conversion",
]);

export function canDisplayAd(params: {
  plan: BloomPlan;
  screen: ProtectedScreen;
  format: AdFormat;
}): boolean {
  const { plan, screen } = params;

  if (plan === "bloom-premium" || plan === "bloom-forever") {
    return false;
  }

  // Free plan can have ads except on emotionally sensitive protected screens.
  if (ABSOLUTE_AD_BLOCK_SCREENS.has(screen)) {
    return false;
  }

  return true;
}

export function shouldRenderBanner(plan: BloomPlan, screen: ProtectedScreen): boolean {
  return canDisplayAd({ plan, screen, format: "banner" });
}

export function shouldRenderInterstitial(plan: BloomPlan, screen: ProtectedScreen): boolean {
  return canDisplayAd({ plan, screen, format: "interstitial" });
}
