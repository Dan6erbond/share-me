import { useAuthMethods } from "@/hooks/useAuthMethods";
import { usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import {
  Anchor,
  Avatar,
  Box,
  Button,
  Group,
  Header as MantineHeader,
  MediaQuery,
  Menu,
  Text,
  Title,
  UnstyledButton,
  em,
  getBreakpointValue,
} from "@mantine/core";
import {
  IconCaretDown,
  IconCirclePlus,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";

interface HeaderProps {
  signUpEnabled: boolean;
}

function Header({ signUpEnabled }: HeaderProps) {
  const pb = usePocketBase();
  const router = useRouter();

  const { user } = useAuth();
  const { usernamePasswordEnabled } = useAuthMethods();

  return (
    <MantineHeader height={75} p="md">
      <Group h="100%" w="100%">
        <Anchor
          component={Link}
          href="/"
          color="white"
          sx={{ textDecoration: "none" }}
        >
          <Title
            sx={(theme) => ({
              [`@media (max-width: ${em(
                getBreakpointValue(theme.breakpoints.sm) - 1
              )})`]: {
                fontSize: theme.headings.sizes.h3.fontSize,
              },
            })}
          >
            Share Me
          </Title>
        </Anchor>
        <Box sx={{ flexGrow: 1, width: "auto" }} />
        {user ? (
          <>
            {router.asPath !== "/posts/create" && (
              <Group>
                <Button
                  radius="xl"
                  variant="gradient"
                  size="md"
                  component={Link}
                  href="/posts/create"
                  leftIcon={<IconCirclePlus />}
                >
                  <Box>Post</Box>
                </Button>
              </Group>
            )}
            <Menu shadow="md" position="bottom-end">
              <Menu.Target>
                <UnstyledButton
                  sx={(theme) => ({
                    ":hover": {
                      background: theme.colors.dark[4],
                      borderRadius: theme.radius.md,
                    },
                  })}
                  pr="sm"
                  py={2}
                >
                  <Group>
                    <Avatar radius="xl"></Avatar>
                    <MediaQuery smallerThan="md" styles={{ display: "none" }}>
                      <Text>{user.username}</Text>
                    </MediaQuery>
                    <IconCaretDown />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  icon={<IconUserCircle />}
                  component={Link}
                  href={`/users/${user.id}`}
                >
                  Profile
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  icon={<IconLogout />}
                  onClick={() => pb.authStore.clear()}
                >
                  Log Out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </>
        ) : (
          <Group spacing="sm">
            <Button
              radius="xl"
              variant="gradient"
              size="md"
              component={Link}
              href="/login"
            >
              Login
            </Button>
            {usernamePasswordEnabled && signUpEnabled && (
              <Button
                radius="xl"
                variant="outline"
                size="md"
                component={Link}
                href="/sign-up"
              >
                Sign Up
              </Button>
            )}
          </Group>
        )}
      </Group>
    </MantineHeader>
  );
}

export default Header;
