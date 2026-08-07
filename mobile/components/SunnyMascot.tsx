import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SunnyIteration, SunnyState } from "../navigation/logic";

type SunnyMascotProps = {
  state: SunnyState;
  iteration: SunnyIteration;
  size?: number;
};

const COLORS = {
  face: "#F5C030",
  petal: "#E8920A",
  stem: "#3A7D4F",
  blushAmber: "rgba(232,146,10,0.28)",
  eye: "#1D232E",
  aura: "rgba(107,79,160,0.22)",
} as const;

function faceExpression(state: SunnyState): { eyes: string; mouth: string; extras?: string } {
  switch (state) {
    case "neutral":
      return { eyes: "o o", mouth: "_" };
    case "growing":
      return { eyes: "^ ^", mouth: "u" };
    case "blooming":
      return { eyes: "* *", mouth: "U", extras: "spark" };
    case "wilting":
      return { eyes: "o o", mouth: "n" };
    case "struggling":
      return { eyes: "x x", mouth: "~" };
    case "overjoyed":
      return { eyes: "c c", mouth: "W", extras: "hearts" };
    case "shielded":
      return { eyes: "o o", mouth: "u", extras: "aura" };
    default:
      return { eyes: "o o", mouth: "_" };
  }
}

function stemTransform(state: SunnyState): number {
  if (state === "struggling") return 24;
  if (state === "wilting") return 10;
  return 0;
}

function petalRotation(state: SunnyState, base: number): number {
  if (state === "wilting") return base + 18;
  if (state === "blooming") return base - 8;
  return base;
}

export function SunnyMascot(props: SunnyMascotProps): React.JSX.Element {
  const { state, iteration, size = 104 } = props;
  const expression = faceExpression(state);

  const petalScale = iteration === "A" ? 1 : 1.08;
  const petalSkew = iteration === "A" ? 0 : 6;

  const petals = Array.from({ length: 10 }, (_, index) => index);

  return (
    <View style={[styles.root, { width: size + 40, height: size + 88 }]}>
      {expression.extras === "aura" ? (
        <View
          style={[
            styles.aura,
            {
              width: size + 26,
              height: size + 26,
              borderRadius: (size + 26) / 2,
              backgroundColor: COLORS.aura,
            },
          ]}
        />
      ) : null}

      <View style={[styles.headWrap, { width: size + 18, height: size + 18 }]}> 
        {petals.map((idx) => {
          const angle = (idx / petals.length) * 360;
          const radius = size * 0.48;
          const rot = petalRotation(state, angle);
          return (
            <View
              key={`petal-${idx}`}
              style={[
                styles.petal,
                {
                  width: size * 0.24 * petalScale,
                  height: size * 0.36 * petalScale,
                  borderRadius: size * 0.22,
                  backgroundColor: COLORS.petal,
                  transform: [
                    { rotate: `${rot}deg` },
                    { translateY: -radius },
                    { skewX: `${petalSkew}deg` },
                  ],
                },
              ]}
            />
          );
        })}

        <View style={[styles.face, { width: size, height: size, borderRadius: size / 2 }]}>
          <View style={[styles.blush, { left: size * 0.16, backgroundColor: COLORS.blushAmber }]} />
          <View style={[styles.blush, { right: size * 0.16, backgroundColor: COLORS.blushAmber }]} />

          <Text style={[styles.eyes, { color: COLORS.eye }]}>{expression.eyes}</Text>
          <Text style={[styles.mouth, { color: COLORS.eye }]}>{expression.mouth}</Text>

          {expression.extras === "spark" ? <Text style={styles.spark}>*</Text> : null}
          {expression.extras === "hearts" ? <Text style={styles.hearts}>+ +</Text> : null}
        </View>
      </View>

      <View
        style={[
          styles.stem,
          {
            height: size * 0.64,
            backgroundColor: COLORS.stem,
            transform: [{ rotate: `${stemTransform(state)}deg` }],
          },
        ]}
      />

      <View style={[styles.leaf, styles.leafLeft, { backgroundColor: COLORS.stem }]} />
      <View style={[styles.leaf, styles.leafRight, { backgroundColor: COLORS.stem }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  aura: {
    position: "absolute",
    top: 3,
  },
  headWrap: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  petal: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -12,
    marginTop: -32,
  },
  face: {
    backgroundColor: COLORS.face,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(29,35,46,0.12)",
  },
  blush: {
    position: "absolute",
    top: "56%",
    width: 16,
    height: 8,
    borderRadius: 8,
  },
  eyes: {
    fontSize: 19,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
  mouth: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "700",
  },
  spark: {
    position: "absolute",
    top: 14,
    right: 18,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  hearts: {
    position: "absolute",
    top: 14,
    right: 14,
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  stem: {
    marginTop: -4,
    width: 8,
    borderRadius: 5,
  },
  leaf: {
    position: "absolute",
    width: 24,
    height: 12,
    borderRadius: 14,
    top: "74%",
  },
  leafLeft: {
    left: "39%",
    transform: [{ rotate: "-34deg" }],
  },
  leafRight: {
    left: "52%",
    transform: [{ rotate: "34deg" }],
  },
});
