import { useEffect, useState } from "react";

interface Drip {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export function SlimeDrips() {
  const [drips, setDrips] = useState<Drip[]>([]);

  useEffect(() => {
    const initial: Drip[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: 10 + Math.random() * 80,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: 4 + Math.random() * 8,
    }));
    setDrips(initial);
  }, []);

  return (
    <div className="absolute top-0 left-0 right-0 h-20 pointer-events-none z-20 overflow-hidden">
      {drips.map(drip => (
        <div
          key={drip.id}
          className="absolute top-0 animate-drip"
          style={{
            left: `${drip.left}%`,
            animationDelay: `${drip.delay}s`,
            animationDuration: `${drip.duration}s`,
          }}
        >
          {/* Drip blob */}
          <div
            className="rounded-full bg-gradient-to-b from-green-400 to-green-600 opacity-70"
            style={{ width: `${drip.size}px`, height: `${drip.size * 1.5}px` }}
          />
        </div>
      ))}
    </div>
  );
}
