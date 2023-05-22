import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import {
  Accordion,
  Anchor,
  AnchorProps,
  AppShell,
  Navbar,
  NavbarProps,
} from "@mantine/core";
import Head from "next/head";
import Link, { LinkProps } from "next/link";
import React, { useState } from "react";
import {
  TbCloudDownload,
  TbKey,
  TbPlugConnected,
  TbSettings,
} from "react-icons/tb";

function NavLink(props: AnchorProps & LinkProps) {
  return (
    <Anchor
      component={Link}
      unstyled
      px="xl"
      py="sm"
      sx={(theme) => ({
        ":hover": { background: theme.colors.dark[5] },
        display: "block",
      })}
      {...props}
    />
  );
}

function DocsNavbar(props: Omit<NavbarProps, "children">) {
  return (
    <Navbar width={{ base: 300 }} p="xs" {...props}>
      <Accordion styles={{ content: { padding: 0 } }}>
        <Accordion.Item value="installation">
          <Accordion.Control icon={<TbCloudDownload />}>
            <Anchor component={Link} href="/installation" unstyled>
              Installation
            </Anchor>
          </Accordion.Control>
          <Accordion.Panel>
            <NavLink href="/installation/docker">Docker</NavLink>
            <NavLink href="/installation/kubernetes">Kubernetes</NavLink>
            <NavLink href="/installation/proxy">Proxy</NavLink>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="configuration">
          <Accordion.Control icon={<TbSettings />}>
            <Anchor component={Link} href="/configuration" unstyled>
              Configuration
            </Anchor>
          </Accordion.Control>
          <Accordion.Panel>
            <NavLink href="/configuration/pocketbase-url">
              PocketBase URL
            </NavLink>
            <NavLink href="/configuration/search">Search</NavLink>
            <NavLink href="/configuration/tagger">Tagger</NavLink>
            <NavLink href="/configuration/file-size-limit">
              File Size Limit
            </NavLink>
            <NavLink href="/configuration/s3">S3</NavLink>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="authentication">
          <Accordion.Control icon={<TbKey />}>
            <Anchor component={Link} href="/authentication" unstyled>
              Authentication
            </Anchor>
          </Accordion.Control>
          <Accordion.Panel>
            <NavLink href="/authentication/oidc">OIDC</NavLink>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="integrations">
          <Accordion.Control icon={<TbPlugConnected />}>
            Integrations
          </Accordion.Control>
          <Accordion.Panel>
            <NavLink href="/integrations/api-keys">API Keys</NavLink>
            <NavLink href="/integrations/share-x">ShareX</NavLink>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Navbar>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  meta?: DocsMeta;
}

interface DocsMeta {
  title: string;
}

function Layout({ children, meta }: LayoutProps) {
  const [opened, setOpened] = useState(false);

  const toggleNavbar = () => setOpened((o) => !o);

  return (
    <AppShell
      padding="md"
      header={<Header navbarOpen={opened} toggleNavbar={toggleNavbar} />}
      navbarOffsetBreakpoint="sm"
      navbar={
        <DocsNavbar
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
        />
      }
      footer={<Footer />}
    >
      <Head>
        <title>Share Me | {meta?.title ?? "Documentation"}</title>
      </Head>
      {children}
    </AppShell>
  );
}

export default Layout;
