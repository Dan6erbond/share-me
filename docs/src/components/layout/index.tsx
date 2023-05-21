import { AppShell, em, getBreakpointValue, rem } from "@mantine/core";
import DocsFooter from "./footer";
import DocsHeader from "./header";

interface LayoutProps {
  children: React.ReactNode;
  withDocsLink?: boolean;
}

function Layout({ children, withDocsLink }: LayoutProps) {
  return (
    <AppShell
      styles={(theme) => ({
        main: {
          [`@media (max-width: ${em(
            getBreakpointValue(theme.breakpoints.sm) - 1
          )})`]: {
            paddingBottom: rem(1),
          },
        },
      })}
      padding="md"
      header={<DocsHeader withDocsLink={withDocsLink} />}
      footer={<DocsFooter />}
    >
      {children}
    </AppShell>
  );
}

export default Layout;
