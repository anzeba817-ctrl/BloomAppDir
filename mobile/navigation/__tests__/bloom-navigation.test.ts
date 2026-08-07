import assert from "node:assert/strict";
import test from "node:test";
import {
  determineSunnyState,
  getModeFromOffset,
  isMilestone,
  ONBOARDING_TEXT,
  resolvePersistedPreferences,
  resolveSunnyIteration,
  STRINGS,
} from "../logic";

test("swipe mode resolution is strict and non inverted", () => {
  assert.equal(getModeFromOffset(0, 360), "build");
  assert.equal(getModeFromOffset(359, 360), "quit");
  assert.equal(getModeFromOffset(720, 360), "quit");
});

test("i18n provides onboarding and labels", () => {
  assert.ok(ONBOARDING_TEXT.includes("Hello, my name is Sunny Bloom."));
  assert.equal(STRINGS.fr.buildMode, "Mode Ancrage");
  assert.equal(STRINGS.en.quitMode, "Quit Mode");
  assert.equal(STRINGS.es.language, "Idioma");
});

test("persistence parser falls back safely", () => {
  const prefs = resolvePersistedPreferences({
    language: "xx",
    appearance: "invalid",
    mode: null,
    seenOnboarding: "true",
  });

  assert.equal(prefs.language, "fr");
  assert.equal(prefs.appearance, "system");
  assert.equal(prefs.mode, "build");
  assert.equal(prefs.seenOnboarding, true);
});

test("sunny state switch respects all 7 states", () => {
  assert.equal(
    determineSunnyState({ activeStreak: 1, missedDays: 0, shieldActive: false, milestoneReached: false }),
    "neutral"
  );

  assert.equal(
    determineSunnyState({ activeStreak: 3, missedDays: 0, shieldActive: false, milestoneReached: false }),
    "growing"
  );

  assert.equal(
    determineSunnyState({ activeStreak: 7, missedDays: 0, shieldActive: false, milestoneReached: false }),
    "blooming"
  );

  assert.equal(
    determineSunnyState({ activeStreak: 4, missedDays: 1, shieldActive: false, milestoneReached: false }),
    "wilting"
  );

  assert.equal(
    determineSunnyState({ activeStreak: 4, missedDays: 2, shieldActive: false, milestoneReached: false }),
    "struggling"
  );

  assert.equal(
    determineSunnyState({ activeStreak: 30, missedDays: 0, shieldActive: false, milestoneReached: true }),
    "overjoyed"
  );

  assert.equal(
    determineSunnyState({ activeStreak: 2, missedDays: 4, shieldActive: true, milestoneReached: false }),
    "shielded"
  );
});

test("sunny milestones and iteration selector", () => {
  assert.equal(isMilestone(7), true);
  assert.equal(isMilestone(30), true);
  assert.equal(isMilestone(100), true);
  assert.equal(isMilestone(99), false);

  assert.equal(resolveSunnyIteration("widget"), "A");
  assert.equal(resolveSunnyIteration("notification"), "A");
  assert.equal(resolveSunnyIteration("popup"), "B");
  assert.equal(resolveSunnyIteration("onboarding"), "B");
});
