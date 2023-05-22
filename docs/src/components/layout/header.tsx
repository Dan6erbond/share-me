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
  em,
  getBreakpointValue,
  rem,
  useMantineTheme,
} from "@mantine/core";
import lunr from "lunr";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { TbArrowLeft, TbHome, TbSearch } from "react-icons/tb";

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
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([] as lunr.Index.Result[]);
  const [searchOpened, setSearchOpened] = useState(false);
  const popoverDropdown = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchResults = (search && idx.current?.search(search)) || [];
    setSearchResults(searchResults);
  }, [idx, search, setSearchResults]);

  const navbarEnabled = navbarOpen !== undefined && toggleNavbar;

  return (
    <Header height={theme.other.headerHeight}>
      <Group h="100%" px="md" pos="relative">
        {navbarEnabled && (
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Burger
              opened={navbarOpen}
              onClick={toggleNavbar}
              size="sm"
              color={theme.colors.gray[6]}
            />
          </MediaQuery>
        )}

        <MediaQuery smallerThan="md" styles={{ display: "none" }}>
          <Anchor
            unstyled
            component={Link}
            href="/"
            sx={{ ":hover": { color: theme.colors.gray[5] } }}
          >
            <Title order={1} size="h2">
              Share Me
            </Title>
          </Anchor>
        </MediaQuery>
        <MediaQuery largerThan="md" styles={{ display: "none" }}>
          <ActionIcon size="xl" component={Link} href="/">
            <TbHome size={24} />
          </ActionIcon>
        </MediaQuery>

        <MediaQuery smallerThan="md" styles={{ display: "none" }}>
          <Group>
            <Anchor
              component={Link}
              href="/installation"
              unstyled
              py="md"
              px="sm"
              size="lg"
              ml="xl"
              sx={{ ":hover": { color: theme.colors.dark[2] } }}
            >
              Installation
            </Anchor>
            <Anchor
              component={Link}
              href="/configuration"
              unstyled
              py="md"
              px="sm"
              size="lg"
              sx={{ ":hover": { color: theme.colors.dark[2] } }}
            >
              Configuration
            </Anchor>
            <Anchor
              component={Link}
              href="/authentication"
              unstyled
              py="md"
              px="sm"
              size="lg"
              sx={{ ":hover": { color: theme.colors.dark[2] } }}
            >
              Authentication
            </Anchor>
            <Anchor
              component={Link}
              href="/integrations/api-keys"
              unstyled
              py="md"
              px="sm"
              size="lg"
              sx={{ ":hover": { color: theme.colors.dark[2] } }}
            >
              Integrations
            </Anchor>
          </Group>
        </MediaQuery>
        <MediaQuery largerThan="md" styles={{ display: "none" }}>
          <Anchor
            component={Link}
            href="/installation"
            unstyled
            size="lg"
            sx={{ ":hover": { color: theme.colors.dark[2] } }}
          >
            Installation
          </Anchor>
        </MediaQuery>

        <Box sx={{ flexGrow: 1, width: "auto" }} />
        <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
          <ActionIcon
            size="xl"
            component="a"
            href="https://github.com/Dan6erbond/share-me/"
            target="_blank"
          >
            <FaGithub size={24} />
          </ActionIcon>
        </MediaQuery>

        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <ActionIcon onClick={() => setShowSearch((s) => !s)}>
            <TbSearch />
          </ActionIcon>
        </MediaQuery>

        <Popover
          width="target"
          position="bottom-end"
          opened={searchResults.length > 0 && searchOpened}
          transitionProps={{ transition: "slide-down" }}
        >
          <Popover.Target>
            <Box
              w={{ base: "100%", sm: 250 }}
              sx={(theme) => ({
                [`@media (max-width: ${em(
                  getBreakpointValue(theme.breakpoints.sm) - 1
                )})`]: {
                  top: showSearch ? 0 : 0 - theme.other.headerHeight,
                  left: 0,
                  position: "absolute",
                  padding: rem(16),
                  transition: "top ease 0.15s",
                },
              })}
              bg="dark.7"
              onFocusCapture={() => setSearchOpened(true)}
              onBlurCapture={(ev) => {
                if (popoverDropdown.current?.contains(ev.relatedTarget)) return;
                setSearchOpened(false);
              }}
            >
              <Group>
                <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                  <ActionIcon
                    onClick={() => {
                      setShowSearch(false);
                      setSearchOpened(false);
                    }}
                  >
                    <TbArrowLeft />
                  </ActionIcon>
                </MediaQuery>
                <TextInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  radius="xl"
                  placeholder="Search..."
                  sx={{ flexGrow: 1 }}
                />
              </Group>
            </Box>
          </Popover.Target>
          <Popover.Dropdown
            p={0}
            onClickCapture={() => setShowSearch((s) => !s)}
          >
            <Stack ref={popoverDropdown}>
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
