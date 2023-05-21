import indexData from "@/lunrIndex.json";
import {
  ActionIcon,
  Anchor,
  Box,
  Burger,
  Group,
  Header,
  MediaQuery,
  Popover,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import lunr from "lunr";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaGithub } from "react-icons/fa";

interface DocsHeaderProps {
  navbarOpen?: boolean;
  toggleNavbar?: () => void;
}

function DocsHeader({ navbarOpen, toggleNavbar }: DocsHeaderProps) {
  const theme = useMantineTheme();

  const idx = useRef<lunr.Index | null>(null);

  useEffect(() => {
    if (!idx.current) {
      idx.current = lunr.Index.load(indexData);
    }
  }, []);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([] as lunr.Index.Result[]);

  useEffect(() => {
    setSearchResults((search && idx.current?.search(search)) || []);
  }, [idx, search, setSearchResults]);

  return (
    <Header height={74}>
      <Group h="100%" px="md">
        {navbarOpen && toggleNavbar && (
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Burger
              opened={navbarOpen}
              onClick={toggleNavbar}
              size="sm"
              color={theme.colors.gray[6]}
              mr="xl"
            />
          </MediaQuery>
        )}

        <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
          <Anchor
            unstyled
            component={Link}
            href="/"
            sx={{ ":hover": { color: theme.colors.gray[5] } }}
          >
            <Title order={1}>Share Me</Title>
          </Anchor>
        </MediaQuery>

        <Box sx={{ flex: 1, width: "auto" }} />
        <ActionIcon
          size="xl"
          component="a"
          href="https://github.com/Dan6erbond/share-me/"
          target="_blank"
        >
          <FaGithub size={24} />
        </ActionIcon>
        <Popover width={400} position="bottom-end">
          <Popover.Target>
            <TextInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              radius="xl"
              placeholder="Search..."
            />
          </Popover.Target>
          <Popover.Dropdown p={0}>
            <Stack>
              {searchResults.map((res) => (
                <Anchor
                  key={res.ref}
                  component={Link}
                  href={res.ref}
                  unstyled
                  px="xl"
                  py="sm"
                  sx={(theme) => ({
                    ":hover": { background: theme.colors.dark[5] },
                  })}
                >
                  <Text>{res.ref}</Text>
                  <Text color="dimmed">
                    {Object.keys(res.matchData.metadata).join(", ")}
                  </Text>
                </Anchor>
              ))}
            </Stack>
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Header>
  );
}

export default DocsHeader;
