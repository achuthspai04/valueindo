"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, AlertTriangle, CheckCircle2, HelpCircle,
  Share2, Check, RotateCcw, SearchX,
} from "lucide-react";

type ResultData = {
  score: number;
  verdict: string;
  verdict_sentence: string;
  red_flags: string[];
  green_flags: string[];
  hr_questions: string[];
  company: string | null;
  analysedAt: number;
  sessionId: string;
};

type Status = "loading" | "processing" | "ready" | "not-found" | "error";

function Shell({ children }: { children: React.ReactNode }) {
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
      {children}
    </div>
  );
}

function FlagList({ items, dotColor }: { items: string[]; dotColor: string }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#374151] leading-[1.6]">
          <span className="w-[5px] h-[5px] rounded-full mt-[7px] shrink-0" style={{ backgroundColor: dotColor }} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [status, setStatus] = useState<Status>("loading");
  const [result, setResult] = useState<ResultData | null>(null);
  const [copied, setCopied] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function poll() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/result/${id}`);
        if (cancelled) return;

        if (res.status === 404) {
          setStatus("not-found");
          return;
        }

        if (res.status === 202) {
          setStatus("processing");
          timer = setTimeout(poll, 2000);
          return;
        }

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data: ResultData = await res.json();
        if (cancelled) return;
        setResult(data);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id, retryKey]);

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleCheckAnother() {
    sessionStorage.clear();
    router.push("/");
  }

  function handleRetry() {
    setStatus("loading");
    setRetryKey((k) => k + 1);
  }

  if (status === "loading" || status === "processing") {
    return (
      <Shell>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <Loader2 size={28} className="text-[#9ca3af] animate-spin mb-4" aria-hidden="true" />
          <p className="text-[15px] text-[#6b7280]">
            {status === "processing" ? "Still working on your result…" : "Loading your result…"}
          </p>
        </div>
      </Shell>
    );
  }

  if (status === "not-found") {
    return (
      <Shell>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <span className="w-12 h-12 rounded-full bg-[#f3f4f6] text-[#9ca3af] flex items-center justify-center mb-4">
            <SearchX size={22} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <p
            className="text-[24px] sm:text-[26px] text-[#0f0f0f] mb-1.5"
            style={{ fontFamily: "var(--font-instrument)" }}
          >
            Result not found
          </p>
          <p className="text-[13px] text-[#9ca3af] mb-8 max-w-[320px]">
            This result doesn&apos;t exist or may have expired.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-[10px] rounded-full bg-[#0f0f0f] text-white text-[13px] font-medium hover:bg-[#262626] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </Shell>
    );
  }

  if (status === "error" || !result) {
    return (
      <Shell>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
          <span className="w-12 h-12 rounded-full bg-[#fff5f3] text-[#E8380D] flex items-center justify-center mb-4">
            <AlertTriangle size={22} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <p
            className="text-[24px] sm:text-[26px] text-[#0f0f0f] mb-1.5"
            style={{ fontFamily: "var(--font-instrument)" }}
          >
            Something went wrong
          </p>
          <p className="text-[13px] text-[#9ca3af] mb-8 max-w-[320px]">
            We couldn&apos;t load this result. Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-5 py-[10px] rounded-full bg-[#0f0f0f] text-white text-[13px] font-medium hover:bg-[#262626] transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      </Shell>
    );
  }

  const score = result.score;
  const scoreColor = score <= 40 ? "#E8380D" : score <= 70 ? "#F59E0B" : "#2563EB";
  const scoreBg = score <= 40 ? "#fff5f3" : score <= 70 ? "#fffbeb" : "#eff6ff";

  const analysedDate = new Date(result.analysedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Shell>
      <div className="flex-1 flex flex-col px-6 sm:px-16 pt-16 pb-16 max-w-[680px] w-full mx-auto">

        <p className="text-[11px] font-semibold text-[#E8380D] tracking-[0.1em] uppercase mb-3.5">
          Result
        </p>

        <p
          className="text-[24px] sm:text-[30px] text-[#0f0f0f] leading-[1.2] mb-8"
          style={{ fontFamily: "var(--font-instrument)" }}
        >
          {result.company || "This offer"}
        </p>

        {/* Score + verdict */}
        <div className="flex items-center gap-5 mb-8">
          <div
            className="w-[84px] h-[84px] rounded-full flex flex-col items-center justify-center shrink-0"
            style={{ backgroundColor: scoreBg }}
          >
            <span
              className="text-[28px] font-bold leading-none"
              style={{ color: scoreColor, fontFamily: "var(--font-space-grotesk)" }}
            >
              {score}
            </span>
            <span className="text-[10px] text-[#9ca3af] mt-0.5">/ 100</span>
          </div>

          <div>
            <span
              className="inline-block text-[12px] font-semibold px-3 py-1 rounded-full mb-2"
              style={{ backgroundColor: scoreBg, color: scoreColor }}
            >
              {result.verdict}
            </span>
            <p className="text-[14px] text-[#374151] leading-[1.6]">{result.verdict_sentence}</p>
          </div>
        </div>

        {result.red_flags.length > 0 && (
          <section className="mb-7">
            <h2 className="text-[13px] font-semibold text-[#0f0f0f] mb-3 flex items-center gap-2">
              <AlertTriangle size={14} className="text-[#E8380D]" aria-hidden="true" />
              Red flags
            </h2>
            <FlagList items={result.red_flags} dotColor="#E8380D" />
          </section>
        )}

        {result.green_flags.length > 0 && (
          <section className="mb-7">
            <h2 className="text-[13px] font-semibold text-[#0f0f0f] mb-3 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#2563EB]" aria-hidden="true" />
              Green flags
            </h2>
            <FlagList items={result.green_flags} dotColor="#2563EB" />
          </section>
        )}

        {result.hr_questions.length > 0 && (
          <section className="mb-8">
            <h2 className="text-[13px] font-semibold text-[#0f0f0f] mb-3 flex items-center gap-2">
              <HelpCircle size={14} className="text-[#9ca3af]" aria-hidden="true" />
              Questions to ask HR
            </h2>
            <FlagList items={result.hr_questions} dotColor="#d1d5db" />
          </section>
        )}

        <div className="flex flex-col sm:flex-row gap-[10px] mb-8">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 px-5 py-[10px] rounded-full border border-[#e5e7eb] bg-white text-[#0f0f0f] text-[13px] font-medium hover:border-[#0f0f0f] hover:bg-[#fafafa] transition-all duration-150 cursor-pointer"
          >
            {copied ? (
              <Check size={14} className="text-[#2563EB]" aria-hidden="true" />
            ) : (
              <Share2 size={14} className="text-[#E8380D]" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Share this result"}
          </button>

          <button
            type="button"
            onClick={handleCheckAnother}
            className="inline-flex items-center justify-center gap-2 px-5 py-[10px] rounded-full bg-[#0f0f0f] text-white text-[13px] font-medium hover:bg-[#262626] transition-colors cursor-pointer"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Check another offer
          </button>
        </div>

        <p className="text-[11px] text-[#9ca3af] leading-[1.6] border-t border-[#f3f4f6] pt-5">
          This analysis is based on information provided by the user and does not constitute legal advice. Analysed on {analysedDate}.
        </p>

      </div>
    </Shell>
  );
}
