import { searchPexels } from "./pexels";
import { searchPixabay } from "./pixabay";
import {
  ProviderError,
  isProviderError,
  type SearchQuery,
  type SearchResult,
} from "./types";

export { ProviderError, isProviderError };

export async function searchImages(query: SearchQuery): Promise<SearchResult> {
  if (query.provider === "pexels") {
    try {
      return await searchPexels(query);
    } catch (err) {
      if (isProviderError(err)) {
        // Pexels failed (e.g. rate limit 429), fall back to Pixabay
        return searchPixabay(query);
      }
      throw err;
    }
  }
  if (query.provider === "pixabay") return searchPixabay(query);

  try {
    return await searchPexels(query);
  } catch (err) {
    if (!isProviderError(err)) throw err;
    return searchPixabay(query);
  }
}