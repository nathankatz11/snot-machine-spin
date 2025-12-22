import { useState, useEffect } from "react";
import { SlotReel } from "@/components/SlotReel";
import { GameControls } from "@/components/GameControls";
import { HighScoreList } from "@/components/HighScoreList";
import { useCreateScore } from "@/hooks/use-scores";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Game Config
const SPIN_COST = 5;
const INITIAL_BALANCE = 100;

export default function Home() {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [reels, setReels] = useState<[number, number, number]>([1, 2, 3]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [playerName, setPlayerName] = useState("");
  
  const createScore = useCreateScore();

  const [reelsComplete, setReelsComplete] = useState(0);

  const handleSpin = () => {
    if (balance < SPIN_COST || isSpinning) return;

    setBalance(prev => prev - SPIN_COST);
    setIsSpinning(true);
    setLastWin(0);
    setReelsComplete(0);

    // Weighted Randomness: 1-4 (Common to Rare), 5 = Jackpot (very rare)
    const spinReel = () => {
      const rand = Math.random();
      if (rand < 0.35) return 1;      // 35% - Slime blob
      if (rand < 0.60) return 2;      // 25% - Runny nose
      if (rand < 0.80) return 3;      // 20% - Tissue box
      if (rand < 0.95) return 4;      // 15% - Used tissue
      return 5;                        // 5% - Golden booger (jackpot symbol)
    };

    const newReels: [number, number, number] = [spinReel(), spinReel(), spinReel()];
    setReels(newReels);

    // Stop spinning after a short time (reels will animate to final position)
    setTimeout(() => {
      setIsSpinning(false);
    }, 800);
  };

  // Check for win when all reels complete their animation
  useEffect(() => {
    if (!isSpinning && reelsComplete === 3) {
      checkWin(reels);
      setReelsComplete(0);
    }
  }, [reelsComplete, isSpinning]);

  const handleReelComplete = () => {
    setReelsComplete(prev => prev + 1);
  };

  const checkWin = (currentReels: number[]) => {
    const [r1, r2, r3] = currentReels;
    let winAmount = 0;

    // Only 3 matching symbols wins! (like a real slot machine)
    if (r1 === r2 && r2 === r3) {
      // Jackpot: 3 Golden Boogers (5s)
      if (r1 === 5) {
        winAmount = 100;
        fireJackpotConfetti();
      }
      // 3 Used Tissues
      else if (r1 === 4) {
        winAmount = 50;
        fireConfetti();
      }
      // 3 Tissue Boxes
      else if (r1 === 3) {
        winAmount = 30;
        fireConfetti();
      }
      // 3 Runny Noses
      else if (r1 === 2) {
        winAmount = 20;
        fireConfetti();
      }
      // 3 Slime Blobs
      else {
        winAmount = 15;
        fireConfetti();
      }
    }

    if (winAmount > 0) {
      setLastWin(winAmount);
      setBalance(prev => prev + winAmount);

      // Only prompt for high score on big wins
      if (winAmount >= 50) {
        setTimeout(() => setShowWinDialog(true), 1000);
      }
    }
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#84cc16', '#eab308', '#ec4899']
    });
  };

  const fireJackpotConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#84cc16', '#eab308']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#84cc16', '#eab308']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleRefill = () => {
    setBalance(100);
    fireConfetti(); // Little celebration for getting help
  };

  const handleSaveScore = async () => {
    if (!playerName.trim()) return;
    
    try {
      await createScore.mutateAsync({
        name: playerName,
        value: balance // Save current total balance as score
      });
      setShowWinDialog(false);
      setPlayerName("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col lg:flex-row items-start justify-center gap-8 lg:gap-12">
      
      {/* Main Game Area */}
      <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-5xl md:text-7xl font-display font-black text-primary drop-shadow-lg tracking-wider transform -rotate-2">
            SNOT MACHINE
          </h1>
          <p className="text-lg text-muted-foreground font-medium flex items-center justify-center gap-2">
            Match the boogers, win the tissues! 
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-5 h-5 text-accent cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-left">
                <p>3 Slime Blobs: 15 Tissues</p>
                <p>3 Runny Noses: 20 Tissues</p>
                <p>3 Tissue Boxes: 30 Tissues</p>
                <p>3 Used Tissues: 50 Tissues</p>
                <p>3 Golden Boogers: 100 Tissues (Jackpot!)</p>
              </TooltipContent>
            </Tooltip>
          </p>
        </header>

        {/* Slot Machine Container with Handle */}
        <div className="flex items-stretch gap-0">
          {/* Main Machine */}
          <div className="bg-gradient-to-b from-green-500 to-green-700 p-4 md:p-8 rounded-l-[3rem] shadow-2xl relative border-b-8 border-green-900 flex-1">
            
            {/* Decorative screws */}
            <div className="absolute top-6 left-6 w-4 h-4 bg-gray-300 rounded-full shadow-inner border border-gray-400" />
            <div className="absolute top-6 right-6 w-4 h-4 bg-gray-300 rounded-full shadow-inner border border-gray-400" />
            <div className="absolute bottom-6 left-6 w-4 h-4 bg-gray-300 rounded-full shadow-inner border border-gray-400" />
            <div className="absolute bottom-6 right-6 w-4 h-4 bg-gray-300 rounded-full shadow-inner border border-gray-400" />

            {/* Reels Display */}
            <div className="bg-black/20 p-4 rounded-[2rem] mb-8">
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                <SlotReel symbol={reels[0]} spinning={isSpinning} delay={0} onSpinComplete={handleReelComplete} />
                <SlotReel symbol={reels[1]} spinning={isSpinning} delay={1} onSpinComplete={handleReelComplete} />
                <SlotReel symbol={reels[2]} spinning={isSpinning} delay={2} onSpinComplete={handleReelComplete} />
              </div>
            </div>

          {/* Win Notification Overlay */}
          <AnimatePresence>
            {lastWin > 0 && !isSpinning && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
              >
                <div className="bg-accent text-accent-foreground font-display font-black text-4xl md:text-6xl px-8 py-4 rounded-full shadow-xl border-4 border-white whitespace-nowrap animate-bounce-custom">
                  +{lastWin} Tissues!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

            <GameControls 
              onSpin={handleSpin}
              onRefill={handleRefill}
              canSpin={balance >= SPIN_COST}
              isSpinning={isSpinning}
              balance={balance}
            />
          </div>

          {/* Pull Handle */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-gray-600 to-gray-800 w-16 md:w-20 rounded-r-2xl border-b-8 border-gray-900 relative">
            {/* Handle Track */}
            <div className="absolute top-8 bottom-8 w-3 bg-gray-900 rounded-full" />
            
            {/* Handle Arm */}
            <motion.button
              onClick={() => {
                if (balance >= SPIN_COST && !isSpinning) {
                  handleSpin();
                }
              }}
              disabled={balance < SPIN_COST || isSpinning}
              className="relative z-10 cursor-pointer disabled:cursor-not-allowed"
              whileTap={balance >= SPIN_COST && !isSpinning ? { y: 60 } : {}}
              animate={isSpinning ? { y: [0, 60, 0] } : { y: 0 }}
              transition={isSpinning ? { duration: 0.5, ease: "easeInOut" } : { type: "spring", stiffness: 300, damping: 20 }}
            >
              {/* Handle Pole */}
              <div className="w-4 h-20 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full shadow-lg" />
              
              {/* Handle Ball */}
              <div className="w-12 h-12 md:w-14 md:h-14 -mt-2 mx-auto rounded-full bg-gradient-to-br from-red-400 via-red-500 to-red-700 border-4 border-red-800 shadow-xl flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white/40" />
              </div>
            </motion.button>

            {/* Base */}
            <div className="absolute bottom-4 w-10 h-6 bg-gray-700 rounded-t-lg" />
          </div>
        </div>
      </div>

      {/* Sidebar / High Scores */}
      <div className="w-full lg:w-auto flex justify-center lg:sticky lg:top-8">
        <HighScoreList />
      </div>

      {/* Save Score Dialog */}
      <Dialog open={showWinDialog} onOpenChange={setShowWinDialog}>
        <DialogContent className="sm:max-w-md bg-white border-4 border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-3xl font-display text-center text-primary">Huge Sneeze! 🤧</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center text-muted-foreground">
              You've collected a massive pile of <span className="font-bold text-foreground">{balance} tissues</span>!
              <br />Enter your name to join the Snotty Hall of Fame.
            </div>
            <div className="space-y-2">
              <Input
                placeholder="Your Name (e.g. Booger Ben)"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="text-lg h-12 text-center border-2 border-primary/30 focus:border-primary"
                maxLength={15}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              onClick={handleSaveScore}
              disabled={!playerName.trim() || createScore.isPending}
              className="w-full sm:w-auto px-8 py-6 text-xl font-display bg-primary hover:bg-primary/90"
            >
              {createScore.isPending ? "Saving..." : "Save My Score!"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
