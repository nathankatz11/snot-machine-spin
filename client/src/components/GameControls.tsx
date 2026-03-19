import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, RotateCw, Flame, ChevronUp, ChevronDown } from "lucide-react";

interface GameControlsProps {
  onSpin: () => void;
  onRefill: () => void;
  canSpin: boolean;
  isSpinning: boolean;
  balance: number;
  bet: number;
  onBetChange: (bet: number) => void;
  streak: number;
  multiplier: number;
  isFreeSpinMode?: boolean;
  freeSpinsLeft?: number;
}

const BET_OPTIONS = [5, 10, 25];

export function GameControls({
  onSpin, onRefill, canSpin, isSpinning, balance,
  bet, onBetChange, streak, multiplier, isFreeSpinMode, freeSpinsLeft
}: GameControlsProps) {
  const betIndex = BET_OPTIONS.indexOf(bet);

  const cycleBetUp = () => {
    if (isFreeSpinMode) return;
    const next = BET_OPTIONS[(betIndex + 1) % BET_OPTIONS.length];
    if (next <= balance) onBetChange(next);
  };

  const cycleBetDown = () => {
    if (isFreeSpinMode) return;
    const next = BET_OPTIONS[(betIndex - 1 + BET_OPTIONS.length) % BET_OPTIONS.length];
    onBetChange(next);
  };

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-md mx-auto">

      {/* Balance + Streak Row */}
      <div className="flex items-center gap-2 sm:gap-3 w-full justify-center flex-wrap">
        {/* Balance Display */}
        <div className="bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 border-primary/20 shadow-lg flex items-center gap-2 sm:gap-3">
          <div className="bg-yellow-100 p-1.5 sm:p-2 rounded-full">
            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Tissues</span>
            <span className="text-xl sm:text-2xl font-black font-display text-primary leading-none">{balance}</span>
          </div>
        </div>

        {/* Streak Indicator */}
        <AnimatePresence>
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="bg-gradient-to-r from-orange-500 to-red-500 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg flex items-center gap-1.5 sm:gap-2 border-2 border-orange-300"
            >
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-200 animate-pulse" />
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-orange-100 tracking-wider">Streak</span>
                <span className="text-base sm:text-lg font-black font-display text-white leading-none">{streak}x</span>
              </div>
              {multiplier > 1 && (
                <span className="text-[10px] sm:text-xs font-bold text-yellow-200 bg-black/20 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {multiplier}x
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Free Spin Banner */}
      <AnimatePresence>
        {isFreeSpinMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full"
          >
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white text-center py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl font-display font-bold text-sm sm:text-lg tracking-wider animate-pulse shadow-lg shadow-purple-500/30">
              SNEEZE FRENZY! {freeSpinsLeft} FREE SPINS (2x)
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bet Selector + Action Buttons */}
      <div className="flex gap-2 sm:gap-3 items-center justify-center w-full">
        {/* Bet Selector */}
        {!isFreeSpinMode && balance >= BET_OPTIONS[0] && (
          <div className="flex flex-col items-center gap-0.5 sm:gap-1">
            <button onClick={cycleBetUp} className="text-primary hover:text-primary/70 transition-colors p-1" disabled={isSpinning}>
              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="bg-white/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border-2 border-primary/20 shadow-md text-center min-w-[60px] sm:min-w-[80px]">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Bet</span>
              <span className="text-lg sm:text-xl font-black font-display text-primary">{bet}</span>
            </div>
            <button onClick={cycleBetDown} className="text-primary hover:text-primary/70 transition-colors p-1" disabled={isSpinning}>
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {/* Main Action */}
        {balance < BET_OPTIONS[0] && !isFreeSpinMode ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1"
          >
            <Button
              onClick={onRefill}
              size="lg"
              className="w-full h-14 sm:h-20 text-lg sm:text-2xl font-display uppercase tracking-widest bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all rounded-2xl shadow-xl shadow-blue-500/20"
            >
              Get More Tissues!
            </Button>
          </motion.div>
        ) : (
          <Button
            onClick={onSpin}
            disabled={!canSpin || isSpinning}
            className={`
              relative overflow-hidden flex-1 max-w-[220px] sm:max-w-[280px] h-16 sm:h-24 text-2xl sm:text-3xl font-display font-black tracking-widest uppercase rounded-2xl sm:rounded-3xl
              transition-all duration-100 transform
              ${isFreeSpinMode
                ? isSpinning
                  ? 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-90'
                  : 'bg-gradient-to-b from-purple-500 to-purple-700 border-b-6 sm:border-b-8 border-purple-900 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/40 active:border-b-0 active:translate-y-1'
                : isSpinning
                  ? 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-90'
                  : 'bg-gradient-to-b from-primary to-green-600 border-b-6 sm:border-b-8 border-green-800 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/40 active:border-b-0 active:translate-y-1'
              }
              text-white shadow-xl
            `}
          >
            {isSpinning ? (
              <span className="flex items-center gap-2">Spinning...</span>
            ) : isFreeSpinMode ? (
              <span className="flex items-center gap-2 drop-shadow-md">
                FREE <RotateCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin-slow" />
              </span>
            ) : (
              <span className="flex items-center gap-2 drop-shadow-md">
                Spin <RotateCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin-slow" />
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          </Button>
        )}
      </div>

      {!isFreeSpinMode && (
        <div className="text-center text-xs sm:text-sm font-medium text-muted-foreground bg-white/50 px-3 sm:px-4 py-1 rounded-full">
          Cost: <span className="text-red-500 font-bold">{bet} Tissues</span>
        </div>
      )}
    </div>
  );
}
