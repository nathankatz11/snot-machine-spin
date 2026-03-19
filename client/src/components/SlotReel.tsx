import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface SlotReelProps {
  symbol: number;
  spinning: boolean;
  delay?: number;
  onSpinComplete?: () => void;
  isWinning?: boolean;
  isNearMiss?: boolean;
  isFreeSpinMode?: boolean;
}

const SYMBOLS = [1, 2, 3, 4, 5];

function useSymbolHeight() {
  const [height, setHeight] = useState(() => window.innerWidth < 640 ? 70 : 100);
  useEffect(() => {
    const onResize = () => setHeight(window.innerWidth < 640 ? 70 : 100);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return height;
}

export function SlotReel({ symbol, spinning, delay = 0, onSpinComplete, isWinning, isNearMiss, isFreeSpinMode }: SlotReelProps) {
  const SYMBOL_HEIGHT = useSymbolHeight();
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

  const getImageSrc = (id: number) => `/images/booger-${id}.png`;

  const targetY = -(finalSymbol - 1) * SYMBOL_HEIGHT;

  return (
    <div
      className={`relative w-full rounded-xl sm:rounded-2xl border-2 sm:border-4 overflow-hidden transition-all duration-300
        ${isFreeSpinMode
          ? 'bg-gradient-to-b from-purple-100 to-purple-200 border-purple-400 shadow-[inset_0_4px_20px_rgba(147,51,234,0.2)]'
          : 'bg-gradient-to-b from-lime-50 to-green-100 border-green-300 shadow-[inset_0_4px_20px_rgba(0,0,0,0.15)]'}
        ${isWinning ? 'ring-2 sm:ring-4 ring-yellow-400 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.6)] sm:shadow-[0_0_30px_rgba(234,179,8,0.6)]' : ''}
        ${isNearMiss ? 'animate-near-miss' : ''}
      `}
      style={{ height: `${SYMBOL_HEIGHT}px` }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="flex flex-col"
          initial={{ y: 0 }}
          animate={
            isAnimating
              ? { y: [0, -SYMBOL_HEIGHT * SYMBOLS.length * 2] }
              : { y: targetY }
          }
          transition={
            isAnimating
              ? { duration: 0.2, repeat: Infinity, ease: "linear" }
              : { type: "spring", stiffness: 400, damping: 30 }
          }
        >
          {[...SYMBOLS, ...SYMBOLS, ...SYMBOLS].map((sym, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-full flex items-center justify-center p-1 sm:p-2"
              style={{ height: `${SYMBOL_HEIGHT}px` }}
            >
              <motion.img
                src={getImageSrc(sym)}
                alt={`Symbol ${sym}`}
                className="w-full h-full object-contain drop-shadow-md sm:drop-shadow-lg"
                draggable={false}
                animate={
                  isWinning && sym === finalSymbol && !isAnimating
                    ? { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }
                    : {}
                }
                transition={
                  isWinning ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" } : {}
                }
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Top/bottom gradients */}
      <div className="absolute top-0 left-0 right-0 h-3 sm:h-4 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-3 sm:h-4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none z-20" />

      {/* Win glow overlay */}
      {isWinning && (
        <div className="absolute inset-0 bg-yellow-400/20 animate-pulse pointer-events-none z-30 rounded-xl sm:rounded-2xl" />
      )}
    </div>
  );
}
