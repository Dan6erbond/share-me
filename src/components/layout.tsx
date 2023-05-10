import {
  ActionIcon,
  AppShell,
  Box,
  Center,
  Group,
  MediaQuery,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { IconCirclePlus, IconPhotoPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { usePasteFiles } from "../hooks/usePasteFiles";
import { MEDIA_MIME_TYPE } from "../utils/mediaTypes";
import Header from "./header";

interface LayoutProps {
  children?: React.ReactNode;
  signUpEnabled: boolean;
  onFiles?: (files: File[]) => void;
}

function Layout({ children, signUpEnabled, onFiles }: LayoutProps) {
  const router = useRouter();
  const theme = useMantineTheme();

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
      {router.asPath !== "/posts/create" && (
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <ActionIcon
            radius="xl"
            variant="gradient"
            size="xl"
            component={Link}
            href="/posts/create"
            pos="fixed"
            bottom={16}
            right={16}
          >
            <IconCirclePlus size={26} />
          </ActionIcon>
        </MediaQuery>
      )}
      {children}
    </AppShell>
  );
}

export default Layout;
