import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Coins, RotateCw } from "lucide-react";

interface GameControlsProps {
  onSpin: () => void;
  onRefill: () => void;
  canSpin: boolean;
  isSpinning: boolean;
  balance: number;
}

export function GameControls({ onSpin, onRefill, canSpin, isSpinning, balance }: GameControlsProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      
      {/* Balance Display */}
      <div className="bg-white/80 backdrop-blur-sm px-8 py-3 rounded-full border-2 border-primary/20 shadow-lg flex items-center gap-3">
        <div className="bg-yellow-100 p-2 rounded-full">
          <Coins className="w-6 h-6 text-yellow-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Tissues (Credits)</span>
          <span className="text-2xl font-black font-display text-primary">{balance}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 items-center justify-center w-full">
        {balance < 5 ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full"
          >
            <Button 
              onClick={onRefill}
              size="lg"
              className="w-full h-20 text-2xl font-display uppercase tracking-widest bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all rounded-2xl shadow-xl shadow-blue-500/20"
            >
              Get More Tissues!
            </Button>
          </motion.div>
        ) : (
          <Button
            onClick={onSpin}
            disabled={!canSpin || isSpinning}
            className={`
              relative overflow-hidden w-full max-w-[280px] h-24 text-3xl font-display font-black tracking-widest uppercase rounded-3xl
              transition-all duration-100 transform
              ${isSpinning 
                ? 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-90' 
                : 'bg-gradient-to-b from-primary to-green-600 border-b-8 border-green-800 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/40 active:border-b-0 active:translate-y-1'
              }
              text-white shadow-xl
            `}
          >
            {isSpinning ? (
              <span className="flex items-center gap-3">
                Spinning...
              </span>
            ) : (
              <span className="flex items-center gap-3 drop-shadow-md">
                Spin <RotateCw className="w-8 h-8 animate-spin-slow" />
              </span>
            )}
            
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          </Button>
        )}
      </div>

      <div className="text-center text-sm font-medium text-muted-foreground bg-white/50 px-4 py-1 rounded-full">
        Cost to spin: <span className="text-red-500 font-bold">5 Tissues</span>
      </div>
    </div>
  );
}
