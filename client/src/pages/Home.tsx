import { useState, useEffect } from "react";
import { SlotReel } from "@/components/SlotReel";
import { GameControls } from "@/components/GameControls";
import { HighScoreList } from "@/components/HighScoreList";
import { MarqueeLights } from "@/components/MarqueeLights";
import { WinCounter } from "@/components/WinCounter";
import { PaylineIndicator } from "@/components/PaylineIndicator";
import { SlimeDrips } from "@/components/SlimeDrips";
import { ProgressiveJackpot, getJackpotPool, addToJackpotPool, resetJackpotPool } from "@/components/ProgressiveJackpot";
import { AchievementToast, type Achievement, checkAchievements } from "@/components/AchievementToast";
import { AchievementPanel } from "@/components/AchievementPanel";
import { useCreateScore } from "@/hooks/use-scores";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Volume2, VolumeX, Award } from "lucide-react";
import {
  playSpinStart, playReelStop, playWin, playJackpot, playLose, playRefill, playHandlePull,
  playAnticipation, playBonusTrigger, playFreeSpin, playStreakUp, playStreakBreak, playAchievement,
  startMusic, stopMusic,
} from "@/lib/sounds";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Game Config ───
const NUM_REELS = 5;
const INITIAL_BALANCE = 100;
const WILD_SYMBOL = 5; // Golden Booger is wild

// ─── Daily Bonus ───
function getDailyBonus(): number | null {
  const key = "snot-machine-daily";
  const today = new Date().toDateString();
  const last = localStorage.getItem(key);
  if (last === today) return null;
  localStorage.setItem(key, today);
  return 50 + Math.floor(Math.random() * 150);
}

// ─── Spin Count Persistence ───
function getTotalSpins(): number {
  try { return Number(localStorage.getItem("snot-machine-spins") || "0"); } catch { return 0; }
}
function saveTotalSpins(n: number) {
  localStorage.setItem("snot-machine-spins", String(n));
}

