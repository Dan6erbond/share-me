import { AppShell, em, getBreakpointValue, rem } from "@mantine/core";
import DocsFooter from "./footer";
import DocsHeader from "./header";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
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
      header={<DocsHeader />}
      footer={<DocsFooter />}
    >
      {children}
    </AppShell>
  );
}

export default Layout;
