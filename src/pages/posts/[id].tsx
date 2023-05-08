import Dropzone from "@/components/dropzone";
import Head from "@/components/head";
import Layout from "@/components/layout";
import { useCreatePost } from "@/hooks/useCreatePost";
import { useUploadFiles } from "@/hooks/useUploadFiles";
import { initPocketBaseServer, usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import { Post, File as ShareMeFile } from "@/pocketbase/models";
import { ShareMeEnv, withEnv } from "@/utils/env";
import { MEDIA_MIME_TYPE } from "@/utils/mediaTypes";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Box,
  Button,
  Checkbox,
  CopyButton,
  Group,
  Image,
  Loader,
  MediaQuery,
  Paper,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconClipboardCheck,
  IconClipboardCopy,
  IconTrash,
} from "@tabler/icons-react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { Record } from "pocketbase";
import { useCallback, useEffect, useState } from "react";

interface PostProps extends ShareMeEnv {
  title: string;
  isPublic: boolean;
  nsfw: boolean;
  postAuthorUsername: string;
  userIsAuthor: boolean;
  image?: string | null;
  video?: string | null;
}

const queryParams = { expand: "author" };

export default function Post(props: PostProps) {
  const router = useRouter();
  const { id } = router.query;
  const pb = usePocketBase();
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>();
  const [userIsAuthor, setUserIsAuthor] = useState(props.userIsAuthor);
  const [files, setFiles] = useState<ShareMeFile[]>([]);
  const [title, setTitle] = useState(props.title);
  const [isPublic, setIsPublic] = useState(props.isPublic);
  const [nsfw, setNsfw] = useState(props.nsfw);

  const [blurred, setBlurred] = useState<boolean[]>([]);

  const [debouncedTitle] = useDebouncedValue(title, 200, { leading: true });

  const { uploading, uploadFiles: _uploadFiles } = useUploadFiles({
    acceptTypes: MEDIA_MIME_TYPE,
  });

  const uploadFiles = (f: File[]) =>
    _uploadFiles(
      f.map((file) => ({
        file: file,
        name: file.name,
        author: user?.id!,
        description: "",
      }))
    ).then(async (records) => {
      if (records.length === 0) {
        return;
      }

      const newFiles = [...files, ...records];
      setFiles(newFiles);
      const record = await pb
        .collection("posts")
        .update<Post>(
          post!.id,
          { files: newFiles.map((f) => f.id) },
          queryParams
        );
      setValues(record);
    });

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

  useEffect(() => {
    setBlurred(files.map(() => nsfw));
  }, [nsfw, setBlurred, files]);

  const setValues = useCallback(
    (record: Post) => {
      setPost(record);
      setFiles((files) => (record.expand.files as ShareMeFile[]) || files);
      setTitle(record.title);
      setIsPublic(record.public);
      setNsfw(record.nsfw);
      setUserIsAuthor(user?.id === record.author);
    },
    [setPost, setFiles, setTitle, setIsPublic, setNsfw, setUserIsAuthor, user]
  );

  const fetchPost = useCallback(async () => {
    if (id !== post?.id) {
      try {
        const record = await pb
          .collection("posts")
          .getOne<Post>(Array.isArray(id) ? id[0] : id!, {
            expand: "files,author",
          });
        setValues(record);
      } catch {}
    }
  }, [setValues, pb, post, id]);

  useEffect(() => {
    id && fetchPost();
  }, [id, fetchPost]);

  const deleteFile = async (id: string) => {
    const record = await pb.collection("posts").update<Post>(
      post!.id,
      {
        files: files.filter((f) => f.id !== id).map((f) => f.id),
      },
      queryParams
    );
    await pb.collection("files").delete(id);
    setFiles((files) => files.filter((f) => f.id !== id));
    setValues(record);
  };

  const updateFile = async (
    id: string,
    values: { name?: string; description?: string }
  ) => {
    try {
      const record = await pb.collection("files").update<ShareMeFile>(id, {
        ...values,
      });
      setFiles((files) => files.map((f) => (f.id === id ? record : f)));
    } catch (ex) {
      console.error(ex);
    }
  };

  useEffect(() => {
    if (!post) return;

    if (
      debouncedTitle == post.title &&
      isPublic === post.public &&
      nsfw === post.nsfw
    )
      return;
    (async () => {
      try {
        const record = await pb.collection("posts").update<Post>(
          post!.id,
          {
            nsfw,
            title: debouncedTitle || post.title,
            public: isPublic,
          },
          queryParams
        );
        setValues(record);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, debouncedTitle, isPublic, nsfw]);

  const postTitle =
    (nsfw ? "[NSFW] " : "") + post?.title ||
    `Post by ${props.postAuthorUsername}`;
  const description = `Shared by ${props.postAuthorUsername}`;

  return (
    <>
      <Head
        pageTitle={postTitle}
        description={description}
        image={props.image}
        video={props.video}
        ogType="post"
        twitterCard="summary_large_image"
      />

      <Layout
        signUpEnabled={props.signUpEnabled}
        onFiles={(files) =>
          post?.author === user?.id
            ? uploadFiles(files)
            : user?.id && createPost(files)
        }
      >
        <Group sx={{ justifyContent: "center" }} align="start">
          <Stack maw="650px" miw="350px" sx={{ flex: 1, flexGrow: 1 }} px="md">
            {userIsAuthor ||
              (post && (
                <Anchor
                  unstyled
                  component={Link}
                  href={`/users/${(post.expand.author as Record).id}`}
                >
                  <Group spacing="sm">
                    <Text size="sm">
                      {(post.expand.author as Record).username}
                    </Text>
                    <Avatar radius="xl" size="sm"></Avatar>
                  </Group>
                </Anchor>
              ))}
            {userIsAuthor ? (
              <TextInput
                placeholder="Give your Post a Unique Title"
                size="xl"
                variant="unstyled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            ) : (
              post?.title && <Title order={1}>{post?.title}</Title>
            )}
            {files.map((f, idx) => (
              <Paper
                key={f.id}
                bg="dark.6"
                p={{ base: "lg", md: "2rem" }}
                withBorder
              >
                <Stack>
                  <Group sx={{ justifyContent: "space-between" }}>
                    {userIsAuthor ? (
                      <TextInput
                        defaultValue={f.name}
                        onChange={(ev) =>
                          updateFile(f.id, { name: ev.target.value })
                        }
                      />
                    ) : (
                      <Text>{f.name}</Text>
                    )}
                    {userIsAuthor && (
                      <ActionIcon
                        variant="filled"
                        onClick={() => deleteFile(f.id)}
                      >
                        <IconTrash />
                      </ActionIcon>
                    )}
                  </Group>
                  <Box
                    pos="relative"
                    sx={{
                      ":hover": {
                        "> button": {
                          opacity: 1,
                        },
                      },
                      overflow: "hidden",
                    }}
                  >
                    {IMAGE_MIME_TYPE.includes(f.type as any) ? (
                      <Image
                        src={pb.files.getUrl(f, f.file)}
                        alt=""
                        maw="100%"
                        sx={{
                          filter: blurred[idx] ? "blur(10px)" : "",
                        }}
                        onClick={() =>
                          nsfw &&
                          setBlurred((blurred) =>
                            blurred.map((b, i) => (i === idx ? !b : b))
                          )
                        }
                      />
                    ) : (
                      <video
                        src={pb.files.getUrl(f, f.file)}
                        controls
                        style={{
                          maxWidth: "100%",
                          filter: blurred[idx] ? "blur(10px)" : "",
                          overflow: "hidden",
                        }}
                        onClick={() =>
                          nsfw &&
                          setBlurred((blurred) =>
                            blurred.map((b, i) => (i === idx ? !b : b))
                          )
                        }
                      />
                    )}
                    <CopyButton value={pb.files.getUrl(f, f.file)}>
                      {({ copy, copied }) => (
                        <>
                          <MediaQuery
                            smallerThan="sm"
                            styles={{ display: "none" }}
                          >
                            <Button
                              pos="absolute"
                              top="8px"
                              right="8px"
                              size="sm"
                              radius="md"
                              variant="gradient"
                              onClick={copy}
                              opacity={0}
                            >
                              {copied ? "Copied" : "Copy Link"}
                            </Button>
                          </MediaQuery>
                          <MediaQuery
                            largerThan="sm"
                            styles={{ display: "none" }}
                          >
                            <ActionIcon
                              pos="absolute"
                              top="8px"
                              right="8px"
                              size="lg"
                              variant="gradient"
                              onClick={copy}
                            >
                              {copied ? (
                                <IconClipboardCheck />
                              ) : (
                                <IconClipboardCopy />
                              )}
                            </ActionIcon>
                          </MediaQuery>
                        </>
                      )}
                    </CopyButton>
                  </Box>
                  {userIsAuthor ? (
                    <TextInput
                      placeholder="Description"
                      variant="unstyled"
                      value={f.description}
                      onChange={(ev) =>
                        updateFile(f.id, { description: ev.target.value })
                      }
                    />
                  ) : (
                    <Text>{f.description}</Text>
                  )}
                </Stack>
              </Paper>
            ))}
            {uploading && (
              <Loader variant="bars" sx={{ alignSelf: "center" }} />
            )}
            {userIsAuthor && <Dropzone onDrop={uploadFiles} />}
          </Stack>
          <Stack h="100%">
            <Paper bg="dark.6" p="lg" withBorder miw="200px">
              <Stack>
                {userIsAuthor && (
                  <Switch
                    label="Public"
                    labelPosition="left"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                )}
                <CopyButton
                  value={
                    typeof window !== "undefined" ? window.location.href : ""
                  }
                >
                  {({ copy, copied }) => (
                    <Button
                      variant="gradient"
                      onClick={copy}
                      color={copied ? "teal" : "blue"}
                    >
                      {copied ? "Copied" : "Copy Link"}
                    </Button>
                  )}
                </CopyButton>
                {userIsAuthor && (
                  <Checkbox
                    label="NSFW"
                    checked={nsfw}
                    onChange={(e) => setNsfw(e.target.checked)}
                  />
                )}
              </Stack>
            </Paper>
          </Stack>
        </Group>
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<PostProps> = async ({
  req,
  res,
  query,
}) => {
  const pb = await initPocketBaseServer(req, res);

  const { id } = query;

  let record: Post | null = null;

  try {
    record = await pb
      .collection("posts")
      .getOne<Post>(Array.isArray(id) ? id[0] : id!, {
        expand: "author,files",
      });
  } catch (ex) {
    if ((ex as any).response.code === 404) {
      return { notFound: true };
    }
    console.error(ex);
  }

  if (!record) {
    return { notFound: true };
  }

  const images = ((record.expand.files as ShareMeFile[]) ?? []).filter((f) =>
    IMAGE_MIME_TYPE.includes(f.type as any)
  );
  const videos = ((record.expand.files as ShareMeFile[]) ?? []).filter(
    (f) => !IMAGE_MIME_TYPE.includes(f.type as any)
  );

  return {
    props: withEnv({
      title: record.title,
      nsfw: record.nsfw,
      isPublic: record.public,
      userIsAuthor: pb.authStore.model?.id === record.author,
      postAuthorUsername: (record.expand.author as Record).username,
      image: images.length
        ? pb.files.getUrl(images[0], images[0].file, { thumb: "1200x630" })
        : null,
      video: videos.length ? pb.files.getUrl(videos[0], videos[0].file) : null,
    }),
  };
};
