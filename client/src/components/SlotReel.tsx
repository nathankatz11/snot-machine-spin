import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SlotReelProps {
  symbol: number;
  spinning: boolean;
  delay?: number;
}

const SYMBOLS = [1, 2, 3, 4];
const SYMBOL_HEIGHT = 120; // px per symbol

export function SlotReel({ symbol, spinning, delay = 0 }: SlotReelProps) {
  const [currentY, setCurrentY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (spinning) {
      // Start spinning after staggered delay
      const startTimer = setTimeout(() => {
        setIsAnimating(true);
      }, delay * 150);

      return () => clearTimeout(startTimer);
    } else if (isAnimating) {
      // Stop spinning and land on target symbol after staggered delay
      const stopTimer = setTimeout(() => {
        setIsAnimating(false);
        // Calculate final position (symbol 1 = 0, symbol 2 = -SYMBOL_HEIGHT, etc.)
        setCurrentY(-(symbol - 1) * SYMBOL_HEIGHT);
      }, delay * 200);

      return () => clearTimeout(stopTimer);
    }
  }, [spinning, symbol, delay, isAnimating]);

  const getImageSrc = (id: number) => {
    return `/images/booger-${id}.png`;
  };

  // Calculate the target Y based on whether we're spinning or stopped
  const targetY = isAnimating ? currentY : -(symbol - 1) * SYMBOL_HEIGHT;

  return (
    <div 
      className="relative w-full bg-gradient-to-b from-lime-50 to-green-100 rounded-2xl border-4 border-green-300 overflow-hidden shadow-[inset_0_4px_20px_rgba(0,0,0,0.15)]"
      style={{ height: `${SYMBOL_HEIGHT}px` }}
    >
      {/* Reel strip container */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="flex flex-col"
          initial={{ y: 0 }}
          animate={
            isAnimating
              ? {
                  y: [0, -SYMBOL_HEIGHT * SYMBOLS.length * 2],
                }
              : {
                  y: targetY,
                }
          }
          transition={
            isAnimating
              ? {
                  duration: 0.3,
                  repeat: Infinity,
                  ease: "linear",
                }
              : {
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }
          }
        >
          {/* Repeat symbols multiple times for seamless looping */}
          {[...SYMBOLS, ...SYMBOLS, ...SYMBOLS].map((sym, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-full flex items-center justify-center p-3"
              style={{ height: `${SYMBOL_HEIGHT}px` }}
            >
              <img
                src={getImageSrc(sym)}
                alt={`Booger ${sym}`}
                className="w-full h-full object-contain drop-shadow-lg"
                draggable={false}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Top shadow overlay */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-black/30 to-transparent pointer-events-none z-10" />
      
      {/* Bottom shadow overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-10" />
      
      {/* Glass shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none z-20" />
    </div>
  );
}
