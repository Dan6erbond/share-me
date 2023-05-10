import { pocketBaseUrl } from "../pocketbase";

export interface ShareMeEnv {
  signUpEnabled: boolean;
  pocketBaseUrl: string | null;
  umami: { websiteId: string; umamiJs: string } | null;
  meiliSearch: { host: string; apiKey: string } | null;
}

export const withEnv = <T>(props: T): T & ShareMeEnv => {
  let umami: ShareMeEnv["umami"] | undefined;

  if (process.env.UMAMI_WEBSITE_ID && process.env.UMAMI_JS) {
    umami = {
      websiteId: process.env.UMAMI_WEBSITE_ID,
      umamiJs: process.env.UMAMI_JS,
    };
  }

  let meiliSearch: ShareMeEnv["meiliSearch"] | undefined;

  if (process.env.MEILI_SEARCH_HOST && process.env.MEILI_SEARCH_API_KEY) {
    meiliSearch = {
      host: process.env.MEILI_SEARCH_HOST,
      apiKey: process.env.MEILI_SEARCH_API_KEY,
    };
  }

  return pocketBaseUrl({
    ...props,
    umami: umami ?? null,
    signUpEnabled: process.env.SIGNUP_ENABLED
      ? process.env.SIGNUP_ENABLED === "true"
      : true,
    meiliSearch: meiliSearch ?? null,
  });
};
