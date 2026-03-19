import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onDone: () => void;
}

export function AchievementToast({ achievement, onDone }: AchievementToastProps) {
  useEffect(() => {
    if (achievement) {
      const timer = setTimeout(onDone, 4000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDone]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 sm:bottom-auto sm:left-auto sm:top-4 sm:right-4 z-[100] sm:max-w-sm"
        >
          <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 rounded-2xl p-3 sm:p-4 shadow-xl shadow-yellow-500/20 flex items-center gap-2 sm:gap-3">
            <div className="text-2xl sm:text-3xl">{achievement.icon}</div>
            <div className="min-w-0">
              <div className="font-display font-bold text-yellow-800 text-[10px] sm:text-sm uppercase tracking-wider">Achievement Unlocked!</div>
              <div className="font-bold text-gray-800 text-sm sm:text-base truncate">{achievement.title}</div>
              <div className="text-[10px] sm:text-xs text-gray-600">{achievement.description}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Achievement Definitions & Logic ───

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_win", title: "First Sneeze", description: "Win for the first time", icon: "🤧" },
  { id: "first_jackpot", title: "Golden Nose", description: "Hit the jackpot!", icon: "👃" },
  { id: "spins_100", title: "Spin Doctor", description: "Spin 100 times", icon: "🌀" },
  { id: "spins_500", title: "Spin Maniac", description: "Spin 500 times", icon: "🎰" },
  { id: "streak_3", title: "Hot Streak", description: "Win 3 times in a row", icon: "🔥" },
  { id: "streak_5", title: "On Fire!", description: "Win 5 times in a row", icon: "💥" },
  { id: "streak_10", title: "Unstoppable!", description: "Win 10 times in a row", icon: "⚡" },
  { id: "balance_500", title: "Tissue Hoarder", description: "Reach 500 tissues", icon: "🧻" },
  { id: "balance_1000", title: "Tissue Tycoon", description: "Reach 1,000 tissues", icon: "💰" },
  { id: "balance_5000", title: "Snot Baron", description: "Reach 5,000 tissues", icon: "👑" },
  { id: "bonus_triggered", title: "Sneeze Frenzy!", description: "Trigger the bonus round", icon: "🎉" },
  { id: "big_bet_win", title: "High Roller", description: "Win on a 25-tissue bet", icon: "🎲" },
  { id: "wild_win", title: "Wild Thing", description: "Win with a wild symbol", icon: "⭐" },
];

const STORAGE_KEY = "snot-machine-achievements";

function getUnlocked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch { return new Set(); }
}

function saveUnlocked(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

export function checkAchievements(state: {
  totalSpins: number;
  streak: number;
  balance: number;
  lastWin: number;
  isJackpot: boolean;
  isBonusTriggered: boolean;
  bet: number;
  hasWild: boolean;
}): Achievement | null {
  const unlocked = getUnlocked();
  let newAch: Achievement | null = null;

  const tryUnlock = (id: string) => {
    if (unlocked.has(id)) return;
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (ach && !newAch) {
      newAch = ach;
      unlocked.add(id);
    }
  };

  if (state.lastWin > 0) tryUnlock("first_win");
  if (state.isJackpot) tryUnlock("first_jackpot");
  if (state.totalSpins >= 100) tryUnlock("spins_100");
  if (state.totalSpins >= 500) tryUnlock("spins_500");
  if (state.streak >= 3) tryUnlock("streak_3");
  if (state.streak >= 5) tryUnlock("streak_5");
  if (state.streak >= 10) tryUnlock("streak_10");
  if (state.balance >= 500) tryUnlock("balance_500");
  if (state.balance >= 1000) tryUnlock("balance_1000");
  if (state.balance >= 5000) tryUnlock("balance_5000");
  if (state.isBonusTriggered) tryUnlock("bonus_triggered");
  if (state.lastWin > 0 && state.bet >= 25) tryUnlock("big_bet_win");
  if (state.hasWild) tryUnlock("wild_win");

  if (newAch) saveUnlocked(unlocked);
  return newAch;
}

export function getUnlockedAchievements(): Achievement[] {
  const unlocked = getUnlocked();
  return ACHIEVEMENTS.filter(a => unlocked.has(a.id));
}

export function getAllAchievements(): Achievement[] {
  return ACHIEVEMENTS;
}
