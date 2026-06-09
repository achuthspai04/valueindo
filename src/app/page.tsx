import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import TypewriterText from "@/components/TypewriterText";
import StatsSection from "@/components/StatsSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav
        className="flex items-center justify-between px-5 py-4 sm:px-10 sm:py-5 lg:px-16 lg:py-6"
        style={{ borderBottom: "1px solid #f1f1f1" }}
      >
        <span className="text-[16px] sm:text-[17px] lg:text-[18px] font-semibold tracking-[-0.4px] text-[#0f0f0f]">
          value<span className="text-[#E8380D]">indo</span>?
        </span>
        <Link
          href="#how-it-works"
          className="text-[13px] sm:text-[14px] text-[#6b7280] hover:text-[#0f0f0f] transition-colors"
        >
          how it works
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center text-center px-5 sm:px-8 pt-14 pb-14 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">

        {/* Heading */}
        <h1
          className="font-bold text-[#0f0f0f] leading-[1.13] mb-4 sm:mb-5
                     text-[30px] tracking-[-0.6px]
                     sm:text-[50px] sm:tracking-[-1.3px]
                     lg:text-[64px] lg:tracking-[-1.8px]"
        >
          That internship offer&nbsp;—
          <TypewriterText />
        </h1>

        {/* Sub */}
        <p
          className="text-[#6b7280] leading-[1.65] font-normal
                     text-[16px] mb-7
                     sm:text-[18px] sm:mb-8 sm:max-w-[430px]
                     lg:text-[20px] lg:mb-9 lg:max-w-[520px]"
        >
          Answer 6 quick questions. We&apos;ll tell you if it&apos;s worth your
          time — or a scam you should walk away from.
        </p>

        {/* CTA */}
        <Link
          href="/check/1"
          className="inline-flex items-center gap-2 bg-[#E8380D] hover:bg-[#d12f08] text-white font-medium rounded-[8px] transition-colors leading-none
                     text-[14px] px-5 py-[11px]
                     sm:text-[15px] sm:px-6 sm:py-3
                     lg:text-[16px] lg:px-7 lg:py-[13px]"
          style={{ letterSpacing: "-0.1px" }}
        >
          <ShieldCheck size={14} strokeWidth={2.2} className="sm:w-[15px] sm:h-[15px] lg:w-[17px] lg:h-[17px]" aria-hidden="true" />
          Is it legit?
        </Link>

        {/* Note */}
        <p className="text-[12px] sm:text-[13px] text-[#9ca3af] mt-3 sm:mt-4">
          Takes under 2 minutes. No sign up.
        </p>

        {/* Testimonial */}
        <div className="mt-9 sm:mt-11 max-w-[360px] w-full text-center">
          <div className="w-6 h-[1.5px] bg-[#e5e7eb] mx-auto mb-2.5" />
          <span
            className="block text-[64px] text-[#f3f4f6] mb-3 select-none"
            style={{ fontFamily: "var(--font-instrument)", lineHeight: "0.6" }}
            aria-hidden="true"
          >
            &ldquo;
          </span>
          <p
            className="text-[16px] sm:text-[17px] text-[#374151] leading-[1.6] italic mb-3"
            style={{ fontFamily: "var(--font-instrument)" }}
          >
            I almost paid ₹2,000 to confirm my offer. Valueindo flagged it in under a minute.
          </p>
          <p className="text-[11px] text-[#9ca3af] tracking-[0.02em]">
            — <strong className="text-[#6b7280] font-medium">Arjun R.</strong> · CSE 3rd year, SSET Karukutty
          </p>
        </div>

      </section>

      <StatsSection />

      {/* Footer */}
      <div className="h-16 sm:h-20" />
      <footer
        className="flex justify-between items-center px-5 py-4 sm:px-10 sm:py-5 lg:px-16 lg:py-6"
        style={{ borderTop: "1px solid #f3f4f6" }}
      >
        <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-semibold text-[#0f0f0f]">
          value<span className="text-[#E8380D]">indo</span>?
        </span>
        <span className="text-[12px] sm:text-[13px] text-[#9ca3af]">
          built for Indian students, by one of you
        </span>
      </footer>
    </div>
  );
}
