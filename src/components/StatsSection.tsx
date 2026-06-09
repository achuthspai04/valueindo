const stats = [
  {
    bg: "red" as const,
    ghost: "20L",
    number: "15–20L",
    unit: "students, every year",
    label: "Enter technical education in India every year",
    context:
      "AICTE mandates internships every semester — but doesn't require colleges to arrange them. That gap is where scammers live.",
    source: "The Wire · Feb 2026",
  },
  {
    bg: "black" as const,
    ghost: "14",
    number: "14+",
    unit: "companies caught",
    label: "Penalised by AICTE for charging students for internships",
    context:
      "Just the ones caught. Entire firms in Noida exist solely to sell fake certificates. MNCs don't recognise them.",
    source: "ScholarsWealth · 2024",
  },
  {
    bg: "orange" as const,
    ghost: "₹8K",
    number: "₹8,000",
    unit: "per month, if lucky",
    label: "Average stipend — even on legit platforms",
    context:
      "Most students outside metros get zero. A paid internship is the exception. Certificate-only is the norm.",
    source: "Internshala Trends Report · 2024",
  },
  {
    bg: "blue" as const,
    ghost: "135",
    number: "135%",
    unit: "in five years",
    label: "Growth in internship listings over 5 years",
    context:
      "More listings means more scams hiding in plain sight. Students have no way to tell real from fake.",
    source: "Internshala · 2024",
  },
];

const leftBg: Record<string, string> = {
  red:    "bg-[#E8380D]",
  black:  "bg-[#0f0f0f]",
  orange: "bg-[#E8820D]",
  blue:   "bg-[#2563EB]",
};

const numColor: Record<string, string> = {
  red:    "text-white",
  black:  "text-[#E8380D]",
  orange: "text-white",
  blue:   "text-white",
};

const unitColor: Record<string, string> = {
  red:    "text-white/75",
  black:  "text-[#E8380D]/80",
  orange: "text-white/80",
  blue:   "text-white/75",
};

const ghostColor: Record<string, string> = {
  red:    "text-white",
  black:  "text-white",
  orange: "text-white",
  blue:   "text-white",
};

const numSize: Record<string, string> = {
  red:    "text-[22px] sm:text-[36px] lg:text-[48px]",
  black:  "text-[22px] sm:text-[36px] lg:text-[48px]",
  orange: "text-[18px] sm:text-[28px] lg:text-[36px]",
  blue:   "text-[22px] sm:text-[36px] lg:text-[48px]",
};

export default function StatsSection() {
  return (
    <section className="w-full">
      <div className="max-w-[860px] mx-auto px-5 sm:px-10 lg:px-16">
        <div className="border border-[#0f0f0f]">

          {/* Header */}
          <div className="flex items-baseline justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-[#0f0f0f]">
            <h2
              className="text-[18px] sm:text-[20px] lg:text-[22px] font-bold text-[#0f0f0f] tracking-[-0.3px]"
              style={{ fontFamily: "var(--font-instrument)" }}
            >
              India&apos;s internship crisis{" "}
              <span className="text-[#E8380D] italic">is real.</span>
            </h2>
            <span
              className="text-[11px] sm:text-[12px] text-[#9ca3af] italic ml-4 shrink-0"
              style={{ fontFamily: "var(--font-instrument)" }}
            >
              the numbers
            </span>
          </div>

          {/* Stat rows */}
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex border-b border-[#0f0f0f] last:border-b-0 min-h-[130px] sm:min-h-[150px] lg:min-h-[160px]"
            >
              {/* Left — coloured panel */}
              <div
                className={`relative flex items-center justify-center overflow-hidden shrink-0 border-r border-[#0f0f0f] px-3 py-6
                            w-[155px] sm:w-[195px] lg:w-[220px] ${leftBg[stat.bg]}`}
              >
                <span
                  className={`absolute select-none pointer-events-none opacity-[0.07] leading-none whitespace-nowrap ${ghostColor[stat.bg]}`}
                  style={{
                    fontFamily: "var(--font-syne)",
                    fontWeight: 800,
                    fontSize: "clamp(56px, 11vw, 96px)",
                    letterSpacing: "-4px",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                  aria-hidden="true"
                >
                  {stat.ghost}
                </span>

                <div className="relative z-10 text-center">
                  <span
                    className={`block font-extrabold leading-none ${numColor[stat.bg]} ${numSize[stat.bg]}`}
                    style={{ fontFamily: "var(--font-syne)", letterSpacing: "-2px" }}
                  >
                    {stat.number}
                  </span>
                  <span
                    className={`block text-[11px] sm:text-[12px] mt-2 ${unitColor[stat.bg]}`}
                    style={{ fontFamily: "var(--font-inter)", fontWeight: 400, letterSpacing: "0.03em" }}
                  >
                    {stat.unit}
                  </span>
                </div>
              </div>

              {/* Right — text */}
              <div
                className="flex flex-1 flex-col justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-5 sm:py-7"
              >
                <p
                  className="text-[14px] sm:text-[15px] lg:text-[17px] font-bold text-[#0f0f0f] leading-[1.35]"
                >
                  {stat.label}
                </p>
                <p
                  className="text-[12px] sm:text-[13px] text-[#4b5563] leading-[1.75] italic"
                  style={{ fontFamily: "var(--font-instrument)" }}
                >
                  {stat.context}
                </p>
                <p className="text-[10px] text-[#c4c4c4] tracking-[0.04em] mt-0.5">
                  {stat.source}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
