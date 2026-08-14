"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Provider } from "@/lib/providers/types";

const PROVIDER_OPTIONS: Array<{ value: Provider | "auto"; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "pexels", label: "Pexels" },
  { value: "pixabay", label: "Pixabay" },
];

interface ComposerProps {
  onSubmit: (
    q: string,
    provider: Provider | "auto",
    orientation: "all" | "landscape" | "portrait",
  ) => void;
  disabled?: boolean;
}

export function Composer({ onSubmit, disabled }: ComposerProps) {
  const [value, setValue] = useState("");
  const [provider, setProvider] = useState<Provider | "auto">("auto");
  const [orientation, setOrientation] = useState<"all" | "landscape" | "portrait">("all");
  const [providerOpen, setProviderOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const providerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "Enter" && e.metaKey && inputRef.current) {
        inputRef.current.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (providerRef.current && !providerRef.current.contains(e.target as Node)) {
        setProviderOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q || disabled) return;
    onSubmit(q, provider, orientation);
    setValue("");
  }

  function toggleOrientation() {
    setOrientation((prev) => {
      if (prev === "all") return "portrait";
      if (prev === "portrait") return "landscape";
      return "all";
    });
  }

  const activeProviderLabel =
    PROVIDER_OPTIONS.find((opt) => opt.value === provider)?.label ?? "Auto";

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
      <div className="flex items-center gap-2 rounded-full border border-border-soft/80 bg-[#1c1c24] p-1.5 shadow-2xl shadow-black/50 focus-within:border-accent/80 focus-within:ring-2 focus-within:ring-accent/20">
        <button
          type="button"
          onClick={toggleOrientation}
          aria-label={`Orientation: ${orientation}. Click to toggle.`}
          title={`Orientation filter: ${orientation === "all" ? "Any" : orientation === "portrait" ? "Portrait" : "Landscape"}. Click to toggle.`}
          className={`group flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition duration-200 ${
            orientation === "portrait"
              ? "bg-accent/20 text-accent border border-accent/40 shadow-sm shadow-accent/10"
              : orientation === "landscape"
              ? "bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40 shadow-sm shadow-accent-cyan/10"
              : "bg-surface-2/80 text-zinc-400 hover:text-white border border-transparent"
          }`}
        >
          {orientation === "portrait" ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="7" y="2" width="10" height="20" rx="2" />
              <path d="M12 18h.01" />
            </svg>
          ) : orientation === "landscape" ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M12 22v-3" />
              <path d="M8 22h8" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M9 9h6v6H9z" />
            </svg>
          )}
          <span className="hidden sm:inline capitalize text-[11px] font-semibold">
            {orientation === "all" ? "Any" : orientation}
          </span>
        </button>

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search Wallpaper"
          aria-label="Search wallpapers"
          className="min-w-0 flex-1 bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-zinc-500 focus:outline-none"
        />

        <div className="flex items-center gap-2 shrink-0">
          <div ref={providerRef} className="relative">
            <button
              type="button"
              onClick={() => setProviderOpen(!providerOpen)}
              aria-expanded={providerOpen}
              aria-label="Select provider"
              className="flex items-center gap-1.5 rounded-full bg-[#282835] hover:bg-[#323245] border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-200 shadow-sm transition active:scale-95"
            >
              <span>{activeProviderLabel}</span>
              <svg
                viewBox="0 0 24 24"
                className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
                  providerOpen ? "rotate-180 text-white" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {providerOpen && (
              <div className="absolute right-0 bottom-full mb-2.5 w-36 overflow-hidden rounded-2xl border border-white/15 bg-[#1c1c26]/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                {PROVIDER_OPTIONS.map((opt) => {
                  const isSelected = provider === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setProvider(opt.value);
                        setProviderOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                        isSelected
                          ? "bg-accent/20 text-accent font-semibold"
                          : "text-zinc-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-accent" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!value.trim() || disabled}
            aria-label="Search"
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition duration-200 ${
              value.trim() && !disabled
                ? "bg-accent text-black shadow-md shadow-accent/20 hover:brightness-110 active:scale-95"
                : "bg-surface-2 text-zinc-600"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 21l-4.35-4.35M19 11a8 8 0 11-16 0 8 8 0 0116 0z" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}