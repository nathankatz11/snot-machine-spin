import { motion, AnimatePresence } from "framer-motion";
import { getAllAchievements, getUnlockedAchievements } from "./AchievementToast";
import { Award, X } from "lucide-react";

interface AchievementPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AchievementPanel({ open, onClose }: AchievementPanelProps) {
  const all = getAllAchievements();
  const unlocked = new Set(getUnlockedAchievements().map(a => a.id));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 30 }}
            className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl border-2 sm:border-4 border-yellow-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-600" />
                <h2 className="text-2xl font-display font-bold text-yellow-800">Achievements</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              {unlocked.size} / {all.length} unlocked
            </div>
            <div className="grid gap-2">
              {all.map(ach => {
                const isUnlocked = unlocked.has(ach.id);
                return (
                  <div
                    key={ach.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                      ${isUnlocked
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200 opacity-50 grayscale'
                      }`}
                  >
                    <span className="text-2xl">{isUnlocked ? ach.icon : "🔒"}</span>
                    <div>
                      <div className="font-bold text-sm">{ach.title}</div>
                      <div className="text-xs text-gray-500">{ach.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
