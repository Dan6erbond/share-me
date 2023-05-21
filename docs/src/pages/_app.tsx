import { Code, MantineProvider } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { MDXProvider } from "@mdx-js/react";
import { AppProps } from "next/app";
import Head from "next/head";
import Image from "next/image";
import { DetailedHTMLProps, HTMLAttributes } from "react";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

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
        <MDXProvider
          components={{
            pre: (props) => {
              const className = (props as any).children.props.className || "";
              const code = (props as any).children.props.children.trim();
              const language = className.replace(/language-/, "");

              return <Prism language={language}>{code}</Prism>;
            },
            code: (props) => {
              return <Code {...(props as any)} />;
            },
            img: (props) => {
              return (
                <div style={{ maxWidth: "100%" }}>
                  <img {...props} style={{ maxWidth: "100%" }} />
                  <span
                    style={{
                      margin: "0.5rem auto 0 auto",
                      display: "block",
                      textAlign: "center",
                    }}
                  >
                    {props.alt}
                  </span>
                </div>
              );
            },
          }}
        >
          <Component {...pageProps} />
        </MDXProvider>
      </MantineProvider>
    </>
  );
}
