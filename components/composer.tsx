"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, ChevronDown, Monitor, Search, Smartphone, Square } from "lucide-react";
import type { Provider } from "@/lib/providers/types";

const PROVIDER_OPTIONS: Array<{ value: Provider | "auto"; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "pexels", label: "Pexels" },
  { value: "pixabay", label: "Pixabay" },
  // NOTE: Unsplash disabled — API ToS does not permit wallpaper apps.
  // Uncomment to re-enable (see lib/providers/unsplash.ts header).
  // { value: "unsplash", label: "Unsplash" },
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
      <div className="flex items-center gap-2 rounded-full border border-border-soft bg-white p-1.5 shadow-2xl shadow-black/10 focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/20">
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
              : "bg-surface-2/80 text-zinc-500 hover:text-zinc-900 border border-transparent"
          }`}
        >
          {orientation === "portrait" ? (
            <Smartphone className="h-5 w-5" />
          ) : orientation === "landscape" ? (
            <Monitor className="h-5 w-5" />
          ) : (
            <Square className="h-5 w-5" />
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
          className="min-w-0 flex-1 bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-zinc-400 focus:outline-none"
        />

        <div className="flex items-center gap-2 shrink-0">
          <div ref={providerRef} className="relative">
            <button
              type="button"
              onClick={() => setProviderOpen(!providerOpen)}
              aria-expanded={providerOpen}
              aria-label="Select provider"
              className="flex items-center gap-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-black/10 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition active:scale-95"
            >
              <span>{activeProviderLabel}</span>
              <ChevronDown
                className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                  providerOpen ? "rotate-180 text-zinc-700" : ""
                }`}
              />
            </button>

            {providerOpen && (
              <div className="absolute right-0 bottom-full mb-2.5 w-36 overflow-hidden rounded-2xl border border-black/10 bg-white/95 p-1.5 shadow-2xl shadow-black/10 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
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
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-accent" />
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
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition duration-200 ${
            value.trim() && !disabled
              ? "bg-accent text-white shadow-md shadow-accent/20 hover:brightness-110 active:scale-95"
              : "bg-zinc-100 text-zinc-400"
          }`}
        >
          <Search className="h-5 w-5" />
        </button>
        </div>
      </div>
    </form>
  );
}