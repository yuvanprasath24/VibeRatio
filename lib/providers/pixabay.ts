import { dimsLabel, fetchCached, normalizeQuery } from "./cache";
import {
  ProviderError,
  type DownloadSize,
  type ImageHit,
  type SearchQuery,
  type SearchResult,
} from "./types";

interface PixabayHit {
  id: number;
  pageURL: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageURL: string | null;
  imageWidth: number;
  imageHeight: number;
  user: string;
}

interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayHit[];
  message?: string;
}

const MIN_PER_PAGE = 3;
const MAX_PER_PAGE = 200;

const PIXABAY_BASE_URL = "https://pixabay.com/api/";

function isHttps(url: string | null): url is string {
  return typeof url === "string" && url.startsWith("https://");
}

function mapHit(hit: PixabayHit): ImageHit {
  const sizes: DownloadSize[] = [];

  if (isHttps(hit.imageURL)) {
    sizes.push({
      key: "original",
      label: `Original · ${dimsLabel(hit.imageWidth, hit.imageHeight)}`,
      url: hit.imageURL,
      width: hit.imageWidth,
      height: hit.imageHeight,
    });
  }

  if (isHttps(hit.largeImageURL)) {
    // Pixabay largeImageURL has no size params; infer dims by scaling webformat up to 1280px on the long edge.
    const factor = 1280 / Math.max(hit.webformatWidth, hit.webformatHeight);
    const width = Math.max(1, Math.round(hit.webformatWidth * factor));
    const height = Math.max(1, Math.round(hit.webformatHeight * factor));
    sizes.push({
      key: "large",
      label: `Large · ${dimsLabel(width, height)}`,
      url: hit.largeImageURL,
      width,
      height,
    });
  }

  if (isHttps(hit.webformatURL)) {
    sizes.push({
      key: "web",
      label: `Web · ${dimsLabel(hit.webformatWidth, hit.webformatHeight)}`,
      url: hit.webformatURL,
      width: hit.webformatWidth,
      height: hit.webformatHeight,
    });
  }

  return {
    provider: "pixabay",
    id: String(hit.id),
    width: hit.imageWidth,
    height: hit.imageHeight,
    thumb: hit.webformatURL,
    preview: hit.largeImageURL,
    pageUrl: hit.pageURL,
    author: hit.user,
    authorUrl: null,
    alt: hit.tags,
    sizes,
  };
}

export async function searchPixabay(query: SearchQuery): Promise<SearchResult> {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) {
    throw new ProviderError("pixabay", "PIXABAY_API_KEY is not set");
  }

  const page = Math.max(1, query.page);
  const perPage = Math.min(MAX_PER_PAGE, Math.max(MIN_PER_PAGE, query.perPage));

  const orientationMap: Record<string, string> = {
    landscape: "horizontal",
    portrait: "vertical",
  };
  const orientation = (query.orientation && orientationMap[query.orientation]) || "all";

  const params = new URLSearchParams({
    key: apiKey,
    q: normalizeQuery(query.query),
    page: String(page),
    per_page: String(perPage),
    image_type: "photo",
    safesearch: "true",
    orientation,
    lang: "en",
  });

  const response = await fetchCached(`${PIXABAY_BASE_URL}?${params}`);

  const json = (await response.json().catch(() => ({}))) as PixabayResponse;
  if (!response.ok) {
    throw new ProviderError(
      "pixabay",
      json.message || "Pixabay request failed",
      response.status,
    );
  }

  return {
    provider: "pixabay",
    query: query.query,
    page,
    perPage,
    total: json.totalHits,
    hasMore: page * perPage < json.totalHits,
    hits: json.hits.map(mapHit),
  };
}