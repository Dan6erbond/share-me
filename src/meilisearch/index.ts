import { MeiliSearch } from "meilisearch";

export const initMeiliSearch = (host: string, apiKey: string) =>
  new MeiliSearch({
    host: host,
    apiKey: apiKey,
  });
