import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface SlotReelProps {
  symbol: number;
  spinning: boolean;
  delay?: number;
  onSpinComplete?: () => void;
}

const SYMBOLS = [1, 2, 3, 4, 5];
const SYMBOL_HEIGHT = 100;

export function SlotReel({ symbol, spinning, delay = 0, onSpinComplete }: SlotReelProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [finalSymbol, setFinalSymbol] = useState(symbol);
  const hasCalledComplete = useRef(false);

  useEffect(() => {
    if (spinning) {
      hasCalledComplete.current = false;
      const startTimer = setTimeout(() => {
        setIsAnimating(true);
      }, delay * 80);

      return () => clearTimeout(startTimer);
    } else if (isAnimating) {
      const stopTimer = setTimeout(() => {
        setIsAnimating(false);
        setFinalSymbol(symbol);
        if (!hasCalledComplete.current && onSpinComplete) {
          hasCalledComplete.current = true;
          onSpinComplete();
        }
      }, delay * 120);

      return () => clearTimeout(stopTimer);
    }
  }, [spinning, symbol, delay, isAnimating, onSpinComplete]);

  useEffect(() => {
    if (!spinning && !isAnimating) {
      setFinalSymbol(symbol);
    }
  }, [symbol, spinning, isAnimating]);

  const getImageSrc = (id: number) => {
    return `/images/booger-${id}.png`;
  };

  const targetY = -(finalSymbol - 1) * SYMBOL_HEIGHT;

  return (
    <div 
      className="relative w-full bg-gradient-to-b from-lime-50 to-green-100 rounded-2xl border-4 border-green-300 overflow-hidden shadow-[inset_0_4px_20px_rgba(0,0,0,0.15)]"
      style={{ height: `${SYMBOL_HEIGHT}px` }}
    >
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
                  duration: 0.2,
                  repeat: Infinity,
                  ease: "linear",
                }
              : {
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }
          }
        >
          {[...SYMBOLS, ...SYMBOLS, ...SYMBOLS].map((sym, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-full flex items-center justify-center p-2"
              style={{ height: `${SYMBOL_HEIGHT}px` }}
            >
              <img
                src={getImageSrc(sym)}
                alt={`Symbol ${sym}`}
                className="w-full h-full object-contain drop-shadow-lg"
                draggable={false}
              />
            </div>
          ))}
        </motion.div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none z-20" />
    </div>
  );
}
