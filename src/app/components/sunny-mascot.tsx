import { motion } from "motion/react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import LogoImg from "../../imports/Logo.png";
import Etat1Img from "../../imports/Etat1.png";
import Etat2Img from "../../imports/Etat2.png";
import Etat3Img from "../../imports/Etat3.png";

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

  // Map moods to images
  const getImageForMood = () => {
    switch (mood) {
      case "struggling":
      case "wilting":
        return Etat1Img; // Angry/frustrated
      case "blooming":
      case "overjoyed":
        return Etat2Img; // Very happy with stars
      case "growing":
      case "shielded":
        return Etat3Img; // Calm/content with blush
      case "neutral":
      default:
        return LogoImg; // Simple neutral smile
    }
  };

  const getMoodStyles = () => {
    switch (mood) {
      case "neutral":
        return { scale: 1, y: 0, brightness: 1 };
      case "growing":
        return { scale: 1.05, y: -2, brightness: 1.1 };
      case "blooming":
        return { scale: 1.1, y: -5, brightness: 1.2 };
      case "wilting":
        return { scale: 0.95, y: 5, brightness: 0.8 };
      case "struggling":
        return { scale: 0.9, y: 10, brightness: 0.7 };
      case "overjoyed":
        return { scale: 1.15, y: -8, brightness: 1.3 };
      case "shielded":
        return { scale: 1, y: 0, brightness: 1.15 };
      default:
        return { scale: 1, y: 0, brightness: 1 };
    }
  };

  const styles = getMoodStyles();
  const imageSrc = getImageForMood();

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Shield aura for shielded state */}
      {mood === "shielded" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(107, 79, 160, 0.3) 0%, rgba(107, 79, 160, 0) 70%)",
            filter: "blur(10px)",
            transform: "scale(1.3)",
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1.3, 1.4, 1.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Sparkles for blooming/overjoyed */}
      {(mood === "blooming" || mood === "overjoyed") && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: "#F5C030",
                top: `${20 + Math.sin(i * 60) * 30}%`,
                left: `${50 + Math.cos(i * 60) * 40}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
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
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <ImageWithFallback
          src={imageSrc}
          alt="Sunny la mascotte"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: `brightness(${styles.brightness})`,
          }}
        />
      </motion.div>
    </div>
  );
}
