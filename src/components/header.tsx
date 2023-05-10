import { useAuthMethods } from "@/hooks/useAuthMethods";
import { usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import { Post } from "@/pocketbase/models";
import { getRelativeTime } from "@/utils/relativeTime";
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  Button,
  Center,
  CloseButton,
  Drawer,
  Group,
  Image,
  Header as MantineHeader,
  MediaQuery,
  Menu,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
  em,
  getBreakpointValue,
} from "@mantine/core";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCaretDown,
  IconCirclePlus,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Record } from "pocketbase";
import { useQuery } from "react-query";
import UserAvatar from "./userAvatar";

interface HeaderProps {
  signUpEnabled: boolean;
}

function Header({ signUpEnabled }: HeaderProps) {
  const pb = usePocketBase();
  const router = useRouter();

  const { user } = useAuth();
  const { usernamePasswordEnabled } = useAuthMethods();

  const { data: userPosts, isLoading } = useQuery(
    ["userPosts", user?.id],
    ({ queryKey }) => {
      const [_, id] = queryKey;

      if (!id) return;

      return pb.collection("posts").getList<Post>(1, 20, {
        filter: `author.id = "${id}"`,
        expand: "files,author",
        sort: "-created",
        $autoCancel: false,
      });
    }
  );

  const [opened, { toggle, close }] = useDisclosure(false);

  return (
    <>
      <Drawer
        opened={opened}
        onClose={close}
        withCloseButton={false}
        position="right"
        styles={{ body: { height: "100%" } }}
      >
        <Stack h="100%">
          <Group>
            <Anchor component={Link} href={`/users/${user?.id}`} unstyled>
              <Group>
                <UserAvatar user={user as Record | null} />
                <Text>{user?.username}</Text>
              </Group>
            </Anchor>
            <Box w="auto" sx={{ flex: 1 }} />
            <CloseButton onClick={close} />
          </Group>
          <Title order={3}>My Posts</Title>
          <ScrollArea>
            <Stack>
              {userPosts?.items.map((post) => (
                <Paper
                  key={post.id}
                  bg="dark.6"
                  sx={(theme) => ({
                    ":hover": { background: theme.colors.dark[7] },
                  })}
                  shadow="md"
                  p="md"
                  component={Link}
                  href={`/posts/${post.id}`}
                >
                  <Group align="start">
                    <Stack>
                      <Group sx={{ flex: 1 }}>
                        <Box>
                          <Tooltip
                            label={new Date(post.created).toLocaleString()}
                            color="dark"
                            zIndex={1100}
                          >
                            <Text color="gray.6" size="sm">
                              {getRelativeTime(
                                new Date(),
                                new Date(post.created)
                              )}
                            </Text>
                          </Tooltip>
                          <Title order={3}>
                            {post.title ||
                              `Post by ${
                                (post.expand.author as Record).username
                              }`}
                          </Title>
                        </Box>
                        {post.public && <Badge>Public</Badge>}
                        {post.nsfw && <Badge color="red">NSFW</Badge>}
                      </Group>
                    </Stack>
                    <Box sx={{ flexGrow: 1, width: "auto" }} />
                    {Array.isArray(post.expand.files) && (
                      <Box h={100} w={100} pos="relative">
                        {IMAGE_MIME_TYPE.includes(post.expand.files[0].type) ? (
                          <Image
                            src={pb.files.getUrl(
                              post.expand.files[0],
                              post.expand.files[0].file
                            )}
                            sx={{ flex: 1 }}
                            height={100}
                            width={100}
                            alt={
                              post.title ||
                              `Post by ${
                                (post.expand.author as Record).username
                              }`
                            }
                          />
                        ) : (
                          <video
                            src={pb.files.getUrl(
                              post.expand.files[0],
                              post.expand.files[0].file
                            )}
                            height={100}
                            width={100}
                            muted
                            autoPlay
                            controls={false}
                          />
                        )}
                        {post.expand.files.length > 1 && (
                          <Box
                            pos="absolute"
                            sx={(theme) => ({
                              background: theme.fn.rgba(
                                theme.colors.dark[8],
                                0.7
                              ),
                            })}
                            top={0}
                            right={0}
                            bottom={0}
                            left={0}
                          >
                            <Center h={100} w={100}>
                              <Box>
                                <Text size="xl">
                                  {post.expand.files.length - 1} +
                                </Text>
                              </Box>
                            </Center>
                          </Box>
                        )}
                      </Box>
                    )}
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
          <Stack spacing="xs">
            <Button
              leftIcon={<IconUserCircle />}
              component={Link}
              href={`/users/${user?.id}`}
              variant="outline"
              color="blue"
            >
              Profile
            </Button>
            <Button
              leftIcon={<IconLogout />}
              onClick={() => {
                pb.authStore.clear();
                toggle();
              }}
              variant="outline"
              color="blue"
            >
              Log Out
            </Button>
          </Stack>
        </Stack>
      </Drawer>
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
                <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
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
                </MediaQuery>
              )}
              <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
                <Menu shadow="md" position="bottom-end">
                  <Menu.Target>
                    <UnstyledButton
                      sx={(theme) => ({
                        ":hover": {
                          background: theme.colors.dark[4],
                          borderRadius: theme.radius.md,
                        },
                      })}
                      p={8}
                    >
                      <Group>
                        <UserAvatar user={user as Record | null} />
                        <Text>{user.username}</Text>
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
              </MediaQuery>
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <ActionIcon onClick={toggle}>
                  <UserAvatar user={user as Record | null} />
                </ActionIcon>
              </MediaQuery>
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
    </>
  );
}

export default Header;
