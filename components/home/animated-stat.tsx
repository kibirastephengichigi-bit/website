"use client";

import { useEffect, useState } from "react";

export function AnimatedStat({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 36;
    const step = value / totalFrames;

    const timer = window.setInterval(() => {
      frame += 1;
      if (frame >= totalFrames) {
        setDisplayValue(value);
        window.clearInterval(timer);
        return;
      }

      setDisplayValue(Math.round(step * frame));
    }, 30);

    return () => window.clearInterval(timer);
  }, [value]);

  return (
    <>
      {displayValue}
      {suffix}
    </>
  );
}
