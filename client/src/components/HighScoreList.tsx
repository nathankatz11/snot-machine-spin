import { useScores } from "@/hooks/use-scores";
import { Trophy, Medal } from "lucide-react";
import { motion } from "framer-motion";

export function HighScoreList() {
  const { data: scores, isLoading } = useScores();

  // Sort scores descending just to be safe, though backend likely does it
  const sortedScores = scores?.sort((a, b) => b.value - a.value).slice(0, 10) || [];

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 border-4 border-yellow-200 shadow-xl shadow-yellow-500/10 w-full max-w-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-yellow-100 p-3 rounded-xl rotate-3">
          <Trophy className="w-6 h-6 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold font-display text-yellow-800">Snotty Champions</h2>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sortedScores.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground italic">
          No champions yet. Be the first!
        </div>
      ) : (
        <div className="space-y-3">
          {sortedScores.map((score, index) => (
            <motion.div
              key={score.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-yellow-50/50 to-transparent hover:from-yellow-100 transition-colors border border-transparent hover:border-yellow-200"
            >
              <div className="flex items-center gap-3">
                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                  ${index === 0 ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/50' : 
                    index === 1 ? 'bg-gray-300 text-gray-800' :
                    index === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-500'}
                `}>
                  {index + 1}
                </span>
                <span className="font-bold text-gray-700 truncate max-w-[120px]">{score.name}</span>
              </div>
              <div className="flex items-center gap-1 font-mono font-bold text-primary">
                {score.value}
                <Medal className="w-3 h-3 opacity-50" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
