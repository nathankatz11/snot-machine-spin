import { motion, AnimatePresence } from "framer-motion";

interface PaylineIndicatorProps {
  show: boolean;
  isJackpot?: boolean;
}

export function PaylineIndicator({ show, isJackpot }: PaylineIndicatorProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-40 pointer-events-none px-2"
          style={{ originX: 0 }}
        >
          <div className={`h-1.5 rounded-full ${isJackpot
            ? 'bg-gradient-to-r from-transparent via-yellow-400 to-transparent shadow-[0_0_20px_4px] shadow-yellow-400/60'
            : 'bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_12px_2px] shadow-white/60'
          }`} />
          {/* Left arrow */}
          <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0
            border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent
            ${isJackpot ? 'border-r-[12px] border-r-yellow-400' : 'border-r-[12px] border-r-white'}`}
          />
          {/* Right arrow */}
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0
            border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent
            ${isJackpot ? 'border-l-[12px] border-l-yellow-400' : 'border-l-[12px] border-l-white'}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