export default function Home() {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [reels, setReels] = useState<number[]>([1, 2, 3, 4, 5]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [isJackpot, setIsJackpot] = useState(false);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [bet, setBet] = useState(5);
  const [streak, setStreak] = useState(0);
  const [winMultiplier, setWinMultiplier] = useState(1);
  const [musicOn, setMusicOn] = useState(false);
  const [winningReels, setWinningReels] = useState<boolean[]>(Array(NUM_REELS).fill(false));
  const [nearMissReels, setNearMissReels] = useState<boolean[]>(Array(NUM_REELS).fill(false));
  const [showPayline, setShowPayline] = useState(false);
  const [jackpotPool, setJackpotPool] = useState(getJackpotPool());
  const [totalSpins, setTotalSpins] = useState(getTotalSpins());
  const [screenShake, setScreenShake] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [hasWild, setHasWild] = useState(false);

  // Free Spin (Sneeze Frenzy) mode
  const [freeSpinMode, setFreeSpinMode] = useState(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState(0);

  // Daily bonus
  const [dailyBonusShown, setDailyBonusShown] = useState(false);
  const [dailyBonusAmount, setDailyBonusAmount] = useState(0);

  const createScore = useCreateScore();
  const [reelsComplete, setReelsComplete] = useState(0);
  const [lastScorePromptTime, setLastScorePromptTime] = useState(0);

  // ─── Daily Bonus on mount ───
  useEffect(() => {
    const bonus = getDailyBonus();
    if (bonus !== null) {
      setDailyBonusAmount(bonus);
      setDailyBonusShown(true);
      setBalance(prev => prev + bonus);
      setTimeout(() => {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 }, colors: ['#84cc16', '#eab308'] });
      }, 300);
    }
  }, []);

  // ─── Music Toggle ───
  const toggleMusic = () => {
    if (musicOn) {
      stopMusic();
      setMusicOn(false);
    } else {
      startMusic();
      setMusicOn(true);
    }
  };

  // ─── Streak Multiplier ───
  const getStreakMultiplier = (s: number) => {
    if (s >= 5) return 2.5;
    if (s >= 3) return 2;
    if (s >= 2) return 1.5;
    return 1;
  };

  // ─── Weighted Random Reel ───
  const spinReel = () => {
    const rand = Math.random();
    if (rand < 0.30) return 1;
    if (rand < 0.55) return 2;
    if (rand < 0.75) return 3;
    if (rand < 0.90) return 4;
    return 5;
  };

  // ─── Count Matches (with wilds) ───
  const countMatches = (reelValues: number[]) => {
    const positions = Array(NUM_REELS).fill(false);
    const counts: Record<number, number> = {};
    let wildCount = 0;

    for (const v of reelValues) {
      if (v === WILD_SYMBOL) {
        wildCount++;
      } else {
        counts[v] = (counts[v] || 0) + 1;
      }
    }

    let bestSymbol = 0;
    let bestCount = 0;
    for (const [sym, count] of Object.entries(counts)) {
      if (count > bestCount) {
        bestCount = count;
        bestSymbol = Number(sym);
      }
    }

    const totalMatch = bestCount + wildCount;

    if (bestCount === 0 && wildCount > 0) {
      for (let i = 0; i < reelValues.length; i++) positions[i] = true;
      return { matchCount: wildCount, matchSymbol: WILD_SYMBOL, wildCount, positions };
    }

    if (totalMatch >= 3) {
      for (let i = 0; i < reelValues.length; i++) {
        if (reelValues[i] === bestSymbol || reelValues[i] === WILD_SYMBOL) {
          positions[i] = true;
        }
      }
    }

    return { matchCount: totalMatch, matchSymbol: bestSymbol, wildCount, positions };
  };

  // ─── Handle Spin ───
  const handleSpin = () => {
    if (isSpinning) return;
    if (!freeSpinMode && balance < bet) return;

    if (!freeSpinMode) {
      setBalance(prev => prev - bet);
      const poolAdd = Math.ceil(bet * 0.1);
      addToJackpotPool(poolAdd);
      setJackpotPool(getJackpotPool());
    }

    setIsSpinning(true);
    setLastWin(0);
    setIsJackpot(false);
    setReelsComplete(0);
    setWinningReels(Array(NUM_REELS).fill(false));
    setNearMissReels(Array(NUM_REELS).fill(false));
    setShowPayline(false);
    setHasWild(false);
    playSpinStart();

    const newSpins = totalSpins + 1;
    setTotalSpins(newSpins);
    saveTotalSpins(newSpins);

    if (freeSpinMode) playFreeSpin();

    const newReels = Array.from({ length: NUM_REELS }, spinReel);
    setReels(newReels);

    setTimeout(() => {
      setIsSpinning(false);
    }, 800);
  };

  // ─── Check Win When Reels Complete ───
  useEffect(() => {
    if (!isSpinning && reelsComplete === NUM_REELS) {
      checkWin(reels);
      setReelsComplete(0);
    }
  }, [reelsComplete, isSpinning]);

  const handleReelComplete = () => {
    setReelsComplete(prev => prev + 1);
    playReelStop();
  };

  // ─── Anticipation sound when 2 reels match ───
  useEffect(() => {
    if (reelsComplete === 2 && isSpinning) {
      const first2 = reels.slice(0, 2);
      const nonWild = first2.filter(r => r !== WILD_SYMBOL);
      const allSame = nonWild.length === 0 || nonWild.every(r => r === nonWild[0]);
      if (allSame) playAnticipation();
    }
  }, [reelsComplete]);

  // ─── Check Win ───
  const checkWin = (currentReels: number[]) => {
    const { matchCount, matchSymbol, wildCount, positions } = countMatches(currentReels);
    let winAmount = 0;
    let isJack = false;
    const usedWild = wildCount > 0 && matchCount >= 3;

    if (matchCount >= 3) {
      if (matchCount === 5) {
        if (matchSymbol === WILD_SYMBOL || (wildCount >= 3 && matchSymbol === 0)) {
          winAmount = jackpotPool;
          isJack = true;
        } else {
          const payouts: Record<number, number> = { 1: 50, 2: 75, 3: 100, 4: 150 };
          winAmount = payouts[matchSymbol] || 50;
        }
      } else if (matchCount === 4) {
        if (matchSymbol === WILD_SYMBOL) {
          winAmount = 200;
          isJack = true;
        } else {
          const payouts: Record<number, number> = { 1: 25, 2: 35, 3: 50, 4: 75 };
          winAmount = payouts[matchSymbol] || 25;
        }
      } else if (matchCount === 3) {
        if (matchSymbol === WILD_SYMBOL) {
          winAmount = 100;
        } else {
          const payouts: Record<number, number> = { 1: 10, 2: 15, 3: 20, 4: 30 };
          winAmount = payouts[matchSymbol] || 10;
        }
      }

      // Bet multiplier
      winAmount = Math.round(winAmount * (bet / 5));
      // Free spin 2x
      if (freeSpinMode) winAmount *= 2;
      // Streak multiplier
      const streakMult = getStreakMultiplier(streak);
      if (streakMult > 1) winAmount = Math.round(winAmount * streakMult);

      setHasWild(usedWild);
      setIsJackpot(isJack);
      setWinningReels(positions);
      setShowPayline(true);

      if (isJack) {
        fireJackpotConfetti();
        playJackpot();
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 600);
        resetJackpotPool();
        setJackpotPool(getJackpotPool());
      } else if (winAmount >= 50) {
        fireConfetti();
        playWin("big");
      } else if (winAmount >= 20) {
        fireConfetti();
        playWin("medium");
      } else {
        playWin("small");
      }

      setLastWin(winAmount);
      setBalance(prev => prev + winAmount);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setWinMultiplier(getStreakMultiplier(newStreak));
      if (newStreak >= 2) playStreakUp();

      // Bonus trigger: 2+ wilds
      const wildCountInReels = currentReels.filter(r => r === WILD_SYMBOL).length;
      if (wildCountInReels >= 2 && !freeSpinMode) {
        setTimeout(() => triggerBonus(wildCountInReels), 1500);
      }

      // Only prompt for score save on big wins, not during free spins, with 30s cooldown
      const now = Date.now();
      if (winAmount >= 200 && !freeSpinMode && now - lastScorePromptTime > 30000) {
        setLastScorePromptTime(now);
        setTimeout(() => setShowWinDialog(true), 2000);
      }

      // Achievements
      const ach = checkAchievements({
        totalSpins,
        streak: newStreak,
        balance: balance + winAmount,
        lastWin: winAmount,
        isJackpot: isJack,
        isBonusTriggered: false,
        bet,
        hasWild: usedWild,
      });
      if (ach) {
        playAchievement();
        setCurrentAchievement(ach);
      }
    } else {
      playLose();

      // Near-miss detection
      const nearMissPositions = Array(NUM_REELS).fill(false);
      const nmCounts: Record<number, number[]> = {};
      currentReels.forEach((v, i) => {
        if (!nmCounts[v]) nmCounts[v] = [];
        nmCounts[v].push(i);
      });
      for (const idxs of Object.values(nmCounts)) {
        if (idxs.length >= NUM_REELS - 2) {
          currentReels.forEach((_, i) => {
            if (!idxs.includes(i)) nearMissPositions[i] = true;
          });
          break;
        }
      }
      if (nearMissPositions.some(Boolean)) {
        setNearMissReels(nearMissPositions);
      }

      if (streak > 0) {
        if (streak >= 3) playStreakBreak();
        setStreak(0);
        setWinMultiplier(1);
      }

      const ach = checkAchievements({
        totalSpins,
        streak: 0,
        balance,
        lastWin: 0,
        isJackpot: false,
        isBonusTriggered: false,
        bet,
        hasWild: false,
      });
      if (ach) {
        playAchievement();
        setCurrentAchievement(ach);
      }
    }

    // Free spins countdown
    if (freeSpinMode) {
      const remaining = freeSpinsLeft - 1;
      setFreeSpinsLeft(remaining);
      if (remaining <= 0) {
        setTimeout(() => setFreeSpinMode(false), 2000);
      }
    }
  };

  // ─── Bonus Round: Sneeze Frenzy ───
  const triggerBonus = (wildCount: number) => {
    playBonusTrigger();
    const spins = wildCount >= 3 ? 10 : 5;
    setFreeSpinMode(true);
    setFreeSpinsLeft(spins);

    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#a855f7', '#ec4899', '#f59e0b', '#84cc16']
    });

    const ach = checkAchievements({
      totalSpins,
      streak,
      balance,
      lastWin,
      isJackpot: false,
      isBonusTriggered: true,
      bet,
      hasWild: true,
    });
    if (ach) {
      playAchievement();
      setCurrentAchievement(ach);
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
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#84cc16', '#eab308'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#84cc16', '#eab308'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  };

  const handleRefill = () => {
    const amount = 50 + Math.floor(Math.random() * 150);
    setBalance(prev => prev + amount);
    fireConfetti();
    playRefill();
  };

  const handleSaveScore = async () => {
    if (!playerName.trim()) return;
    try {
      await createScore.mutateAsync({ name: playerName, value: balance });
      setShowWinDialog(false);
      setPlayerName("");
    } catch (error) {
      console.error(error);
    }
  };

  // Clear win display after delay
  useEffect(() => {
    if (lastWin > 0 && !isSpinning) {
      const timer = setTimeout(() => {
        setShowPayline(false);
        setWinningReels(Array(NUM_REELS).fill(false));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [lastWin, isSpinning]);

  return (
    <div className={`min-h-screen p-2 sm:p-4 md:p-8 flex flex-col lg:flex-row items-start justify-center gap-4 sm:gap-8 lg:gap-12 overflow-x-hidden max-w-[100vw]
      ${screenShake ? 'animate-screen-shake' : ''}`}>

      {/* Achievement Toast */}
      <AchievementToast achievement={currentAchievement} onDone={() => setCurrentAchievement(null)} />

      {/* Achievement Panel */}
      <AchievementPanel open={showAchievements} onClose={() => setShowAchievements(false)} />

      {/* Main Game Area */}
      <div className="flex-1 w-full max-w-2xl mx-auto flex flex-col gap-3 sm:gap-6">

        {/* Header */}
        <header className="text-center space-y-1 sm:space-y-2">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-black text-primary drop-shadow-lg tracking-wider transform -rotate-2">
            SNOT MACHINE
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground font-medium flex items-center justify-center gap-2">
            Match the boogers, win the tissues!
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-5 h-5 text-accent cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-left space-y-1">
                <p className="font-bold text-xs">5 Reels — Match 3+ to Win!</p>
                <p>Golden Booger = WILD (substitutes any)</p>
                <hr className="border-white/20" />
                <p>3 of a kind: 10-30 tissues</p>
                <p>4 of a kind: 25-75 tissues</p>
                <p>5 of a kind: 50-150 tissues</p>
                <p>5 Wilds: PROGRESSIVE JACKPOT!</p>
                <hr className="border-white/20" />
                <p>2+ Wilds = SNEEZE FRENZY (free spins!)</p>
                <p>Win streaks = bonus multiplier!</p>
              </TooltipContent>
            </Tooltip>
          </p>

          {/* Top bar: Music + Achievements */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={toggleMusic}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors bg-white/50 px-3 py-1.5 rounded-full"
            >
              {musicOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {musicOn ? "Music On" : "Music Off"}
            </button>
            <button
              onClick={() => setShowAchievements(true)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-yellow-600 transition-colors bg-white/50 px-3 py-1.5 rounded-full"
            >
              <Award className="w-4 h-4" />
              Achievements
            </button>
          </div>
        </header>

        {/* Progressive Jackpot */}
        <ProgressiveJackpot jackpotPool={jackpotPool} />

        {/* Daily Bonus Banner */}
        <AnimatePresence>
          {dailyBonusShown && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-r from-green-100 to-yellow-100 border-2 border-green-300 rounded-2xl p-3 text-center relative">
                <button
                  onClick={() => setDailyBonusShown(false)}
                  className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-lg font-bold"
                >x</button>
                <div className="font-display font-bold text-green-700">
                  Daily Bonus! +{dailyBonusAmount} Tissues!
                </div>
                <div className="text-xs text-green-600">Come back tomorrow for more!</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slot Machine Container with Handle */}
        <div className="flex items-stretch gap-0 overflow-hidden rounded-xl sm:rounded-[3rem_1rem_1rem_3rem]">
          {/* Main Machine */}
          <div className={`relative p-2 sm:p-4 md:p-8 rounded-l-[1.5rem] sm:rounded-l-[3rem] shadow-2xl border-b-4 sm:border-b-8 flex-1 min-w-0 transition-all duration-500
            ${freeSpinMode
              ? 'bg-gradient-to-b from-purple-500 to-purple-700 border-purple-900'
              : 'bg-gradient-to-b from-green-500 to-green-700 border-green-900'
            }`}
          >
            {/* Marquee Lights */}
            <MarqueeLights isJackpot={isJackpot} isFreeSpinMode={freeSpinMode} />

            {/* Slime Drips */}
            <SlimeDrips />

            {/* Decorative screws — hidden on very small screens */}
            <div className="hidden sm:block absolute top-6 left-6 w-4 h-4 bg-gray-300 rounded-full shadow-inner border border-gray-400 z-40" />
            <div className="hidden sm:block absolute top-6 right-6 w-4 h-4 bg-gray-300 rounded-full shadow-inner border border-gray-400 z-40" />
            <div className="hidden sm:block absolute bottom-6 left-6 w-4 h-4 bg-gray-300 rounded-full shadow-inner border border-gray-400 z-40" />
            <div className="hidden sm:block absolute bottom-6 right-6 w-4 h-4 bg-gray-300 rounded-full shadow-inner border border-gray-400 z-40" />

            {/* Scrolling Marquee Text */}
            <div className="bg-black/30 rounded-lg sm:rounded-xl mb-2 sm:mb-4 overflow-hidden h-5 sm:h-7 flex items-center relative">
              <div className={`animate-marquee whitespace-nowrap font-display font-bold text-[10px] sm:text-sm tracking-wider
                ${freeSpinMode ? 'text-pink-200' : 'text-yellow-200'}`}>
                {freeSpinMode
                  ? "SNEEZE FRENZY! ALL WINS DOUBLED! FREE SPINS! SNEEZE FRENZY! ALL WINS DOUBLED!"
                  : isJackpot
                    ? "JACKPOT!!! JACKPOT!!! JACKPOT!!! JACKPOT!!! JACKPOT!!!"
                    : "SNOT MACHINE  Match 3+ symbols to win!  Golden Booger = WILD!  2+ Wilds = FREE SPINS!"}
              </div>
            </div>

            {/* Reels Display */}
            <div className="bg-black/20 p-1.5 sm:p-3 md:p-4 rounded-lg sm:rounded-[2rem] mb-3 sm:mb-6 relative">
              <div className="grid grid-cols-5 gap-0.5 sm:gap-1.5 md:gap-3">
                {reels.map((symbol, i) => (
                  <SlotReel
                    key={i}
                    symbol={symbol}
                    spinning={isSpinning}
                    delay={i}
                    onSpinComplete={handleReelComplete}
                    isWinning={winningReels[i]}
                    isNearMiss={nearMissReels[i]}
                    isFreeSpinMode={freeSpinMode}
                  />
                ))}
              </div>

              {/* Payline Indicator */}
              <PaylineIndicator show={showPayline} isJackpot={isJackpot} />
            </div>

            {/* Win Counter Overlay */}
            <WinCounter targetAmount={lastWin} visible={lastWin > 0 && !isSpinning} isJackpot={isJackpot} />

            <GameControls
              onSpin={handleSpin}
              onRefill={handleRefill}
              canSpin={freeSpinMode || balance >= bet}
              isSpinning={isSpinning}
              balance={balance}
              bet={bet}
              onBetChange={setBet}
              streak={streak}
              multiplier={winMultiplier}
              isFreeSpinMode={freeSpinMode}
              freeSpinsLeft={freeSpinsLeft}
            />
          </div>

          {/* Pull Handle */}
          <div className={`flex flex-col items-center justify-center w-10 sm:w-16 md:w-20 rounded-r-xl sm:rounded-r-2xl border-b-4 sm:border-b-8 relative flex-shrink-0 transition-all duration-500
            ${freeSpinMode
              ? 'bg-gradient-to-b from-purple-600 to-purple-800 border-purple-900'
              : 'bg-gradient-to-b from-gray-600 to-gray-800 border-gray-900'
            }`}>
            <div className="absolute top-4 sm:top-8 bottom-4 sm:bottom-8 w-2 sm:w-3 bg-gray-900 rounded-full" />

            <motion.button
              onClick={() => {
                if ((freeSpinMode || balance >= bet) && !isSpinning) {
                  playHandlePull();
                  handleSpin();
                }
              }}
              disabled={(!freeSpinMode && balance < bet) || isSpinning}
              className="relative z-10 cursor-pointer disabled:cursor-not-allowed"
              whileTap={(freeSpinMode || balance >= bet) && !isSpinning ? { y: 40 } : {}}
              animate={isSpinning ? { y: [0, 40, 0] } : { y: 0 }}
              transition={isSpinning ? { duration: 0.5, ease: "easeInOut" } : { type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="w-2 sm:w-4 h-10 sm:h-20 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full shadow-lg" />
              <div className={`w-7 h-7 sm:w-12 sm:h-12 md:w-14 md:h-14 -mt-1 sm:-mt-2 mx-auto rounded-full border-2 sm:border-4 shadow-xl flex items-center justify-center
                ${freeSpinMode
                  ? 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700 border-purple-800'
                  : 'bg-gradient-to-br from-red-400 via-red-500 to-red-700 border-red-800'
                }`}>
                <div className="w-2 h-2 sm:w-4 sm:h-4 rounded-full bg-white/40" />
              </div>
            </motion.button>

            <div className="absolute bottom-2 sm:bottom-4 w-6 sm:w-10 h-3 sm:h-6 bg-gray-700 rounded-t-lg" />
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
            <DialogTitle className="text-3xl font-display text-center text-primary">
              {isJackpot ? "MEGA JACKPOT!!!" : "Huge Sneeze!"} {isJackpot ? "🎰" : "🤧"}
            </DialogTitle>
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
