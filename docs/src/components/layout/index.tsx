import { AppShell } from "@mantine/core";
import DocsFooter from "./footer";
import DocsHeader from "./header";

interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <AppShell padding="md" header={<DocsHeader />} footer={<DocsFooter />}>
      {children}
    </AppShell>
  );
}

export default Layout;
