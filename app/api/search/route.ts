import { NextRequest, NextResponse } from "next/server";
import {
  isProviderError,
  searchImages,
} from "@/lib/providers";
import type { Provider } from "@/lib/providers/types";

const VALID_PROVIDERS = new Set(["auto", "pexels", "pixabay"]);
const MAX_PER_PAGE = 40;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const rawQuery = (params.get("q") ?? "").trim();
  const provider = params.get("provider") ?? "auto";
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, Number.parseInt(params.get("per_page") ?? "24", 10) || 24),
  );

  const rawOrientation = params.get("orientation");
  const orientation =
    rawOrientation === "landscape" || rawOrientation === "portrait"
      ? rawOrientation
      : "all";

  if (!rawQuery) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }
  if (!VALID_PROVIDERS.has(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }

  try {
    const result = await searchImages({
      query: rawQuery,
      provider: provider as Provider | "auto",
      page,
      perPage,
      orientation,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (isProviderError(err)) {
      const status = err.status === 429 ? 429 : 502;
      return NextResponse.json(
        { error: err.message, provider: err.provider },
        { status },
      );
    }
    console.error("search failed", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}