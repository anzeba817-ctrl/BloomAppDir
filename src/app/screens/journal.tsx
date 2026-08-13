"use client";

import { motion, AnimatePresence } from "motion/react";
import { PenLine, X, Trash2, Edit2, ChevronLeft, Paperclip, Image as ImageIcon, Video, FileText } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAnimation } from "../contexts/AnimationContext";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function JournalEntryContent({ entry, formatDate, handleEdit, handleDelete }: any) {
  return (
    <div className="cursor-pointer" onClick={() => handleEdit(entry)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
            {entry.mood}
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#1C1917]/30 uppercase tracking-widest">
              {formatDate(entry.date)}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {entry.attachments && entry.attachments.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {entry.attachments.map((att: any, idx: number) => (
            <div key={idx} className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 relative group">
              {att.type === 'image' ? (
                <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
              ) : att.type === 'video' ? (
                <div className="w-full h-full flex items-center justify-center bg-black/5">
                  <Video size={24} className="text-gray-400" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/5">
                  <FileText size={24} className="text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-[#1C1917]/70 leading-relaxed text-sm whitespace-pre-wrap line-clamp-3">
        {entry.text}
      </p>
    </div>
  );
}

/**
 * Interface pour une entrée de journal.
 */
interface JournalAttachment {
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
}

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  text: string;
  attachments?: JournalAttachment[];
}

/**
 * Écran Journal Intime.
 */
export function Journal() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { animationsEnabled } = useAnimation();

  const moods = [
    { icon: "🌟", label: t("mood_radiant") as string },
    { icon: "😊", label: t("mood_good") as string },
    { icon: "😐", label: t("mood_neutral") as string },
    { icon: "😔", label: t("mood_hard") as string },
    { icon: "🌧️", label: t("mood_tough") as string },
  ];

  const [entries, setEntries] = useLocalStorage<JournalEntry[]>("bloom-journal-entries", []);
  const [showSheet, setShowSheet] = useState(false);
  const [selectedMood, setSelectedMood] = useState("");
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<JournalAttachment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenNew = () => {
    setEditingId(null);
    setText("");
    setSelectedMood("😊");
    setAttachments([]);
    setShowSheet(true);
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setText(entry.text);
    setSelectedMood(entry.mood);
    setAttachments(entry.attachments || []);
    setShowSheet(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        let type: 'image' | 'video' | 'file' = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';

        setAttachments(prev => [...prev, {
          type,
          url,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (idx: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!text.trim()) return;

    if (editingId) {
      setEntries(entries.map(e => e.id === editingId ? { ...e, text, mood: selectedMood, attachments } : e));
    } else {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split("T")[0],
        mood: selectedMood || "😊",
        text,
        attachments,
      };
      setEntries([newEntry, ...entries]);
    }

    setText("");
    setSelectedMood("");
    setAttachments([]);
    setShowSheet(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-dvh bg-white pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-gray-50 rounded-full border border-gray-100 active:scale-90 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-[#1C1917]" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#1C1917]">{t("journal_title") as string}</h1>
        </div>
        <button
          onClick={handleOpenNew}
          className="p-2 bg-[#1C1917] text-white rounded-xl active:scale-95 transition-all"
        >
          <PenLine className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-xl mx-auto px-6 py-8">
        {entries.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
            <PenLine className="w-12 h-12 mx-auto mb-4 text-[#1C1917]/10" />
            <p className="text-[#1C1917]/40 font-medium">{t("no_entries") as string}</p>
            <button
              onClick={handleOpenNew}
              className="mt-4 text-[#6B4EE0] font-bold text-sm"
            >
              {t("write_first_thought") as string}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => (
              <div key={entry.id}>
                {animationsEnabled ? (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
                  >
                    <JournalEntryContent entry={entry} formatDate={formatDate} handleEdit={handleEdit} handleDelete={handleDelete} />
                  </motion.div>
                ) : (
                  <div
                    className="bg-white rounded-[28px] border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
                  >
                    <JournalEntryContent entry={entry} formatDate={formatDate} handleEdit={handleEdit} handleDelete={handleDelete} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Entry Sheet */}
      <AnimatePresence>
        {showSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1C1917]/20 backdrop-blur-sm z-50"
              onClick={() => setShowSheet(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 z-[60] bg-white rounded-t-[40px] shadow-2xl p-8 pb-12 max-w-xl mx-auto"
            >
              <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />

              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#1C1917]">
                  {editingId ? t("edit_note") : t("how_feeling") as string}
                </h2>
                <button onClick={() => setShowSheet(false)} className="p-2 bg-gray-50 rounded-full text-gray-400">
                  <X size={20} />
                </button>
              </div>

              {/* Mood Selector */}
              <div className="flex justify-between gap-2 mb-8">
                {moods.map((m) => (
                  <button
                    key={m.icon}
                    onClick={() => setSelectedMood(m.icon)}
                    className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                      selectedMood === m.icon
                        ? "border-[#1C1917] bg-[#1C1917] text-white"
                        : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-100"
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight opacity-80">{m.label}</span>
                  </button>
                ))}
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("write_placeholder") as string}
                autoFocus
                className="w-full min-h-[160px] p-6 rounded-3xl bg-gray-50 border-none focus:ring-2 focus:ring-[#1C1917]/5 text-[#1C1917] font-medium resize-none placeholder:text-gray-300 mb-4"
              />

              {/* Attachments Preview in Editor */}
              {attachments.length > 0 && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 relative group">
                      {att.type === 'image' ? (
                        <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                      ) : att.type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-black/5">
                          <Video size={20} className="text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/5">
                          <FileText size={20} className="text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/40 text-white rounded-full backdrop-blur-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mb-6">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,application/pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-[#1C1917]/60 font-bold text-sm active:scale-95 transition-all"
                >
                  <Paperclip size={18} />
                  {t("attach_files") as string || "Joindre"}
                </button>
              </div>

              <button
                onClick={handleSave}
                disabled={!text.trim()}
                className={`w-full py-4.5 rounded-2xl font-bold text-lg shadow-xl transition-all active:scale-95 ${
                  text.trim() ? "bg-[#1C1917] text-white shadow-gray-200" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {editingId ? t("update_note") : t("save_entry") as string}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
