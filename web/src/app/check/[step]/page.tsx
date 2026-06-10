"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight, ArrowLeft,
  MessageCircle, School, Search, User,
  CheckCircle2, AlertCircle, MoreHorizontal,
  Banknote, BarChart2, Ban, Award, HelpCircle,
  Zap, Clock, CheckCircle,
  Users, FileText, Loader2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TOTAL = 6;
const STORAGE_KEY = "valueindo-answers";
type AnswerMap = Record<string, string>;

type Option = { text: string; icon: LucideIcon };

type Question =
  | {
      step: number; label: string; text: string; type: "text"; key: string;
      placeholder: string; hint: string; options?: never;
    }
  | {
      step: number; label: string; text: string; type: "radio"; key: string;
      options: Option[]; placeholder?: never; hint?: never;
    };

const questions: Question[] = [
  {
    step: 1,
    label: "Let's start",
    text: "What is the name of the company or organisation?",
    type: "text",
    key: "company",
    placeholder: "e.g. Acme Technologies Pvt. Ltd.",
    hint: "Type exactly as it appeared in the offer or message.",
  },
  {
    step: 2,
    label: "The offer",
    text: "How did this opportunity come to you?",
    type: "radio",
    key: "source",
    options: [
      { text: "They messaged me first — WhatsApp, LinkedIn, or email", icon: MessageCircle },
      { text: "My college gave them my contact", icon: School },
      { text: "I applied through a job platform", icon: Search },
      { text: "Someone I know referred me", icon: User },
    ],
  },
  {
    step: 3,
    label: "Money",
    text: "Did they ask you to pay anything at any point?",
    type: "radio",
    key: "payment",
    options: [
      { text: "No — they never asked me to pay", icon: CheckCircle2 },
      { text: "Yes — to register or apply", icon: AlertCircle },
      { text: "Yes — to confirm the offer", icon: AlertCircle },
      { text: "Yes — for training material or a kit", icon: AlertCircle },
      { text: "Yes — something else", icon: MoreHorizontal },
    ],
  },
  {
    step: 4,
    label: "Compensation",
    text: "What is the compensation offered?",
    type: "radio",
    key: "compensation",
    options: [
      { text: "Fixed monthly stipend", icon: Banknote },
      { text: "Performance or commission based", icon: BarChart2 },
      { text: "Unpaid", icon: Ban },
      { text: "Academic credits only", icon: School },
      { text: "Certificate only", icon: Award },
      { text: "Not mentioned at all", icon: HelpCircle },
    ],
  },
  {
    step: 5,
    label: "Pressure",
    text: "Were you pressured to confirm or respond quickly?",
    type: "radio",
    key: "pressure",
    options: [
      { text: "Yes — they gave me only a few hours", icon: Zap },
      { text: "Yes — within a day", icon: Clock },
      { text: "No deadline was given", icon: CheckCircle },
    ],
  },
  {
    step: 6,
    label: "Selection",
    text: "Was there any actual interview or selection process?",
    type: "radio",
    key: "interview",
    options: [
      { text: "Yes — a proper interview", icon: Users },
      { text: "Just a quick form or quiz", icon: FileText },
      { text: "No — the offer came instantly", icon: Zap },
      { text: "Not yet — still in process", icon: Loader2 },
    ],
  },
];

function loadAnswers(): AnswerMap {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

function saveAnswer(key: string, value: string) {
  const current = loadAnswers();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, [key]: value }));
}

