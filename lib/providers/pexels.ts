import { dimsFromUrl, dimsLabel, fetchCached, normalizeQuery } from "./cache";
import {
  ProviderError,
  type DownloadSize,
  type ImageHit,
  type SearchQuery,
  type SearchResult,
} from "./types";

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string | null;
}

interface PexelsResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string | null;
  error?: string;
}

const MAX_PER_PAGE = 80;

const PEXELS_BASE_URL = "https://api.pexels.com/v1/search";

function capitalize(key: string): string {
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function sizeFor(
  key: string,
  url: string,
  photo: PexelsPhoto,
): DownloadSize {
  const aspect = photo.height > 0 ? photo.width / photo.height : undefined;
  const parsed = dimsFromUrl(url, aspect) ?? {
    width: photo.width,
    height: photo.height,
  };
  return {
    key,
    label: `${capitalize(key)} · ${dimsLabel(parsed.width, parsed.height)}`,
    url,
    width: parsed.width,
    height: parsed.height,
  };
}

function mapPhoto(photo: PexelsPhoto, query: string): ImageHit {
  return {
    provider: "pexels",
    id: String(photo.id),
    width: photo.width,
    height: photo.height,
    thumb: photo.src.medium,
    preview: photo.src.large,
    pageUrl: photo.url,
    author: photo.photographer,
    authorUrl: photo.photographer_url,
    alt: photo.alt ?? query,
    sizes: [
      {
        key: "original",
        label: `Original · ${dimsLabel(photo.width, photo.height)}`,
        url: photo.src.original,
        width: photo.width,
        height: photo.height,
      },
      sizeFor("large2x", photo.src.large2x, photo),
      sizeFor("large", photo.src.large, photo),
      sizeFor("medium", photo.src.medium, photo),
      sizeFor("small", photo.src.small, photo),
    ],
  };
}

export async function searchPexels(query: SearchQuery): Promise<SearchResult> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    throw new ProviderError("pexels", "PEXELS_API_KEY is not set");
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

  const response = await fetchCached(`${PEXELS_BASE_URL}?${params}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "User-Agent": "Canvas/1.0",
    },
  });

  const json = (await response.json().catch(() => ({}))) as PexelsResponse;
  if (!response.ok) {
    const errorMsg =
      response.status === 429
        ? "Pexels API rate limit reached (200 req/hr limit)"
        : json.error || "Pexels request failed";
    throw new ProviderError("pexels", errorMsg, response.status);
  }

  const hits: ImageHit[] = (json.photos ?? []).map((photo) =>
    mapPhoto(photo, query.query),
  );

  return {
    provider: "pexels",
    query: query.query,
    page,
    perPage,
    total: json.total_results,
    hasMore: Boolean(json.next_page) || page * perPage < json.total_results,
    hits,
  };
}