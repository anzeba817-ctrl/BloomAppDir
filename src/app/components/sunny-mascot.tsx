import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// Nouvelles images d'état
import BloomingImg from "../../imports/State1_Blooming.png";
import GrowingImg from "../../imports/State2_Growing.png";
import NeutralImg from "../../imports/State3_Neutral.png";
import WiltingImg from "../../imports/State4_Wilting.png";
import StrugglingImg from "../../imports/State5_Struggling.png";
import OverjoyedImg from "../../imports/State6_Overjoyed.png";
import ShieldedImg from "../../imports/State7_ Shielded.png";

export type SunnyMood =
  | "neutral"
  | "growing"
  | "blooming"
  | "wilting"
  | "struggling"
  | "overjoyed"
  | "shielded";

export type SunnyVariant = "classic" | "expressive";

interface SunnyMascotProps {
  mood?: SunnyMood;
  variant?: SunnyVariant;
  size?: number;
  className?: string;
}

export function SunnyMascot({
  mood = "neutral",
  variant = "classic",
  size = 120,
  className = ""
}: SunnyMascotProps) {

  // Map moods to images according to specs
  const getImageForMood = () => {
    switch (mood) {
      case "growing": return GrowingImg;
      case "blooming": return BloomingImg;
      case "wilting": return WiltingImg;
      case "struggling": return StrugglingImg;
      case "overjoyed": return OverjoyedImg;
      case "shielded": return ShieldedImg;
      case "neutral":
      default: return NeutralImg;
    }
  };

  const getMoodStyles = () => {
    switch (mood) {
      case "growing": return { scale: 1.05, y: -2 };
      case "blooming": return { scale: 1.1, y: -5 };
      case "wilting": return { scale: 0.95, y: 5 };
      case "struggling": return { scale: 0.9, y: 10 };
      case "overjoyed": return { scale: 1.15, y: -8 };
      case "shielded": return { scale: 1, y: 0 };
      case "neutral":
      default: return { scale: 1, y: 0 };
    }
  };

  const styles = getMoodStyles();
  const imageSrc = getImageForMood();

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Shield aura */}
      {mood === "shielded" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0) 70%)",
            filter: "blur(12px)",
            transform: "scale(1.4)",
          }}
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1.3, 1.5, 1.3],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Hearts for Overjoyed */}
      {mood === "overjoyed" && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-red-400 text-xl"
              style={{
                top: "20%",
                left: "45%",
              }}
              animate={{
                y: [-20, -60],
                x: [(i - 2) * 20, (i - 2) * 40 + (Math.random() - 0.5) * 20],
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
                ease: "easeOut",
              }}
            >
              ❤️
            </motion.div>
          ))}
        </>
      )}

      {/* Main Sunny Image */}
      <motion.div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        animate={{
          scale: styles.scale,
          y: styles.y,
        }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <ImageWithFallback
          src={imageSrc}
          alt={`Sunny en état ${mood}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </motion.div>
    </div>
  );
}
 Broadway: Broadway
