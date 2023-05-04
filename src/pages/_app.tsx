import { initPocketBase, PocketBaseProvider } from "@/pocketbase";
import { MantineProvider } from "@mantine/core";
import { AppProps } from "next/app";
import Head from "next/head";
import PocketBase from "pocketbase";
import { useRef } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const pbRef = useRef<PocketBase>(initPocketBase(pageProps.pocketBaseUrl));

  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "dark",
        }}
      >
        <PocketBaseProvider client={pbRef.current}>
          <Component {...pageProps} />
        </PocketBaseProvider>
      </MantineProvider>
    </>
  );
}
