"use client";

import { motion, AnimatePresence } from "motion/react";
import { PenLine, Smile, Meh, Frown, Heart, X } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState } from "react";

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  text: string;
}

const moods = [
  { icon: "🌟", label: "radieux" },
  { icon: "😊", label: "bien" },
  { icon: "😐", label: "neutre" },
  { icon: "😔", label: "difficile" },
  { icon: "🌧️", label: "dur" },
];

const mockEntries: JournalEntry[] = [
  {
    id: "1",
    date: "2026-06-14",
    mood: "😊",
    text: "Belle journée, j'ai réussi ma méditation du matin. Sunny était content !",
  },
  {
    id: "2",
    date: "2026-06-13",
    mood: "🌟",
    text: "30 jours de suite ! Milestone atteint. Je suis fier de moi.",
  },
  {
    id: "3",
    date: "2026-06-12",
    mood: "😐",
    text: "Journée mitigée. J'ai quand même fait mon check-in.",
  },
];

export function Journal() {
  const { t } = useLanguage();
  const [entries, setEntries] = useLocalStorage<JournalEntry[]>("bloom-journal-entries", mockEntries);
  const parentRef = useRef<HTMLDivElement>(null);
  const [showNew, setShowNew] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");
  const [text, setText] = useState("");

  const handleSave = () => {
    if (!text.trim()) return;
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      mood: selectedMood || "😊",
      text,
    };
    setEntries([newEntry, ...entries]);
    setText("");
    setSelectedMood("");
    setShowNew(false);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  };

  const rowVirtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 124, // Estimation de la hauteur d'une carte (p-6 + contenu)
    overscan: 5,
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border/70 bg-background/90 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">{t("nav_journal") as string}</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">{t("journal_title") as string}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("journal_subtitle") as string}</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 rounded-2xl bg-primary/95 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary"
          >
            <PenLine className="w-4 h-4" />
            {t("new_entry") as string}
          </button>
        </div>
      </div>

      <div ref={parentRef} className="max-w-2xl mx-auto px-6 py-6 overflow-y-auto" style={{ height: 'calc(100vh - 150px)' }}>
        {entries.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <PenLine className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>{t("no_entries") as string}</p>
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const entry = entries[virtualItem.index];
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: virtualItem.index * 0.02 }}
                  className="rounded-[28px] border border-border/60 bg-card/90 p-6 shadow-lg"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                    marginBottom: '1rem',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{entry.mood}</span>
                      <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
                    </div>
                  </div>
                  <p className="text-card-foreground/80 leading-relaxed text-sm">{entry.text}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Entry Sheet */}
      <AnimatePresence>
        {showNew && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setShowNew(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed bottom-0 inset-x-0 z-50 bg-background text-foreground rounded-t-3xl p-6 pb-12 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg text-foreground">{t("how_feeling") as string}</h2>
                <button
                  onClick={() => setShowNew(false)}
                  className="p-2 hover:bg-muted rounded-full"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Mood Selector */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {moods.map((m) => (
                  <button
                    key={m.icon}
                    onClick={() => setSelectedMood(m.icon)}
                    className={`flex min-w-[64px] flex-col items-center gap-2 rounded-3xl border px-4 py-3 text-center transition-all ${
                      selectedMood === m.icon
                        ? "border-primary bg-primary/15 shadow-sm"
                        : "border-border/60 bg-card hover:border-primary/80 hover:bg-muted"
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span className="text-[11px] font-medium text-muted-foreground">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Text Area */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("write_placeholder") as string}
                rows={6}
                className="w-full rounded-[24px] border border-border/60 bg-card/90 px-5 py-4 text-card-foreground placeholder:text-muted-foreground resize-none outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-sm leading-relaxed"
              />

              <button
                onClick={handleSave}
                disabled={!text.trim()}
                className="mt-4 w-full bg-primary text-primary-foreground py-4 rounded-2xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {t("save_entry") as string}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

