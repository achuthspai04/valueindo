"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Search, FileText, Shield, AlertCircle } from "lucide-react";

const SESSION_KEY = "valueindo_session_id";
const ANSWERS_KEY = "valueindo_answers";
const EXTRACTED_TEXT_KEY = "valueindo_extracted_text";

type StepStatus = "done" | "active" | "pending";

type StepDef = {
  icon: React.ReactNode;
  label: string;
  sub?: string;
};

const STEPS: StepDef[] = [
  {
    icon: <Check size={11} strokeWidth={2.5} />,
    label: "Reading your answers",
    sub: "Going through what you told us",
  },
  {
    icon: <Check size={11} strokeWidth={2.5} />,
    label: "Scanning for scam patterns",
    sub: "Checking against known red flags",
  },
  {
    icon: <Search size={11} strokeWidth={2.5} />,
    label: "Researching the company",
    sub: "Cross-checking offer details",
  },
  {
    icon: <FileText size={11} strokeWidth={2} />,
    label: "Generating your verdict",
  },
  {
    icon: <Shield size={11} strokeWidth={2} />,
    label: "Preparing result",
  },
];

function StepIcon({ status, icon }: { status: StepStatus; icon: React.ReactNode }) {
  const base = "w-6 h-6 rounded-full shrink-0 flex items-center justify-center z-10 relative";
  if (status === "done")
    return <span className={`${base} bg-[#0f0f0f] text-white`}>{icon}</span>;
  if (status === "active")
    return (
      <span className={`${base} bg-[#E8380D] text-white animate-pulse`}>{icon}</span>
    );
  return <span className={`${base} bg-[#f3f4f6] text-[#d1d5db]`}>{icon}</span>;
}

export default function AnalysingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const sessionId = sessionStorage.getItem(SESSION_KEY);
    const answersRaw = sessionStorage.getItem(ANSWERS_KEY);

    if (!sessionId || !answersRaw) {
      router.replace("/check/1");
      return;
    }

    let answers: Record<string, string> = {};
    try { answers = JSON.parse(answersRaw); } catch {}

    const extractedText = sessionStorage.getItem(EXTRACTED_TEXT_KEY) || undefined;

    // Cosmetic step ticker — times the API call, doesn't gate it
    [1, 2, 3].forEach((i) => {
      timers.push(setTimeout(() => setActiveStep(i), i * 1000));
    });

    fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/analyse`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, answers, extractedText }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then(() => {
        if (cancelled) return;
        setActiveStep(STEPS.length - 1);
        router.replace(`/result/${sessionId}`);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [router, retryKey]);

  function handleRetry() {
    setError(false);
    setActiveStep(0);
    setRetryKey((k) => k + 1);
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

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        {error ? (
          <>
            <span className="w-12 h-12 rounded-full bg-[#fff5f3] text-[#E8380D] flex items-center justify-center mb-4">
              <AlertCircle size={22} strokeWidth={1.8} aria-hidden="true" />
            </span>
            <p
              className="text-[24px] sm:text-[26px] text-[#0f0f0f] mb-1.5"
              style={{ fontFamily: "var(--font-instrument)" }}
            >
              Something went wrong
            </p>
            <p className="text-[13px] text-[#9ca3af] mb-8 max-w-[320px]">
              We couldn&apos;t analyse your offer. Check your connection and try again.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-5 py-[10px] rounded-full bg-[#0f0f0f] text-white text-[13px] font-medium hover:bg-[#262626] transition-colors cursor-pointer"
            >
              Try again
            </button>
          </>
        ) : (
          <>
            <p
              className="text-[24px] sm:text-[26px] text-[#0f0f0f] mb-1.5"
              style={{ fontFamily: "var(--font-instrument)" }}
            >
              Analysing your offer
            </p>
            <p className="text-[13px] text-[#9ca3af] mb-12">
              This takes about 10 seconds
            </p>

            {/* Step list */}
            <div className="w-full max-w-[360px] flex flex-col">
              {STEPS.map((step, i) => {
                const status: StepStatus =
                  i < activeStep ? "done" : i === activeStep ? "active" : "pending";
                return (
                  <div key={i} className="flex items-start gap-3.5 py-3.5 relative">
                    {/* Connector line */}
                    {i < STEPS.length - 1 && (
                      <span
                        className="absolute left-[11px] top-[42px] w-[1px] bg-[#f3f4f6]"
                        style={{ height: "calc(100% - 14px)" }}
                        aria-hidden="true"
                      />
                    )}

                    <StepIcon status={status} icon={step.icon} />

                    <div className="text-left pt-0.5">
                      <p
                        className={`text-[13px] font-medium leading-snug ${
                          status === "pending" ? "text-[#9ca3af] font-normal" : "text-[#0f0f0f]"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.sub && (
                        <p className="text-[11px] text-[#9ca3af] mt-0.5">{step.sub}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-[360px] h-[2px] bg-[#f3f4f6] rounded-full mt-10 overflow-hidden">
              <div className="h-full bg-[#E8380D] rounded-full animate-[analysing-fill_3.5s_ease_forwards]" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
