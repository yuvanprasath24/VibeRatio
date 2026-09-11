"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Download, Loader2, ShoppingBag } from "lucide-react";
import type { ImageHit } from "@/lib/providers/types";
import { useAppState } from "@/components/app-state";
import { ResultsGrid } from "@/components/results-grid";
import { Lightbox } from "@/components/lightbox";
import { MobileHeader } from "@/components/sidebar";

export default function BasketPage() {
  const { basket, isInBasket, addToBasket, removeFromBasket } = useAppState();
  const [picked, setPicked] = useState<ImageHit | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function downloadAll() {
    if (basket.length === 0 || downloading) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const res = await fetch("/api/basket-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: basket.map((item) => ({
            url: item.sizes[0]?.url || item.preview,
            name: item.alt || item.author || "wallpaper",
            provider: item.provider,
          })),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error || "Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "wallpaper-basket.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <MobileHeader />

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-400 bg-clip-text text-transparent sm:text-3xl">
              Your Basket
            </h1>
            <p className="mt-1.5 text-sm text-zinc-600">
              {basket.length} {basket.length === 1 ? "wallpaper" : "wallpapers"} in your basket.
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-600">
              <AlertCircle className="h-4 w-4" />
              Items are removed automatically after 24 hours.
            </p>
          </div>

          {basket.length === 0 ? (
            <div className="rounded-3xl border border-border-soft/60 bg-white/70 backdrop-blur-xl p-12 text-center shadow-xl shadow-black/10">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent/10 text-accent border border-accent/20">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <p className="text-sm text-zinc-600 max-w-sm mx-auto">
                Your basket is empty. Click the shopping bag icon on any wallpaper to add it here, then download everything as a ZIP.
              </p>
              <Link
                href="/"
                className="mt-5 inline-block rounded-full bg-gradient-to-r from-accent to-accent-cyan px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-accent/20 hover:brightness-110"
              >
                Explore Wallpapers
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={downloadAll}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-cyan px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:brightness-110 disabled:opacity-50"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Building ZIP...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download All as ZIP
                    </>
                  )}
                </button>
                <p className="text-xs text-zinc-600">
                  {basket.length} {basket.length === 1 ? "image" : "images"}
                </p>
              </div>
              {downloadError && (
                <div className="mb-6 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-600">
                  {downloadError}
                </div>
              )}
              <ResultsGrid
                hits={basket}
                isInBasket={isInBasket}
                onPick={setPicked}
                onAddToBasket={addToBasket}
                onRemoveFromBasket={removeFromBasket}
              />
            </>
          )}
        </div>
      </div>

      <Lightbox
        hit={picked}
        onClose={() => setPicked(null)}
        isInBasket={isInBasket}
        onAddToBasket={addToBasket}
        onRemoveFromBasket={removeFromBasket}
      />
    </div>
  );
}