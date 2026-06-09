"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function OptionalGatePage() {
  const router = useRouter();

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
              <div className="h-full w-full bg-[#E8380D] rounded-full" />
            </div>
            <span className="text-[12px] text-[#9ca3af]">almost there</span>
          </div>
        </div>

        <p className="text-[11px] font-semibold text-[#E8380D] tracking-[0.1em] uppercase mb-3.5">
          One last thing
        </p>

        <p
          className="text-[22px] sm:text-[26px] text-[#0f0f0f] leading-[1.3] mb-2"
          style={{ fontFamily: "var(--font-instrument)" }}
        >
          Want to help us dig a little deeper?
        </p>

        <p className="text-[13px] text-[#6b7280] leading-[1.6] mb-8">
          2 quick questions. Under 30 seconds — makes your result sharper. Skip if you&apos;re in a hurry.
        </p>

        <div className="flex flex-col gap-[10px]">
          <button
            type="button"
            onClick={() => router.push("/check/optional/7")}
            className="group flex items-center justify-between w-full text-left px-5 py-[18px] rounded-[12px] border-[1.5px] border-[#e5e7eb] bg-white hover:border-[#0f0f0f] hover:bg-[#fafafa] transition-all duration-150 cursor-pointer"
          >
            <div className="flex flex-col gap-[3px]">
              <span className="text-[15px] font-semibold text-[#0f0f0f] transition-colors">
                Yes, let&apos;s do it
              </span>
              <span className="text-[12px] text-[#9ca3af] transition-colors">
                2 questions, under 30 seconds
              </span>
            </div>
            <ArrowRight
              size={18}
              className="text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors shrink-0"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={() => router.push(`/result/${crypto.randomUUID()}`)}
            className="group flex items-center justify-between w-full text-left px-5 py-[18px] rounded-[12px] border-[1.5px] border-[#e5e7eb] bg-white hover:border-[#0f0f0f] hover:bg-[#fafafa] transition-all duration-150 cursor-pointer"
          >
            <div className="flex flex-col gap-[3px]">
              <span className="text-[15px] font-semibold text-[#0f0f0f] transition-colors">
                Skip — just show me the result
              </span>
              <span className="text-[12px] text-[#9ca3af] transition-colors">
                We&apos;ll work with what you&apos;ve given us
              </span>
            </div>
            <ArrowRight
              size={18}
              className="text-[#d1d5db] group-hover:text-[#9ca3af] transition-colors shrink-0"
              aria-hidden="true"
            />
          </button>
        </div>

      </div>
    </div>
  );
}
