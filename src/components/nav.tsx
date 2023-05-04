import { ActionIcon, Anchor, Box, Group, Title, Button } from "@mantine/core";
import { IconLogout,IconCirclePlus } from "@tabler/icons-react";
import Link from "next/link";
import { useAuth } from "../pocketbase/auth";
import { usePocketBase } from "../pocketbase";

function Nav() {
  const pb = usePocketBase();
  const { user } = useAuth();

  return (
    <Box component="nav" mb="xl">
      <Group>
        <Anchor
          component={Link}
          href="/"
          color="white"
          sx={{ textDecoration: "none" }}
        >
          <Title>Share Me</Title>
        </Anchor>
        <Box sx={{ flexGrow: 1 }} />
        {user ? (
          <Group>
            <Button
              radius="xl"
              variant="gradient"
              size="md"
              component={Link}
              href="/"
              leftIcon={<IconCirclePlus/>}
            >
              Create Post
            </Button>
            <ActionIcon onClick={() => pb.authStore.clear()}>
              <IconLogout />
            </ActionIcon>
          </Group>
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
            <Button
              radius="xl"
              variant="outline"
              size="md"
              component={Link}
              href="/sign-up"
            >
              Sign Up
            </Button>
          </Group>
        )}
      </Group>
    </Box>
  );
}

export default Nav;
