import React from "react";
import { BloomPlan, ProtectedScreen, shouldRenderBanner, shouldRenderInterstitial } from "./paywall-ads-policy";

export type InterstitialPresenter = () => Promise<void> | void;

export function useBannerAdGate(plan: BloomPlan, screen: ProtectedScreen): { enabled: boolean } {
  return { enabled: shouldRenderBanner(plan, screen) };
}

export function useInterstitialAdGate(plan: BloomPlan, screen: ProtectedScreen): {
  maybeShowInterstitial: (present: InterstitialPresenter) => Promise<boolean>;
} {
  return {
    maybeShowInterstitial: async (present: InterstitialPresenter): Promise<boolean> => {
      if (!shouldRenderInterstitial(plan, screen)) {
        return false;
      }
      await present();
      return true;
    },
  };
}

type AdBannerSlotProps = {
  plan: BloomPlan;
  screen: ProtectedScreen;
  renderBanner: () => React.ReactNode;
};

export function AdBannerSlot(props: AdBannerSlotProps): React.JSX.Element | null {
  const { plan, screen, renderBanner } = props;
  const gate = useBannerAdGate(plan, screen);

  if (!gate.enabled) {
    return null;
  }

  return React.createElement(React.Fragment, null, renderBanner());
}
