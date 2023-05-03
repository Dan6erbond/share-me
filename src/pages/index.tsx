import { usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import {
  Anchor,
  Box,
  Group,
  Text,
  Title,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE, MIME_TYPES } from "@mantine/dropzone";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const pb = usePocketBase();
  const { user } = useAuth();
  const theme = useMantineTheme();

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) router.push("/");
  }, [user, router]);

  const uploadFiles = async (files: File[]) => {
    const uploads = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("type", file.type);
      formData.append("author", user?.id!);
      formData.append("description", "");
      const createdRecord = await pb.collection("files").create(formData);
      return createdRecord;
    });
    setUploading(true);
    const results = await Promise.all(uploads);
    setUploading(false);
    const post = await pb.collection("posts").create({
      title: "",
      author: user?.id!,
      files: results.map((f) => f.id),
      public: false,
    });
    router.push("/posts/" + post.id);
  };

  return (
    <>
      <Head>
        <title>Share Me</title>
        <meta
          name="description"
          content="Easily share images and videos with others"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main" p="lg">
        <Anchor
          component={Link}
          href="/"
          color="white"
          sx={{ textDecoration: "none" }}
        >
          <Title mb="xl">Share Me</Title>
        </Anchor>
        <Group sx={{ justifyContent: "center" }} align="start">
          <Dropzone
            onDrop={uploadFiles}
            onReject={(files) => console.log("rejected files", files)}
            accept={[...IMAGE_MIME_TYPE, MIME_TYPES.mp4]}
            loading={uploading}
          >
            <Group
              position="center"
              spacing="xl"
              style={{ minHeight: rem(220), pointerEvents: "none" }}
            >
              <Dropzone.Accept>
                <IconUpload
                  size="3.2rem"
                  stroke={1.5}
                  color={
                    theme.colors[theme.primaryColor][
                      theme.colorScheme === "dark" ? 4 : 6
                    ]
                  }
                />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX
                  size="3.2rem"
                  stroke={1.5}
                  color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
                />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconPhoto size="3.2rem" stroke={1.5} />
              </Dropzone.Idle>

              <div>
                <Text size="xl" inline>
                  Drag images here or click to select files
                </Text>
                <Text size="sm" color="dimmed" inline mt={7}>
                  Attach as many files as you like
                </Text>
              </div>
            </Group>
          </Dropzone>
        </Group>
      </Box>
    </>
  );
}
