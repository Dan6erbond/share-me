import {
  Accordion,
  Anchor,
  AnchorProps,
  AppShell,
  Navbar,
  NavbarProps,
} from "@mantine/core";
import Link, { LinkProps } from "next/link";
import React, { useState } from "react";
import {
  TbCloudDownload,
  TbKey,
  TbPlugConnected,
  TbSettings,
} from "react-icons/tb";
import DocsFooter from "../layout/footer";
import DocsHeader from "../layout/header";

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
            Configuration
          </Accordion.Control>
          <Accordion.Panel>
            <NavLink href="/configuration/file-size-limit">
              File Size Limit
            </NavLink>
            <NavLink href="/configuration/pocketbase-url">
              PocketBase URL
            </NavLink>
            <NavLink href="/configuration/Search">Search</NavLink>
            <NavLink href="/configuration/Tagger">Tagger</NavLink>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="authentication">
          <Accordion.Control icon={<TbKey />}>Authentication</Accordion.Control>
          <Accordion.Panel>
            <NavLink href="/authentication/credentials">Credentials</NavLink>
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
}

function Layout({ children }: LayoutProps) {
  const [opened, setOpened] = useState(false);

  const toggleNavbar = () => setOpened((o) => !o);

  return (
    <AppShell
      padding="md"
      header={<DocsHeader navbarOpen={opened} toggleNavbar={toggleNavbar} />}
      navbarOffsetBreakpoint="sm"
      navbar={
        <DocsNavbar
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 200, lg: 300 }}
        />
      }
      footer={<DocsFooter />}
    >
      {children}
    </AppShell>
  );
}

export default Layout;
