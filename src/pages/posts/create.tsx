import Dropzone from "@/components/dropzone";
import Head from "@/components/head";
import Layout from "@/components/layout";
import { useCreatePost } from "@/hooks/useCreatePost";
import { useAuth } from "@/pocketbase/auth";
import { withEnv } from "@/utils/env";
import { MEDIA_MIME_TYPE } from "@/utils/mediaTypes";
import { Checkbox, Container, Group, Switch, TextInput } from "@mantine/core";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface CreatePostProps {
  signUpEnabled: boolean;
}

export default function CreatePost({ signUpEnabled }: CreatePostProps) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    !user && router.push("/");
  });

  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [nsfw, setNsfw] = useState(false);

  const { uploading, createPost: _createPost } = useCreatePost({
    acceptTypes: MEDIA_MIME_TYPE,
  });

  const createPost = (files: File[]) =>
    _createPost({
      title,
      nsfw,
      public: isPublic,
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
    <Layout
      signUpEnabled={signUpEnabled}
      onFiles={(files) => createPost(files)}
    >
      <Head pageTitle="Create a Post" />
      <Container>
        <TextInput
          placeholder="Give your Post a Unique Title"
          size="xl"
          variant="unstyled"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          my="md"
        />
        <Group sx={{ justifyContent: "center" }} align="start" mb="lg">
          <Dropzone onDrop={createPost} loading={uploading} w="100%" />
        </Group>
        <Group>
          <Switch
            label="Public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <Checkbox
            label="NSFW"
            checked={nsfw}
            onChange={(e) => setNsfw(e.target.checked)}
          />
        </Group>
      </Container>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: withEnv({}),
  };
};
