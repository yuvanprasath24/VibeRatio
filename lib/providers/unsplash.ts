import { dimsLabel, fetchCached, normalizeQuery } from "./cache";
import {
  ProviderError,
  type ImageHit,
  type SearchQuery,
  type SearchResult,
} from "./types";

// ============================================================================
// NOTE: Unsplash is DISABLED — their API ToS does not permit wallpaper apps,
// so this integration must not be wired up. The code below is kept fully
// intact so it can be re-enabled if Unsplash changes their policy.
//
// To re-enable later:
//  1. Uncomment the `searchUnsplash` import + fallback branches in
//     `lib/providers/index.ts`.
//  2. Uncomment `{ value: "unsplash", label: "Unsplash" }` in
//     `components/composer.tsx`.
//  3. Add "unsplash" back to `VALID_PROVIDERS` in `app/api/search/route.ts`.
//  4. Uncomment the unsplash hosts in `app/api/download/route.ts` and
//     `app/api/basket-download/route.ts`.
//  5. Uncomment the `images.unsplash.com` pattern in `next.config.ts`.
//  6. Set `UNSPLASH_API_KEY` in `.env.local`.
// ============================================================================

interface UnsplashUser {
  name: string;
  links: { html: string };
}

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: UnsplashUser;
  alt_description: string | null;
  links: { html: string };
}

interface UnsplashResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
  errors?: string[];
}

const MAX_PER_PAGE = 30;

const UNSPLASH_BASE_URL = "https://api.unsplash.com/search/photos";

function mapPhoto(photo: UnsplashPhoto, query: string): ImageHit {
  return {
    provider: "unsplash",
    id: photo.id,
    width: photo.width,
    height: photo.height,
    thumb: photo.urls.small,
    preview: photo.urls.regular,
    pageUrl: photo.links.html,
    author: photo.user.name,
    authorUrl: photo.user.links.html,
    alt: photo.alt_description ?? query,
    sizes: [
      {
        key: "original",
        label: `Original · ${dimsLabel(photo.width, photo.height)}`,
        url: photo.urls.raw,
        width: photo.width,
        height: photo.height,
      },
      {
        key: "regular",
        label: `Regular · ${dimsLabel(1080, Math.round((1080 * photo.height) / photo.width))}`,
        url: photo.urls.regular,
        width: 1080,
        height: Math.round((1080 * photo.height) / photo.width),
      },
      {
        key: "small",
        label: `Small · ${dimsLabel(400, Math.round((400 * photo.height) / photo.width))}`,
        url: photo.urls.small,
        width: 400,
        height: Math.round((400 * photo.height) / photo.width),
      },
      {
        key: "thumb",
        label: `Thumb · ${dimsLabel(200, Math.round((200 * photo.height) / photo.width))}`,
        url: photo.urls.thumb,
        width: 200,
        height: Math.round((200 * photo.height) / photo.width),
      },
    ],
  };
}

export async function searchUnsplash(query: SearchQuery): Promise<SearchResult> {
  const apiKey = process.env.UNSPLASH_API_KEY;
  if (!apiKey) {
    throw new ProviderError("unsplash", "UNSPLASH_API_KEY is not set");
  }

  const page = Math.max(1, query.page);
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, query.perPage));
  const params = new URLSearchParams({
    query: normalizeQuery(query.query),
    page: String(page),
    per_page: String(perPage),
  });
  if (query.orientation && query.orientation !== "all") {
    params.set("orientation", query.orientation);
  }

  const response = await fetchCached(`${UNSPLASH_BASE_URL}?${params}`, {
    headers: {
      Authorization: `Client-ID ${apiKey}`,
      "User-Agent": "Canvas/1.0",
    },
  });

  const json = (await response.json().catch(() => ({}))) as UnsplashResponse;
  if (!response.ok) {
    const errorMsg =
      response.status === 403
        ? "Unsplash API rate limit reached"
        : json.errors?.[0] || "Unsplash request failed";
    throw new ProviderError("unsplash", errorMsg, response.status);
  }

  const hits: ImageHit[] = (json.results ?? []).map((photo) =>
    mapPhoto(photo, query.query),
  );

  return {
    provider: "unsplash",
    query: query.query,
    page,
    perPage,
    total: json.total,
    hasMore: page < json.total_pages,
    hits,
  };
}
