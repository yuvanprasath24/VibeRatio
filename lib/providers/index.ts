import { searchPexels } from "./pexels";
import { searchPixabay } from "./pixabay";
// NOTE: Unsplash is disabled — their API ToS does not permit wallpaper apps.
// To re-enable, uncomment the import below + the branches in `searchImages`,
// then see the header comment in `./unsplash.ts`.
// import { searchUnsplash } from "./unsplash";
import {
  ProviderError,
  isProviderError,
  type SearchQuery,
  type SearchResult,
} from "./types";

export { ProviderError, isProviderError };

async function withFallback(
  query: SearchQuery,
  primary: () => Promise<SearchResult>,
  fallbacks: (() => Promise<SearchResult>)[],
): Promise<SearchResult> {
  try {
    return await primary();
  } catch (err) {
    if (!isProviderError(err)) throw err;
    for (const fb of fallbacks) {
      try {
        return await fb();
      } catch (fbErr) {
        if (!isProviderError(fbErr)) throw fbErr;
      }
    }
    throw err;
  }
}

export async function searchImages(query: SearchQuery): Promise<SearchResult> {
  if (query.provider === "pexels") {
    return withFallback(query, () => searchPexels(query), [
      () => searchPixabay(query),
      // () => searchUnsplash(query),
    ]);
  }
  if (query.provider === "pixabay") {
    return withFallback(query, () => searchPixabay(query), [
      () => searchPexels(query),
      // () => searchUnsplash(query),
    ]);
  }
  // NOTE: Unsplash disabled — uncomment to restore.
  // if (query.provider === "unsplash") {
  //   return withFallback(query, () => searchUnsplash(query), [
  //     () => searchPexels(query),
  //     () => searchPixabay(query),
  //   ]);
  // }

  // auto: try all in order
  return withFallback(query, () => searchPexels(query), [
    () => searchPixabay(query),
    // () => searchUnsplash(query),
  ]);
}