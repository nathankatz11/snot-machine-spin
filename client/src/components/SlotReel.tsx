import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface SlotReelProps {
  symbol: number;
  spinning: boolean;
  delay?: number;
}

const SYMBOLS = [
  "/images/booger-1.png",
  "/images/booger-2.png",
  "/images/booger-3.png",
  "/images/booger-4.png",
];

export function SlotReel({ symbol, spinning, delay = 0 }: SlotReelProps) {
  const [displaySymbol, setDisplaySymbol] = useState(symbol);
  
  // Effect to handle the spinning visual
  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (spinning) {
      // Start rapid cycling after delay
      timeout = setTimeout(() => {
        interval = setInterval(() => {
          setDisplaySymbol(Math.floor(Math.random() * 4) + 1);
        }, 100);
      }, delay * 100);
    } else {
      // Land on final symbol
      timeout = setTimeout(() => {
        setDisplaySymbol(symbol);
      }, delay * 500); // Stagger the stops
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [spinning, symbol, delay]);

  const getImageSrc = (id: number) => {
    // Safety check for ID range
    const safeId = Math.max(1, Math.min(4, id));
    return `/images/booger-${safeId}.png`;
  };

  return (
    <div className="relative w-full aspect-[2/3] bg-white rounded-2xl border-4 border-green-200 overflow-hidden shadow-inner flex items-center justify-center">
      {/* Background Track Lines */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100/50 to-white/50 pointer-events-none" />
      
      <motion.div
        animate={spinning ? { y: [0, -20, 0], filter: "blur(4px)" } : { y: 0, filter: "blur(0px)" }}
        transition={spinning ? { repeat: Infinity, duration: 0.1 } : { type: "spring", stiffness: 200, damping: 15 }}
        className="w-3/4 h-3/4 relative z-10 flex items-center justify-center"
      >
        <img 
          src={getImageSrc(displaySymbol)} 
          alt={`Booger Symbol ${displaySymbol}`}
          className="w-full h-full object-contain drop-shadow-md"
        />
      </motion.div>

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent pointer-events-none z-20" />
    </div>
  );
}
