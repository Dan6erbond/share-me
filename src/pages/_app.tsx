import { initPocketBase, PocketBaseProvider } from "@/pocketbase";
import { UploaderContextProvider } from "@/uploader/context";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
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
        <Notifications />
        <PocketBaseProvider client={pbRef.current}>
          <UploaderContextProvider pocketBase={pbRef.current}>
            <Component {...pageProps} />
          </UploaderContextProvider>
        </PocketBaseProvider>
      </MantineProvider>
    </>
  );
}
