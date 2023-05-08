import { useAuthMethods } from "@/hooks/useAuthMethods";
import { usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Group,
  Header as MantineHeader,
  MediaQuery,
  Title,
  em,
  getBreakpointValue,
} from "@mantine/core";
import { IconCirclePlus, IconLogout } from "@tabler/icons-react";
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
      <Group>
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
        <Box sx={{ flexGrow: 1 }} />
        {user ? (
          router.asPath !== "/posts/create" && (
            <Group>
              <Button
                radius="xl"
                variant="gradient"
                size="md"
                component={Link}
                href="/posts/create"
                leftIcon={<IconCirclePlus />}
              >
                <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
                  <Box>Create Post</Box>
                </MediaQuery>
                <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                  <Box>Post</Box>
                </MediaQuery>
              </Button>
              <ActionIcon onClick={() => pb.authStore.clear()}>
                <IconLogout />
              </ActionIcon>
            </Group>
          )
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
