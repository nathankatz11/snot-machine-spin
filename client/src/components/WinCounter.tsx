import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playTickUp } from "@/lib/sounds";

interface WinCounterProps {
  targetAmount: number;
  visible: boolean;
  isJackpot?: boolean;
}

export function WinCounter({ targetAmount, visible, isJackpot }: WinCounterProps) {
  const [displayAmount, setDisplayAmount] = useState(0);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!visible || targetAmount === 0) {
      setDisplayAmount(0);
      return;
    }

    setDisplayAmount(0);
    const steps = Math.min(targetAmount, 20);
    const increment = Math.max(1, Math.floor(targetAmount / steps));
    let current = 0;
    tickRef.current++;
    const thisTick = tickRef.current;

    const interval = setInterval(() => {
      if (thisTick !== tickRef.current) { clearInterval(interval); return; }
      current += increment;
      if (current >= targetAmount) {
        current = targetAmount;
        clearInterval(interval);
      }
      setDisplayAmount(current);
      playTickUp();
    }, 60);

    return () => clearInterval(interval);
  }, [targetAmount, visible]);

  return (
    <AnimatePresence>
      {visible && targetAmount > 0 && (
        <motion.div
          initial={{ scale: 0, rotate: -10, y: 20 }}
          animate={{ scale: 1, rotate: 0, y: 0 }}
          exit={{ scale: 0, y: -30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className={`
            font-display font-black text-2xl sm:text-4xl md:text-6xl px-4 sm:px-8 py-2 sm:py-4 rounded-full shadow-xl border-2 sm:border-4 border-white whitespace-nowrap
            ${isJackpot
              ? 'bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 text-white animate-pulse-glow'
              : 'bg-accent text-accent-foreground animate-bounce-custom'}
          `}>
            +{displayAmount} Tissues!
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
