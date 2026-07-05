"use client";

import { JSX, useState } from "react";
import { motion } from "motion/react";
import { Flame, CalendarDays, Sun, Lock } from "lucide-react";
import { SunnyMascot } from "../components/sunny-mascot";
import { useLanguage } from "../contexts/LanguageContext";

interface Widget {
  id: string;
  titleKey: "streak_widget" | "heatmap_widget" | "sunny_widget";
  descKey: "streak_widget_desc" | "heatmap_widget_desc" | "sunny_widget_desc";
  icon: typeof Flame;
  color: string;
  bg: string;
  premium?: boolean;
  preview: () => JSX.Element;
}

export function Widgets() {
  const { t } = useLanguage();
  const [added, setAdded] = useState<string[]>([]);

  const toggle = (id: string) => {
    setAdded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const widgets: Widget[] = [
    {
      id: "streak",
      titleKey: "streak_widget",
      descKey: "streak_widget_desc",
      icon: Flame,
      color: "hsl(var(--primary))",
      bg: "hsl(var(--primary) / 0.1)",
      preview: () => (
        <div className="bg-card rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold text-card-foreground">5</div>
            <div className="text-xs text-muted-foreground">{t("streak_days") as string}</div>
          </div>
        </div>
      ),
    },
    {
      id: "heatmap",
      titleKey: "heatmap_widget",
      descKey: "heatmap_widget_desc",
      icon: CalendarDays,
      color: "hsl(var(--secondary))",
      bg: "hsl(var(--secondary) / 0.1)",
      preview: () => (
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-sm ${
                  Math.random() > 0.4 ? "bg-secondary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "sunny",
      titleKey: "sunny_widget",
      descKey: "sunny_widget_desc",
      icon: Sun,
      color: "hsl(var(--accent))",
      bg: "hsl(var(--accent) / 0.1)",
      premium: true,
      preview: () => (
        <div className="bg-gradient-to-br from-background to-accent/20 rounded-2xl p-4 flex items-center justify-center shadow-sm">
          <SunnyMascot mood="blooming" size={64} />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl text-foreground">{t("widgets_title") as string}</h1>
          <p className="text-sm text-muted-foreground">{t("widgets_subtitle") as string}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
        {widgets.map((widget, i) => {
          const Icon = widget.icon;
          const isAdded = added.includes(widget.id);

          return (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card text-card-foreground rounded-3xl p-6 shadow-sm"
            >
              {/* Preview */}
              <div className="mb-4">{widget.preview()}</div>

              {/* Info + Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: widget.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: widget.color }} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {t(widget.titleKey) as string}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t(widget.descKey) as string}
                    </div>
                  </div>
                </div>

                {widget.premium ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-full">
                    <Lock className="w-3 h-3" />
                    {t("coming_soon") as string}
                  </div>
                ) : (
                  <button
                    onClick={() => toggle(widget.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isAdded
                        ? "bg-secondary/20 text-secondary"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isAdded ? (t("added") as string) : (t("add_widget") as string)}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

