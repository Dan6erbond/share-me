import "@fontsource/fira-code";
import "@fontsource/inter";
import {
  Anchor,
  Box,
  Code,
  DefaultMantineColor,
  Group,
  MantineProvider,
  Paper,
} from "@mantine/core";
import { Prism } from "@mantine/prism";
import { MDXProvider } from "@mdx-js/react";
import { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import Script from "next/script";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import { IconType } from "react-icons/lib";
import { TbExclamationCircle } from "react-icons/tb";

declare module "@mantine/core" {
  export interface MantineThemeOther {
    headerHeight: number;
  }
}

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  const siteTitle = "Share Me";
  const description = "Share images and videos on your own private server.";

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta property="og:title" content={siteTitle} />
        <meta name="description" content={description} />
        {/* <meta property="og:url" content={url} /> */}
        <meta property="og:type" content="summary" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={siteTitle} />
        <meta property="twitter:description" content={description} />
        <link rel="icon" href="/share-me/favicon.ico" />
      </Head>
      <Script
        async
        defer
        data-website-id="d15161c4-19d8-4bec-a060-23e79ca3674b"
        src="https://umami.ravianand.me/umami.js"
      />
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: "dark",
          fontFamily: "Inter, Verdana, sans-serif",
          fontFamilyMonospace: "Fira Code, Monaco, Courier, monospace",
          headings: { fontFamily: "Inter, Greycliff CF, sans-serif" },
          other: {
            headerHeight: 74,
          },
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
            p: (props) => {
              if (props.className?.includes("hint")) {
                const Hint = ({
                  color,
                  icon: Icon,
                }: {
                  color: DefaultMantineColor;
                  icon: IconType;
                }) => (
                  <Paper
                    bg="dark.6"
                    radius="sm"
                    my="md"
                    sx={{ overflow: "hidden" }}
                  >
                    <Group align="stretch" noWrap>
                      <Box
                        sx={(theme) => ({
                          background: theme.colors[color][4],
                          display: "flex",
                          alignItems: "center",
                        })}
                        py="sm"
                        px="xs"
                      >
                        <Icon size={24} color="white" />
                      </Box>
                      <Box py="sm">
                        <p {...props} style={{ margin: 0 }} />
                      </Box>
                    </Group>
                  </Paper>
                );

                if (props.className.includes("tip")) {
                  return <Hint color="blue" icon={TbExclamationCircle} />;
                } else if (props.className.includes("warn")) {
                  return (
                    <Hint color="orange" icon={HiOutlineExclamationTriangle} />
                  );
                } else {
                  return (
                    <Hint color="red" icon={HiOutlineExclamationTriangle} />
                  );
                }
              }
              return <p {...props}></p>;
            },
            a: (props) => <Anchor component={Link} {...(props as any)} />,
          }}
        >
          <Component {...pageProps} />
        </MDXProvider>
      </MantineProvider>
    </>
  );
}
