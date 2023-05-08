import Head from "@/components/head";
import Layout from "@/components/layout";
import PostTitle from "@/components/postTitle";
import { useCreatePost } from "@/hooks/useCreatePost";
import { usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import { Post } from "@/pocketbase/models";
import { withEnv } from "@/utils/env";
import { MEDIA_MIME_TYPE } from "@/utils/mediaTypes";
import {
  Anchor,
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
import Link from "next/link";
import { useRouter } from "next/router";
import { Record } from "pocketbase";
import { useEffect, useState } from "react";

interface HomeProps {
  signUpEnabled: boolean;
}

export default function Home({ signUpEnabled }: HomeProps) {
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

  const { createPost: _createPost } = useCreatePost({
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

  return (
    <>
      <Head />
      <Layout
        signUpEnabled={signUpEnabled}
        onFiles={(files) => user && createPost(files)}
      >
        <Container>
          <Flex sx={{ justifyContent: "space-between" }}>
            <Title order={2}>Latest Posts</Title>
            <Anchor component={Link} href="/posts">
              More
            </Anchor>
          </Flex>
          <ScrollArea mb="lg" py="md">
            <Group sx={{ flexWrap: "nowrap", alignItems: "stretch" }}>
              {posts.map((post) => (
                <Card
                  key={post.id}
                  p={0}
                  component={Link}
                  href={`/posts/${post.id}`}
                  sx={(theme) => ({
                    ":hover": { background: theme.colors.dark[8] },
                    display: "flex",
                    flexDirection: "column",
                  })}
                  miw={250}
                  maw={{ base: 250, md: 350 }}
                  mah={350}
                >
                  <Card.Section p="sm" pt={26} m={0}>
                    <PostTitle post={post} compact />
                  </Card.Section>
                  <Card.Section
                    maw="100%"
                    m={0}
                    mih={0}
                    h="100%"
                    sx={{
                      flex: 1,
                      display: "flex",
                      "&[data-last]": { marginBottom: 0 },
                    }}
                  >
                    {Array.isArray(post.expand.files) && (
                      <Flex
                        pos="relative"
                        mah="100%"
                        w="100%"
                        maw="100%"
                        align="center"
                        justify="center"
                        sx={{ overflow: "hidden" }}
                      >
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
                            style={{
                              maxHeight: "100%",
                              margin: "0 auto",
                              display: "block",
                            }}
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
                      </Flex>
                    )}
                  </Card.Section>
                </Card>
              ))}
            </Group>
          </ScrollArea>
        </Container>
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: withEnv({}),
  };
};
