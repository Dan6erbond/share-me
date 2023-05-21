import { initMeiliSearch } from "@/meilisearch";
import { MeiliSearchProvider } from "@/meilisearch/context";
import { initPocketBase, PocketBaseProvider } from "@/pocketbase";
import { ShareMeEnv } from "@/utils/env";
import "@fontsource/inter";
import { MantineProvider } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";
import { Notifications } from "@mantine/notifications";
import "dayjs/locale/en";
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
          colorScheme: "dark",
          fontFamily: "Inter, Verdana, sans-serif",
          fontFamilyMonospace: "Inter, Monaco, Courier, monospace",
          headings: { fontFamily: "Inter, Greycliff CF, sans-serif" },
        }}
      >
        <Notifications />
        <DatesProvider
          settings={{ locale: "en", firstDayOfWeek: 0, weekendDays: [0] }}
        >
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
                <Component {...pageProps} />
              </MeiliSearchProvider>
            </PocketBaseProvider>
          </QueryClientProvider>
        </DatesProvider>
      </MantineProvider>
    </>
  );
}
