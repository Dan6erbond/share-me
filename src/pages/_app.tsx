import { initMeiliSearch } from "@/meilisearch";
import { MeiliSearchProvider } from "@/meilisearch/context";
import { initPocketBase, PocketBaseProvider } from "@/pocketbase";
import { UploaderContextProvider } from "@/uploader/context";
import { ShareMeEnv } from "@/utils/env";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";
import PocketBase from "pocketbase";
import { useRef } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps<ShareMeEnv>) {
  const pbRef = useRef<PocketBase>(initPocketBase(pageProps.pocketBaseUrl));

  return (
    <>
      <Head>
        <title>Share Me</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      {pageProps.umami && (
        <Script
          async
          defer
          data-website-id={pageProps.umami.websiteId}
          src={pageProps.umami.umamiJs}
        ></Script>
      )}

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "dark",
        }}
      >
        <Notifications />
        <QueryClientProvider client={queryClient}>
          <PocketBaseProvider client={pbRef.current}>
            <MeiliSearchProvider
              init={() =>
                pageProps.meiliSearch
                  ? initMeiliSearch(
                      pageProps.meiliSearch.host,
                      pageProps.meiliSearch.apiKey
                    )
                  : undefined
              }
            >
              <UploaderContextProvider pocketBase={pbRef.current}>
                <Component {...pageProps} />
              </UploaderContextProvider>
            </MeiliSearchProvider>
          </PocketBaseProvider>
        </QueryClientProvider>
      </MantineProvider>
    </>
  );
}
