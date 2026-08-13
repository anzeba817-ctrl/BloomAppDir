import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Home, Plus, Settings, MoreHorizontal, User, Book, LayoutDashboard } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useState, useRef, useEffect } from "react";

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const searchParams = new URLSearchParams(location.search);
  const currentMode = searchParams.get("mode") || "build";
  const modeColor = currentMode === "build" ? "#10B981" : "#8B5CF6";

  const navItems = [
    { path: "/dashboard", icon: Home, label: t("nav_dashboard") },
    {
      path: "/habit-create",
      icon: Plus,
      isCenter: true,
      state: { mode: currentMode }
    },
    { path: "more", icon: MoreHorizontal, label: "More" },
  ];

  const moreMenuItems = [
    { path: "/profile", icon: User, label: t("nav_profile") },
    { path: "/journal", icon: Book, label: t("nav_journal") },
    { path: "/dashboard", icon: LayoutDashboard, label: t("nav_dashboard") },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  // Close menu on navigation
  useEffect(() => {
    setIsMoreMenuOpen(false);
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    navigate(path + (currentMode ? `?mode=${currentMode}` : ""));
  };

  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex flex-col items-center px-6 pointer-events-none">
      {/* Floating Menu */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto mb-4 w-48 bg-white/90 backdrop-blur-2xl border border-white/20 rounded-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] overflow-hidden p-2 self-end mr-2"
          >
            {moreMenuItems.map((item, idx) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleNavigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 text-[#1C1917]/70 hover:bg-gray-50"
                  style={{ color: active ? modeColor : undefined }}
                >
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span className={`text-sm font-bold capitalize ${active ? "opacity-100" : "opacity-60"}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        id="dashboard-navigation"
        className="pointer-events-auto w-full max-w-md bg-white/80 backdrop-blur-2xl border border-white/20 rounded-[32px] shadow-[0_20px_40px_rgba(0,0,0,0.08)] flex items-center justify-around px-2 py-2 h-20"
      >
        {navItems.map((item, index) => {
          const isMore = item.path === "more";
          const active = isMore
            ? moreMenuItems.some(m => location.pathname === m.path && m.path !== "/dashboard")
            : location.pathname === item.path;

          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <div key={index} className="relative flex items-center justify-center -top-2">
                <motion.button
                  onClick={() => navigate(item.path, { state: item.state })}
                  className="text-white p-4.5 rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  style={{ backgroundColor: modeColor }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="h-7 w-7" strokeWidth={3} />
                </motion.button>
              </div>
            );
          }

          return (
            <button
              key={index}
              onClick={() => isMore ? setIsMoreMenuOpen(!isMoreMenuOpen) : handleNavigate(item.path)}
              className={`flex flex-col items-center justify-center transition-all relative ${
                active ? "" : "text-[#1C1917]/30"
              }`}
              style={{ color: active ? modeColor : undefined }}
            >
              <div className="relative flex flex-col items-center gap-1">
                <Icon
                  className={`h-6 w-6 transition-all duration-300 ${active ? "scale-110" : "scale-100"}`}
                  strokeWidth={active ? 2.5 : 2}
                />
                {active && (
                  <motion.div
                    layoutId="active-dot"
                    className="w-1 h-1 rounded-full mt-0.5"
                    style={{ backgroundColor: modeColor }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
