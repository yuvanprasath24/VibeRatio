export const CACHE_SECONDS = 86400;

const CACHE_OPTIONS = {
  cache: "force-cache",
  next: { revalidate: CACHE_SECONDS },
} as const;

export function fetchCached(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, { ...init, ...CACHE_OPTIONS });
}

export function normalizeQuery(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").toLowerCase();
}

export function dimsFromUrl(
  url: string,
  aspect?: number,
): { width: number; height: number } | null {
  try {
    const u = new URL(url);
    const w = Number(u.searchParams.get("w"));
    const h = Number(u.searchParams.get("h"));
    const hasW = Number.isFinite(w) && w > 0;
    const hasH = Number.isFinite(h) && h > 0;
    if (hasW && hasH) return { width: w, height: h };
    if (hasH && aspect && aspect > 0) {
      return { width: Math.round(h * aspect), height: h };
    }
    if (hasW && aspect && aspect > 0) {
      return { width: w, height: Math.round(w / aspect) };
    }
  } catch {
    // fall through
  }
  return null;
}

export function dimsLabel(width: number, height: number): string {
  return `${width}×${height}`;
}