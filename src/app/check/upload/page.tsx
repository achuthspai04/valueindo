"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CloudUpload, Info, X, FileText, Image } from "lucide-react";

const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.webp";

function fileIcon(file: File) {
  return file.type.startsWith("image/") ? Image : FileText;
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  // Merge new picks with existing — no duplicates by name
  function handleFiles(incoming: FileList | null) {
    if (!incoming) return;
    const next = Array.from(incoming);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name));
      return [...prev, ...next.filter((f) => !existingNames.has(f.name))];
    });
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }

  function handleContinue() {
    // TODO: attach files to submission payload
    router.push("/check/optional");
  }

  function handleSkip() {
    router.push("/check/optional");
  }

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

        {/* Progress row */}
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

        {/* Label */}
        <p className="text-[11px] font-semibold text-[#E8380D] tracking-[0.1em] uppercase mb-3.5">
          Evidence
        </p>

        {/* Question */}
        <p
          className="text-[22px] sm:text-[26px] text-[#0f0f0f] leading-[1.3] mb-2"
          style={{ fontFamily: "var(--font-instrument)" }}
        >
          Got the offer or chat saved?
        </p>

        {/* Sub */}
        <p className="text-[13px] text-[#6b7280] leading-[1.6] mb-7">
          Upload it and we&apos;ll read the actual language they used — catches things answers alone might miss.
        </p>

        {/* Upload zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          className={`border-[1.5px] border-dashed rounded-[12px] px-6 py-9 text-center cursor-pointer transition-all duration-150
            ${dragging
              ? "border-[#0f0f0f] bg-[#fafafa]"
              : files.length
                ? "border-[#E8380D] bg-[#fff8f7]"
                : "border-[#d1d5db] bg-white hover:border-[#0f0f0f] hover:bg-[#fafafa]"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED}
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <CloudUpload size={28} strokeWidth={1.5} className="mx-auto mb-3 text-[#d1d5db]" aria-hidden="true" />
          <p className="text-[14px] font-medium text-[#0f0f0f] mb-1">
            {files.length ? "Tap to add more" : "Tap to upload"}
          </p>
          <p className="text-[12px] text-[#9ca3af]">Offer letter, JD, or screenshot of the chat</p>
          <p className="text-[11px] text-[#d1d5db] mt-2">PDF · JPG · PNG · WEBP</p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {files.map((file) => {
              const Icon = fileIcon(file);
              return (
                <li key={file.name} className="flex items-center gap-2.5 px-3.5 py-2.5 border border-[#f3f4f6] rounded-[8px] bg-white">
                  <Icon size={14} className="text-[#9ca3af] shrink-0" aria-hidden="true" />
                  <span className="text-[13px] text-[#374151] flex-1 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                    className="text-[#d1d5db] hover:text-[#E8380D] transition-colors cursor-pointer bg-transparent border-0"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={13} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Nudge */}
        <div className="flex items-start gap-2.5 bg-[#fff8f7] border border-[#fcd5cc] rounded-[8px] px-3.5 py-3 mt-4">
          <Info size={15} className="text-[#E8380D] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-[12px] text-[#6b7280] leading-[1.6]">
            <strong className="text-[#0f0f0f] font-medium">Why does this help?</strong> Scammers use specific phrases — &ldquo;confirmation deposit&rdquo;, &ldquo;self-funded&rdquo;, &ldquo;brand representative&rdquo;. Reading the original text makes the score more accurate.
          </p>
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={handleSkip}
            className="text-[12px] text-[#9ca3af] hover:text-[#6b7280] underline underline-offset-[3px] bg-transparent border-0 cursor-pointer transition-colors"
          >
            skip — I don&apos;t have anything to upload
          </button>

          {files.length > 0 && (
            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex items-center gap-2 px-[18px] py-[9px] rounded-full border border-[#e5e7eb] bg-white text-[#0f0f0f] text-[13px] font-medium hover:border-[#0f0f0f] hover:bg-[#fafafa] transition-all duration-150 cursor-pointer"
            >
              Continue
              <ArrowRight size={14} className="text-[#E8380D]" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
