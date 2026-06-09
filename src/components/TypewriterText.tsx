"use client";

import { useEffect, useState } from "react";

const FULL_TEXT = "is it real or a trap?";

export default function TypewriterText() {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setDisplayed(FULL_TEXT.slice(0, i));
      if (i === FULL_TEXT.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 55);
    return () => clearInterval(interval);
  }, []);

  return (
    // block + min-h reserves the line height from the start — no layout shift
    <span className="block min-h-[1.12em] text-[#E8380D]">
      {displayed}
      {!done && (
        <span
          className="inline-block w-[2px] h-[0.85em] bg-[#E8380D] ml-0.5 align-middle animate-pulse"
          aria-hidden="true"
        />
      )}
    </span>
  );
}
