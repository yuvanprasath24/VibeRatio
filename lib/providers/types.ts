export type Provider = "pexels" | "pixabay" | "unsplash";

export interface DownloadSize {
  key: string;
  label: string;
  url: string;
  width: number;
  height: number;
}

export interface ImageHit {
  provider: Provider;
  id: string;
  width: number;
  height: number;
  thumb: string;
  preview: string;
  pageUrl: string;
  author: string;
  authorUrl: string | null;
  alt: string;
  sizes: DownloadSize[];
}

export interface SearchQuery {
  query: string;
  provider: Provider | "auto";
  page: number;
  perPage: number;
  orientation?: "all" | "landscape" | "portrait";
}

export interface SearchResult {
  provider: Provider;
  query: string;
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
  hits: ImageHit[];
}

export const PROVIDERS: Record<Provider, { label: string; brand: string }> = {
  pexels: { label: "Pexels", brand: "Pexels" },
  pixabay: { label: "Pixabay", brand: "Pixabay" },
  unsplash: { label: "Unsplash", brand: "Unsplash" },
};

export class ProviderError extends Error {
  provider: Provider;
  status: number;

  constructor(provider: Provider, message: string, status = 500) {
    super(message);
    this.name = "ProviderError";
    this.provider = provider;
    this.status = status;
  }
}

export function isProviderError(err: unknown): err is ProviderError {
  return err instanceof ProviderError;
}