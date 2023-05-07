import Dropzone from "@/components/dropzone";
import Head from "@/components/head";
import Layout from "@/components/layout";
import { useCreatePost } from "@/hooks/useCreatePost";
import { pocketBaseUrl, usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import { MEDIA_MIME_TYPE } from "@/utils/mediaTypes";
import {
  Anchor,
  Badge,
  Box,
  Card,
  Center,
  Container,
  Flex,
  Group,
  Image,
  ScrollArea,
  Text,
  Title,
} from "@mantine/core";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Record } from "pocketbase";
import { useEffect, useState } from "react";
import { usePasteFiles } from "../hooks/usePasteFiles";
import { Post } from "../pocketbase/models";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const pb = usePocketBase();
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    pb.collection("posts")
      .getList<Post>(1, 10, {
        expand: "files,author",
        sort: "-created",
        $autoCancel: false,
      })
      .then((records) => setPosts(records.items));
  }, [pb, setPosts]);

  const { uploading, createPost: _createPost } = useCreatePost({
    acceptTypes: MEDIA_MIME_TYPE,
  });

  const createPost = (files: File[]) =>
    _createPost({
      title: "",
      author: user?.id!,
      files: files.map((file) => ({
        file: file,
        name: file.name,
        author: user?.id!,
        description: "",
      })),
    }).then(async (post) => {
      if (!post) {
        return;
      }

      router.push("/posts/" + post.id);
    });

  usePasteFiles({
    acceptTypes: MEDIA_MIME_TYPE,
    onPaste: (files) => user && createPost(files),
  });

  return (
    <>
      <Head pageTitle="Upload" />
      <Layout>
        <Container>
          <Flex sx={{ justifyContent: "space-between" }}>
            <Title order={2}>Latest Posts</Title>
            <Anchor component={Link} href="/posts">
              More
            </Anchor>
          </Flex>
          <ScrollArea mb="lg" py="md">
            <Group sx={{ flexWrap: "nowrap" }}>
              {posts.map((post) => (
                <Card
                  key={post.id}
                  p={0}
                  component={Link}
                  href={`/posts/${post.id}`}
                  sx={(theme) => ({
                    ":hover": { background: theme.colors.dark[8] },
                  })}
                >
                  <Card.Section p="sm" pt={26} m={0}>
                    <Title order={4}>
                      {post.title ||
                        `Post by ${(post.expand.author as Record).username}`}
                    </Title>
                    {post.nsfw && <Badge color="red">NSFW</Badge>}
                  </Card.Section>
                  <Card.Section>
                    {Array.isArray(post.expand.files) && (
                      <Box pos="relative">
                        {IMAGE_MIME_TYPE.includes(post.expand.files[0].type) ? (
                          <Image
                            src={pb.files.getUrl(
                              post.expand.files[0],
                              post.expand.files[0].file
                            )}
                            sx={{ flex: 1 }}
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
                            <Center h="100%" w="100%">
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
                  </Card.Section>
                </Card>
              ))}
            </Group>
          </ScrollArea>
          {user && (
            <Group sx={{ justifyContent: "center" }} align="start">
              <Dropzone onDrop={createPost} loading={uploading} />
            </Group>
          )}
        </Container>
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: pocketBaseUrl({}),
  };
};
