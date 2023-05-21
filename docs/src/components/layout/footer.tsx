import { Anchor, Footer, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

function DocsFooter() {
  return (
    <Footer height={136} p="md">
      <Stack>
        <Group sx={{ justifyContent: "space-around" }}>
          <Stack>
            <Title size="h5">Overview</Title>
            <Anchor component={Link} href="/installation" unstyled>
              Installation
            </Anchor>
          </Stack>
          <Stack>
            <Title size="h5">Links</Title>
            <Anchor
              href="https://github.com/Dan6erbond/share-me/"
              target="_blank"
              unstyled
            >
              GitHub
            </Anchor>
          </Stack>
        </Group>
        <Text align="center">
          Share Me is available as open-source under the MIT license
        </Text>
      </Stack>
    </Footer>
  );
}

export default DocsFooter;
