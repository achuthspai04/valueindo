"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, FileMinus, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STORAGE_KEY = "valueindo-answers";

function loadAnswers(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

function saveAnswer(key: string, value: string) {
  const current = loadAnswers();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, [key]: value }));
}

const options: { text: string; icon: LucideIcon }[] = [
  { text: "Yes", icon: FileText },
  { text: "No", icon: FileMinus },
  { text: "They said it would come later", icon: Clock },
];

export default function OptionalQ8Page() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [savedValue, setSavedValue] = useState<string>("");

  useEffect(() => {
    setSavedValue(loadAnswers().offer_letter ?? "");
  }, []);

  function handleSelect(text: string) {
    setSelected(text);
    saveAnswer("offer_letter", text);
    setTimeout(() => router.push(`/result/${crypto.randomUUID()}`), 280);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-inter)" }}>
      <nav className="flex items-center px-6 sm:px-10 py-[18px] border-b border-[#f3f4f6]">
        <Link
          href="/"
          className="text-[15px] font-bold tracking-[-0.3px] text-[#0f0f0f]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          value<span className="text-[#E8380D]">indo</span>?
        </Link>
      </nav>

      <div className="flex-1 flex flex-col px-6 sm:px-16 pt-24 pb-16 max-w-[680px] w-full mx-auto">

        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[12px] text-[#9ca3af] hover:text-[#0f0f0f] transition-colors bg-transparent border-0 cursor-pointer"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-24 sm:w-32 h-[3px] bg-[#f3f4f6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E8380D] rounded-full transition-[width] duration-500 ease-out"
                style={{ width: "100%" }}
              />
            </div>
            <span className="text-[12px] text-[#9ca3af] tabular-nums">optional 2 of 2</span>
          </div>
        </div>

        <p className="text-[11px] font-semibold text-[#E8380D] tracking-[0.1em] uppercase mb-3.5">
          Paperwork
        </p>

        <p
          className="text-[22px] sm:text-[26px] text-[#0f0f0f] leading-[1.3] mb-7"
          style={{ fontFamily: "var(--font-instrument)" }}
        >
          Did they provide a formal offer letter or written agreement?
        </p>

        <div className="flex flex-col gap-[10px]">
          {options.map(({ text, icon: Icon }) => {
            const isSelected = selected === text || (!selected && savedValue === text);
            return (
              <button
                key={text}
                type="button"
                onClick={() => handleSelect(text)}
                className={`flex items-center gap-3.5 w-full text-left px-[18px] py-[14px] rounded-[10px] border-[1.5px] transition-all duration-150 cursor-pointer
                  ${isSelected
                    ? "border-[#E8380D] bg-[#fff5f3]"
                    : "border-[#e5e7eb] bg-white hover:border-[#0f0f0f] hover:bg-[#fafafa]"
                  }`}
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className={`shrink-0 transition-colors ${isSelected ? "text-[#E8380D]" : "text-[#9ca3af]"}`}
                />
                <span className={`text-[14px] font-medium leading-snug transition-colors ${isSelected ? "text-[#0f0f0f]" : "text-[#374151]"}`}>
                  {text}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => router.push(`/result/${crypto.randomUUID()}`)}
            className="text-[12px] text-[#9ca3af] hover:text-[#6b7280] underline underline-offset-[3px] bg-transparent border-0 cursor-pointer transition-colors"
          >
            skip — analyse anyway
          </button>
        </div>

      </div>
    </div>
  );
}
