import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ProgressiveJackpotProps {
  jackpotPool: number;
}

const STORAGE_KEY = "snot-machine-jackpot-pool";

export function getJackpotPool(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) : 500;
  } catch { return 500; }
}

export function addToJackpotPool(amount: number) {
  const current = getJackpotPool();
  localStorage.setItem(STORAGE_KEY, String(current + amount));
}

export function resetJackpotPool() {
  localStorage.setItem(STORAGE_KEY, "500");
}

export function ProgressiveJackpot({ jackpotPool }: ProgressiveJackpotProps) {
  const [display, setDisplay] = useState(jackpotPool);

  useEffect(() => {
    if (display === jackpotPool) return;
    const diff = jackpotPool - display;
    const steps = Math.min(Math.abs(diff), 15);
    const inc = diff / steps;
    let current = display;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      current += inc;
      if (step >= steps) {
        current = jackpotPool;
        clearInterval(interval);
      }
      setDisplay(Math.round(current));
    }, 50);

    return () => clearInterval(interval);
  }, [jackpotPool]);

  return (
    <motion.div
      className="text-center"
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600 text-transparent bg-clip-text">
        <div className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-yellow-600/80">Progressive Jackpot</div>
        <div className="text-2xl sm:text-3xl md:text-4xl font-display font-black">
          {display.toLocaleString()} TISSUES
        </div>
      </div>
    </motion.div>
  );
}
