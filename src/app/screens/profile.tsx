"use client";

import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Calendar } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { SunnyMascot } from "../components/sunny-mascot";
import { useLanguage } from "../contexts/LanguageContext";

export function Profile() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Generate mock heatmap data for the year
  const generateYearHeatmap = () => {
    const days = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const hasActivity = Math.random() > 0.4;
      const intensity = hasActivity ? Math.floor(Math.random() * 4) + 1 : 0;
      days.push({
        date: date.toISOString().split("T")[0],
        intensity,
      });
    }
    return days;
  };

  const heatmapData = generateYearHeatmap();

  const getColorForIntensity = (intensity: number) => {
    if (intensity === 0) return "bg-border";
    if (intensity === 1) return "bg-secondary/30";
    if (intensity === 2) return "bg-secondary/60";
    if (intensity === 3) return "bg-secondary/80";
    return "bg-secondary";
  };

  // Group by weeks
  const weeks: Array<Array<{ date: string; intensity: number }>> = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="sticky top-0 z-10 border-b border-border/70 bg-background/90 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">profil</p>
            <h1 className="text-xl font-semibold text-foreground">{t("profile_title") as string}</h1>
          </div>
          <button
            onClick={() => navigate("/settings")}
            className="rounded-full border border-border/70 bg-card/70 px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            réglages
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-5 px-5 py-6 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-border/60 bg-gradient-to-br from-background via-card/80 to-secondary/10 p-6 text-center shadow-sm"
        >
          <SunnyMascot mood="blooming" size={104} className="mx-auto mb-4" />
          <h2 className="mb-2 text-2xl font-semibold">{t("your_journey") as string}</h2>
          <p className="text-muted-foreground">{t("member_since") as string}</p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-[22px] border border-secondary/20 bg-secondary/10 p-4">
              <div className="text-3xl font-bold text-secondary">5</div>
              <div className="mt-1 text-sm text-muted-foreground">{t("active_habits") as string}</div>
            </div>
            <div className="rounded-[22px] border border-primary/20 bg-primary/10 p-4">
              <div className="text-3xl font-bold text-primary">127</div>
              <div className="mt-1 text-sm text-muted-foreground">{t("total_days") as string}</div>
            </div>
            <div className="rounded-[22px] border border-accent/20 bg-accent/10 p-4">
              <div className="text-3xl font-bold text-accent">42</div>
              <div className="mt-1 text-sm text-muted-foreground">{t("petals_count") as string}</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-[32px] border border-border/60 bg-card/80 p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">{t("year_activity") as string}</h3>
          </div>

          <div className="overflow-x-auto pb-2">
            <div className="inline-flex flex-col gap-1">
              <div className="mb-2 ml-8 flex gap-1">
                {(t("months_label") as unknown as string[]).map(
                  (month, i) => (
                    <div
                      key={month}
                      className="text-xs text-muted-foreground"
                      style={{ width: `${(weeks.length / 12) * 12}px`, textAlign: "left" }}
                    >
                      {i % 2 === 0 ? month : ""}
                    </div>
                  )
                )}
              </div>

              {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => (
                <div key={dayOfWeek} className="flex gap-1 items-center">
                  <div className="w-6 text-xs text-muted-foreground text-right">
                    {(t("days_label") as unknown as string[])[dayOfWeek]}
                  </div>
                  <div className="flex gap-1">
                    {weeks.map((week, weekIndex) => {
                      const day = week[dayOfWeek];
                      return day ? (
                        <div
                          key={weekIndex}
                          className={`w-3 h-3 rounded-sm ${getColorForIntensity(day.intensity)}`}
                          title={day.date}
                        />
                      ) : (
                        <div key={weekIndex} className="w-3 h-3" />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{t("less") as string}</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-4 h-4 rounded-sm ${getColorForIntensity(i)}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{t("more") as string}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-[32px] border border-border/60 bg-gradient-to-br from-secondary/10 to-accent/10 p-4 shadow-sm"
        >
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="insights" className="border-none">
              <AccordionTrigger className="px-3 py-3 hover:no-underline">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">{t("insights") as string}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">les repères utiles sans allonger la page</p>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="space-y-3">
                  <div className="rounded-[22px] border border-border/60 bg-card/80 p-4">
                    <p className="text-card-foreground/80">
                      🔥 <span className="font-semibold">{t("longest_streak") as string}:</span> 30 jours
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-border/60 bg-card/80 p-4">
                    <p className="text-card-foreground/80">
                      📅 <span className="font-semibold">{t("best_day") as string}:</span> mercredi (85%)
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-border/60 bg-card/80 p-4">
                    <p className="text-card-foreground/80">
                      💪 <span className="font-semibold">{t("best_habit") as string}:</span> méditation
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-purple-500/20 bg-purple-500/10 p-4 text-center">
                    <p className="text-sm leading-relaxed text-foreground/70">{t("data_note") as string}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>
    </div>
  );
}

