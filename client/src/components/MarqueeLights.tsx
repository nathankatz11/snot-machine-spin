import { useEffect, useState } from "react";

interface MarqueeLightsProps {
  isJackpot?: boolean;
  isFreeSpinMode?: boolean;
}

export function MarqueeLights({ isJackpot, isFreeSpinMode }: MarqueeLightsProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => f + 1);
    }, isJackpot ? 100 : 400);
    return () => clearInterval(interval);
  }, [isJackpot]);

  const colors = isFreeSpinMode
    ? ["bg-purple-400", "bg-pink-400", "bg-fuchsia-400"]
    : isJackpot
      ? ["bg-yellow-300", "bg-red-400", "bg-green-400", "bg-yellow-300"]
      : ["bg-yellow-300", "bg-red-400", "bg-green-400", "bg-blue-400"];

  const Light = ({ i, offset = 0 }: { i: number; offset?: number }) => {
    const isLit = (i + frame + offset) % 3 === 0;
    const color = colors[(i + offset) % colors.length];
    return (
      <div
        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 border border-black/20
          ${isLit ? `${color} shadow-[0_0_6px_1px] sm:shadow-[0_0_8px_2px] shadow-current scale-110` : 'bg-gray-500/40 scale-90'}`}
      />
    );
  };

  return (
    <>
      {/* Top row */}
      <div className="absolute top-0 left-0 right-0 flex justify-between px-4 sm:px-8 -translate-y-1/2 z-30 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => <Light key={`t-${i}`} i={i} />)}
        {/* Extra lights on wider screens */}
        <div className="hidden sm:contents">
          {Array.from({ length: 8 }).map((_, i) => <Light key={`te-${i}`} i={i + 12} />)}
        </div>
      </div>
      {/* Bottom row */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 sm:px-8 translate-y-1/2 z-30 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => <Light key={`b-${i}`} i={i} offset={1} />)}
        <div className="hidden sm:contents">
          {Array.from({ length: 8 }).map((_, i) => <Light key={`be-${i}`} i={i + 12} offset={1} />)}
        </div>
      </div>
      {/* Left column — hidden on small mobile */}
      <div className="hidden sm:flex absolute top-0 bottom-0 left-0 flex-col justify-between py-8 -translate-x-1/2 z-30 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => <Light key={`l-${i}`} i={i} offset={2} />)}
      </div>
      {/* Right column — hidden on small mobile */}
      <div className="hidden sm:flex absolute top-0 bottom-0 right-0 flex-col justify-between py-8 translate-x-1/2 z-30 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => <Light key={`r-${i}`} i={i} offset={3} />)}
      </div>
    </>
  );
}
