import Nav from "@/components/nav";
import {
  initPocketBaseServer,
  pocketBaseUrl,
  usePocketBase,
} from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import { File, Post } from "@/pocketbase/models";
import {
  ActionIcon,
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
  rem,
  useMantineTheme,
} from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE, MIME_TYPES } from "@mantine/dropzone";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconClipboardCheck,
  IconClipboardCopy,
  IconPhoto,
  IconTrash,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { FileWithPath } from "file-selector";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Record } from "pocketbase";
import { useCallback, useEffect, useState } from "react";

interface PostProps {
  title: string;
  isPublic: boolean;
  nsfw: boolean;
  postAuthorUsername: string;
  userIsAuthor: boolean;
  image?: string | null;
  video?: string | null;
}

export default function Post(props: PostProps) {
  const router = useRouter();
  const { id } = router.query;
  const pb = usePocketBase();
  const { user } = useAuth();
  const theme = useMantineTheme();

  const [post, setPost] = useState<Post | null>();
  const [userIsAuthor, setUserIsAuthor] = useState(props.userIsAuthor);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState(props.title);
  const [isPublic, setIsPublic] = useState(props.isPublic);
  const [nsfw, setNsfw] = useState(props.nsfw);

  const [blurred, setBlurred] = useState<boolean[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState([]);

  const [debouncedTitle] = useDebouncedValue(title, 200, { leading: true });

  useEffect(() => {
    blurred.length !== files.length && setBlurred(files.map(() => nsfw));
  }, [blurred, nsfw, setBlurred, files]);

  const setValues = useCallback(
    (record: Post) => {
      setPost(record);
      setFiles((files) => (record.expand.files as File[]) || files);
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
          .getOne<Post>(Array.isArray(id) ? id[0] : id!, { expand: "files" });
        setValues(record);
      } catch {}
    }
  }, [setValues, pb, post, id]);

  useEffect(() => {
    id && fetchPost();
  }, [id, fetchPost]);

  const uploadFiles = async (f: FileWithPath[]) => {
    setUploading(true);
    const records: File[] = [];

    for (const file of f) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("type", file.type);
      formData.append("author", user?.id!);
      formData.append("description", "");
      const createdRecord = await pb.collection("files").create<File>(formData);
      records.push(createdRecord);
    }

    const newFiles = [...files, ...records];
    setFiles(newFiles);
    const record = await pb
      .collection("posts")
      .update<Post>(post!.id, { files: newFiles.map((f) => f.id) });
    setValues(record);
    setUploading(false);
  };

  const deleteFile = async (id: string) => {
    const record = await pb.collection("posts").update<Post>(post!.id, {
      files: files.filter((f) => f.id !== id).map((f) => f.id),
    });
    await pb.collection("files").delete(id);
    setFiles((files) => files.filter((f) => f.id !== id));
    setValues(record);
  };

  const updateFile = async (
    id: string,
    values: { name?: string; description?: string }
  ) => {
    try {
      const record = await pb.collection("files").update<File>(id, {
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
        const record = await pb.collection("posts").update<Post>(post!.id, {
          nsfw,
          title: debouncedTitle || post.title,
          public: isPublic,
        });
        setValues(record);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, debouncedTitle, isPublic, nsfw]);

  const siteTitle = post?.title || `Post by ${props.postAuthorUsername}`;

  return (
    <>
      <Head>
        <title>{siteTitle} | Share Me</title>
        <meta property="og:title" content={`${siteTitle} | Share Me`} />
        <meta
          name="description"
          content={`Shared by ${props.postAuthorUsername}`}
        />
        <meta property="og:url" content="" />
        <meta property="og:type" content="article" />
        {props.image && <meta property="og:image" content={props.image} />}
        {props.video && <meta property="og:video" content={props.video} />}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={`${siteTitle} | Share Me`} />
        <meta
          property="twitter:description"
          content={`Shared by ${props.postAuthorUsername}`}
        />
        {props.image && <meta property="twitter:image" content={props.image} />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box component="main" p="lg">
        <Nav />
        <Group sx={{ justifyContent: "center" }} align="start">
          <Stack maw="650px" miw="350px" sx={{ flex: 1, flexGrow: 1 }} px="md">
            {userIsAuthor ? (
              <TextInput
                placeholder="Give your Post a Unique Title"
                size="xl"
                variant="unstyled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            ) : (
              post?.title && <Text>{post?.title}</Text>
            )}
            {files.map((f, idx) => (
              <Paper key={f.id} bg="dark.6" p="lg" withBorder>
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
                  {IMAGE_MIME_TYPE.includes(f.type as any) ? (
                    <Box
                      pos="relative"
                      sx={{
                        ":hover": {
                          "> button": {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <Image
                        src={pb.files.getUrl(f, f.file)}
                        alt=""
                        maw="100%"
                        sx={{
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
                  ) : (
                    <Box
                      pos="relative"
                      sx={{
                        ":hover": {
                          "> button": {
                            display: "block",
                          },
                        },
                      }}
                    >
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
                  )}
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
            {userIsAuthor && (
              <Dropzone
                onDrop={uploadFiles}
                onReject={(files) => console.log("rejected files", files)}
                accept={[...IMAGE_MIME_TYPE, MIME_TYPES.mp4]}
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
                      color={
                        theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]
                      }
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
            )}
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
      </Box>
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

  const images = (record.expand.files as File[]).filter((f) =>
    IMAGE_MIME_TYPE.includes(f.type as any)
  );
  const videos = (record.expand.files as File[]).filter(
    (f) => !IMAGE_MIME_TYPE.includes(f.type as any)
  );

  return {
    props: pocketBaseUrl({
      title: record.title,
      nsfw: record.nsfw,
      isPublic: record.public,
      userIsAuthor: pb.authStore.model?.id === record.author,
      postAuthorUsername: (record.expand.author as Record).username,
      image: images.length ? pb.files.getUrl(images[0], images[0].file) : null,
      video: videos.length ? pb.files.getUrl(videos[0], videos[0].file) : null,
    }),
  };
};
