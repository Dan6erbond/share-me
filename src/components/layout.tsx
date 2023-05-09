import { usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import { Post } from "@/pocketbase/models";
import { getRelativeTime } from "@/utils/relativeTime";
import {
  ActionIcon,
  AppShell,
  Badge,
  Box,
  Center,
  Drawer,
  Group,
  Image,
  Paper,
  ScrollArea,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { Record } from "pocketbase";
import React, { useEffect, useRef, useState } from "react";
import { SlDrawer } from "react-icons/sl";
import Header from "./header";
import { usePasteFiles } from "../hooks/usePasteFiles";
import { MEDIA_MIME_TYPE } from "../utils/mediaTypes";
import { IconPhotoPlus } from "@tabler/icons-react";

interface LayoutProps {
  children?: React.ReactNode;
  signUpEnabled: boolean;
  onFiles?: (files: File[]) => void;
}

function Layout({ children, signUpEnabled, onFiles }: LayoutProps) {
  const pb = usePocketBase();
  const { user } = useAuth();

  const theme = useMantineTheme();

  const [opened, { toggle, close }] = useDisclosure(false);

  const [userPosts, setUserPosts] = useState<Post[]>();

  useEffect(() => {
    user &&
      (async () => {
        const records = await pb.collection("posts").getList<Post>(1, 20, {
          filter: `author.id = "${user.id}"`,
          expand: "files,author",
          sort: "-created",
          $autoCancel: false,
        });
        setUserPosts(records.items);
      })();
  }, [user, setUserPosts, pb]);

  const [dragging, setDragging] = useState(false);

  const dragEnterHandler = useRef<(ev: DragEvent) => void>();
  const dragLeaveHandler = useRef<(ev: DragEvent) => void>();
  const dragOverHandler = useRef<(ev: DragEvent) => void>();
  const dropHandler = useRef<(ev: DragEvent) => void>();

  useEffect(() => {
    const unregister = () => {
      dragEnterHandler.current &&
        document.removeEventListener("dragenter", dragEnterHandler.current);
      dragLeaveHandler.current &&
        document.removeEventListener("dragleave", dragLeaveHandler.current);
      dragOverHandler.current &&
        document.removeEventListener("dragover", dragOverHandler.current);
      dropHandler.current &&
        document.removeEventListener("drop", dropHandler.current);
    };

    if (typeof document !== "undefined") {
      if (!onFiles) {
        unregister();
        return;
      }

      dragEnterHandler.current = (ev) => {
        ev.preventDefault();
        setDragging(true);
      };
      document.addEventListener("dragenter", dragEnterHandler.current);
      dragLeaveHandler.current = (ev) => {
        ev.preventDefault();
        setDragging(false);
      };
      document.addEventListener("dragleave", dragLeaveHandler.current);
      dragOverHandler.current = (ev) => {
        ev.preventDefault();
      };
      document.addEventListener("dragover", dragOverHandler.current);
      dropHandler.current = (ev) => {
        if (!ev.dataTransfer?.files) return;

        ev.preventDefault();
        setDragging(false);

        const files = Array.from(ev.dataTransfer?.files);

        onFiles(files);
      };
      document.addEventListener("drop", dropHandler.current);
    }

    return unregister;
  }, [setDragging, onFiles]);

  usePasteFiles({
    acceptTypes: MEDIA_MIME_TYPE,
    onPaste: (files) => onFiles?.(files),
  });

  return (
    <AppShell header={<Header signUpEnabled={signUpEnabled} />}>
      <Drawer
        opened={opened}
        onClose={close}
        title="My Posts"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Stack>
          {userPosts?.map((post) => (
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
                          {getRelativeTime(new Date(), new Date(post.created))}
                        </Text>
                      </Tooltip>
                      <Title order={3}>
                        {post.title ||
                          `Post by ${(post.expand.author as Record).username}`}
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
                          `Post by ${(post.expand.author as Record).username}`
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
                          background: theme.fn.rgba(theme.colors.dark[8], 0.7),
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
      </Drawer>
      {dragging && (
        <Box
          top={0}
          left={0}
          pos="fixed"
          sx={(theme) => ({
            background: theme.fn.linearGradient(
              170,
              theme.fn.rgba(theme.colors.blue[3], 0.5),
              theme.fn.rgba(theme.colors.blue[5], 0.5)
            ),
            backdropFilter: "blur(2px)",
            zIndex: 1000,
            pointerEvents: "none",
          })}
          w="100vw"
          h="100vh"
        >
          <Center h="100%" w="100%">
            <Box
              mah={250}
              maw={400}
              sx={(theme) => ({
                borderRadius: theme.radius.md,
                border: `2px solid ${theme.colors.dark[3]}`,
                borderStyle: "dashed",
              })}
              h="100%"
              w="100%"
            >
              <Center
                h="100%"
                w="100%"
                sx={(theme) => ({
                  background: theme.fn.rgba(theme.colors.blue[1], 0.4),
                })}
              >
                <Group>
                  <IconPhotoPlus color={theme.colors.dark[4]} size={40} />
                  <Text color="dark" size="lg">
                    Drop files anywhere
                  </Text>
                </Group>
              </Center>
            </Box>
          </Center>
        </Box>
      )}
      {children}
      {user && (
        <ActionIcon
          pos="fixed"
          bottom={20}
          left={20}
          size="xl"
          variant="gradient"
          radius="xl"
          onClick={toggle}
        >
          <SlDrawer size={24} />
        </ActionIcon>
      )}
    </AppShell>
  );
}

export default Layout;