export default function CheckStepPage() {
  const params = useParams();
  const router = useRouter();
  const stepNum = parseInt(params.step as string, 10);

  const [answers, setAnswers] = useState<AnswerMap>({});
  const [textValue, setTextValue] = useState("");
  const [validationMsg, setValidationMsg] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNaN(stepNum) || stepNum < 1 || stepNum > TOTAL) {
      router.replace("/check/1");
    }
  }, [stepNum, router]);

  useEffect(() => {
    const saved = loadAnswers();
    setAnswers(saved);
    setSelectedOption(null);
    setValidationMsg("");
    if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= TOTAL) {
      const q = questions[stepNum - 1];
      if (q.type === "text") {
        setTextValue(saved[q.key] ?? "");
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }
  }, [stepNum]);

  if (isNaN(stepNum) || stepNum < 1 || stepNum > TOTAL) return null;

  const q = questions[stepNum - 1];
  const progress = (stepNum / TOTAL) * 100;
  const isLast = stepNum === TOTAL;
  const nextPath = isLast ? "/check/upload" : `/check/${stepNum + 1}`;

  function advanceText() {
    const val = textValue.trim();
    if (!val) {
      setValidationMsg("Please enter the company name to continue.");
      inputRef.current?.focus();
      return;
    }
    saveAnswer(q.key, val);
    router.push(nextPath);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") advanceText();
  }

  function handleRadioClick(text: string) {
    setSelectedOption(text);
    saveAnswer(q.key, text);
    setTimeout(() => router.push(nextPath), 280);
  }

  const savedRadioValue = answers[q.key];

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "var(--font-inter)" }}>
      {/* Nav — logo only */}
      <nav className="flex items-center px-6 sm:px-10 py-[18px] border-b border-[#f3f4f6]">
        <Link
          href="/"
          className="text-[15px] font-bold tracking-[-0.3px] text-[#0f0f0f]"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          value<span className="text-[#E8380D]">indo</span>?
        </Link>
      </nav>

      {/* Form body */}
      <div className="flex-1 flex flex-col px-6 sm:px-16 pt-24 pb-16 max-w-[680px] w-full mx-auto">

        {/* Progress row — sits right above the question */}
        <div className="flex items-center justify-between mb-6">
          {stepNum > 1 ? (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-[12px] text-[#9ca3af] hover:text-[#0f0f0f] transition-colors bg-transparent border-0 cursor-pointer"
            >
              <ArrowLeft size={13} aria-hidden="true" />
              back
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-3">
            {/* Mini progress bar */}
            <div className="w-24 sm:w-32 h-[3px] bg-[#f3f4f6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E8380D] rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[12px] text-[#9ca3af] tabular-nums">{stepNum} of {TOTAL}</span>
          </div>
        </div>

        <p className="text-[11px] font-semibold text-[#E8380D] tracking-[0.1em] uppercase mb-3.5">
          {q.label}
        </p>

        <p
          className="text-[22px] sm:text-[26px] text-[#0f0f0f] leading-[1.3] mb-7"
          style={{ fontFamily: "var(--font-instrument)" }}
        >
          {q.text}
        </p>

        {/* Text input — Q1 */}
        {q.type === "text" && (
          <div>
            <input
              ref={inputRef}
              type="text"
              value={textValue}
              onChange={(e) => {
                setTextValue(e.target.value);
                if (validationMsg) setValidationMsg("");
              }}
              onKeyDown={handleKeyDown}
              placeholder={q.placeholder}
              className="w-full px-4 py-[14px] text-[15px] text-[#0f0f0f] border-[1.5px] border-[#e5e7eb] rounded-[8px] outline-none bg-white transition-colors placeholder:text-[#d1d5db] focus:border-[#0f0f0f]"
            />
            {q.hint && !validationMsg && (
              <p className="text-[12px] text-[#9ca3af] mt-2">{q.hint}</p>
            )}
            {validationMsg && (
              <p className="text-[12px] text-[#E8380D] mt-2">{validationMsg}</p>
            )}
            <div className="flex justify-end mt-0.5">
              <button
                type="button"
                onClick={advanceText}
                className="inline-flex items-center gap-2 px-[18px] py-[9px] rounded-full border border-[#e5e7eb] bg-white text-[#0f0f0f] text-[13px] font-medium hover:border-[#0f0f0f] hover:bg-[#fafafa] transition-all duration-150 cursor-pointer"
              >
                Continue
                <ArrowRight size={14} className="text-[#E8380D]" />
              </button>
            </div>
          </div>
        )}

        {/* Radio options — icon + text, black selected state */}
        {q.type === "radio" && (
          <div className="flex flex-col gap-[10px]">
            {q.options.map(({ text, icon: Icon }) => {
              const isSelected = selectedOption === text || (!selectedOption && savedRadioValue === text);
              return (
                <button
                  key={text}
                  type="button"
                  onClick={() => handleRadioClick(text)}
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
        )}
      </div>
    </div>
  );
}
