"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Search, FileText, Shield } from "lucide-react";

type Step = {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  status: "done" | "active" | "pending";
};

const STEPS: Step[] = [
  {
    icon: <Check size={11} strokeWidth={2.5} />,
    label: "Reading your answers",
    sub: "6 questions processed",
    status: "done",
  },
  {
    icon: <Check size={11} strokeWidth={2.5} />,
    label: "Scanning for scam patterns",
    sub: "Checking against known red flags",
    status: "done",
  },
  {
    icon: <Search size={11} strokeWidth={2.5} />,
    label: "Researching the company",
    sub: "Cross-checking offer details",
    status: "active",
  },
  {
    icon: <FileText size={11} strokeWidth={2} />,
    label: "Generating your verdict",
    status: "pending",
  },
  {
    icon: <Shield size={11} strokeWidth={2} />,
    label: "Preparing result",
    status: "pending",
  },
];

function StepIcon({ status, icon }: { status: Step["status"]; icon: React.ReactNode }) {
  const base = "w-6 h-6 rounded-full shrink-0 flex items-center justify-center z-10 relative";
  if (status === "done")
    return <span className={`${base} bg-[#0f0f0f] text-white`}>{icon}</span>;
  if (status === "active")
    return (
      <span className={`${base} bg-[#E8380D] text-white animate-pulse`}>{icon}</span>
    );
  return <span className={`${base} bg-[#f3f4f6] text-[#d1d5db]`}>{icon}</span>;
}

export default function ResultPage() {
  // TODO: replace with real API result once /api/analyse is wired up
  const [loaded] = useState(false);

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (!loaded) {
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
            {STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-3.5 py-3.5 relative">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <span
                    className="absolute left-[11px] top-[42px] w-[1px] bg-[#f3f4f6]"
                    style={{ height: "calc(100% - 14px)" }}
                    aria-hidden="true"
                  />
                )}

                <StepIcon status={step.status} icon={step.icon} />

                <div className="text-left pt-0.5">
                  <p
                    className={`text-[13px] font-medium leading-snug ${
                      step.status === "pending" ? "text-[#9ca3af] font-normal" : "text-[#0f0f0f]"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.sub && (
                    <p className="text-[11px] text-[#9ca3af] mt-0.5">{step.sub}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-[360px] h-[2px] bg-[#f3f4f6] rounded-full mt-10 overflow-hidden">
            <div className="h-full bg-[#E8380D] rounded-full animate-[analysing-fill_3.5s_ease_forwards]" />
          </div>
        </div>
      </div>
    );
  }

  // TODO: result UI goes here
  return null;
}
