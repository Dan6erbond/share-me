import Head from "@/components/head";
import Layout from "@/components/layout";
import PostCard from "@/components/postCard";
import UserAvatar from "@/components/userAvatar";
import { useCreatePost } from "@/hooks/useCreatePost";
import { initPocketBaseServer, usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import { Post } from "@/pocketbase/models";
import { ShareMeEnv, withEnv } from "@/utils/env";
import { MEDIA_MIME_TYPE } from "@/utils/mediaTypes";
import {
  ActionIcon,
  Box,
  Card,
  Group,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useIntersection } from "@mantine/hooks";
import { IconCameraPlus } from "@tabler/icons-react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Record } from "pocketbase";
import { ChangeEvent, useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "react-query";

interface PostsProps extends ShareMeEnv {
  username: string;
  avatar: string;
  postsLength: number;
}

export default function Posts({
  signUpEnabled,
  postsLength,
  username,
  avatar,
}: PostsProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { id } = router.query;

  const pb = usePocketBase();
  const { user: authenticatedUser } = useAuth();

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { data: userData } = useQuery(["users", id], () =>
    pb.collection("users").getOne(Array.isArray(id) ? id[0] : id!)
  );

  const {
    isLoading,
    error,
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    "posts",
    ({ pageParam = 1 }) =>
      pb.collection("posts").getList<Post>(pageParam, 20, {
        expand: "files,author",
        sort: "-created",
        $autoCancel: false,
        filter: `author.id = "${id}"`,
      }),
    {
      getNextPageParam: (data) =>
        data.page < data.totalPages ? data.page + 1 : null,
    }
  );

  const { createPost: _createPost } = useCreatePost({
    acceptTypes: MEDIA_MIME_TYPE,
  });

  const createPost = (files: File[]) =>
    _createPost({
      title: "",
      author: authenticatedUser?.id!,
      files: files.map((file) => ({
        file: file,
        name: file.name,
        author: authenticatedUser?.id!,
        description: "",
      })),
    }).then(async (post) => {
      if (!post) {
        return;
      }

      router.push("/posts/" + post.id);
    });

  const { ref, entry } = useIntersection();

  useEffect(() => {
    entry &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isLoading &&
      fetchNextPage();
  }, [isLoading, hasNextPage, entry, isFetchingNextPage, fetchNextPage]);

  const onAvatarSelect = (ev: ChangeEvent<HTMLInputElement>) => {
    if (!ev.target.files || ev.target.files.length < 1) return;
    if (userData?.id !== authenticatedUser?.id) return;
    const formData = new FormData();
    formData.append("avatar", ev.target.files[0]);
    pb.collection("users")
      .update(userData!.id, formData, {
        $autoCancel: false,
      })
      .then((record) => queryClient.invalidateQueries(["users", record.id]));
  };

  return (
    <>
      <Head pageTitle={username} image={avatar} />

      <Layout
        signUpEnabled={signUpEnabled}
        onFiles={(files) => authenticatedUser && createPost(files)}
      >
        <Stack align="stretch" maw={450} m="0 auto">
          {userData && (
            <Card>
              <Card.Section bg="dark.8" p="md" pos="relative">
                <Group>
                  <Title>{username}</Title>
                </Group>
                <Box
                  pos="absolute"
                  bottom={-40}
                  right={25}
                  onClick={() =>
                    authenticatedUser?.id === userData.id &&
                    avatarInputRef.current?.click()
                  }
                >
                  <UserAvatar user={userData} size="xl" radius={100} />
                  {authenticatedUser?.id === userData.id && (
                    <>
                      <ActionIcon pos="absolute" bottom={0} right={0}>
                        <IconCameraPlus />
                      </ActionIcon>
                      <input
                        type="file"
                        accept={IMAGE_MIME_TYPE.join(",")}
                        style={{ display: "none" }}
                        ref={avatarInputRef}
                        onChange={onAvatarSelect}
                      />
                    </>
                  )}
                </Box>
              </Card.Section>
              <Card.Section p="md">
                <Text>
                  {postsLength} {postsLength > 1 ? "Posts" : "Post"}
                </Text>
              </Card.Section>
            </Card>
          )}
          {data?.pages.map((p) => (
            <>
              {p.items.map((p) => (
                <PostCard key={p.id} post={p} maw="100%" />
              ))}
            </>
          ))}
          {(isFetchingNextPage || isLoading) &&
            new Array(10)
              .fill(null)
              .map((_, i) => (
                <Skeleton
                  key={i}
                  height={200}
                  width="100%"
                  maw={400}
                  ref={ref}
                />
              ))}
          {hasNextPage && (
            <Skeleton height={200} width="100%" maw={400} ref={ref} />
          )}
          <Text>
            Showing {data?.pages.reduce((p, c) => p + c.items.length, 0)} /{" "}
            {data?.pages[0].totalItems} Posts
          </Text>
        </Stack>
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<PostsProps> = async ({
  req,
  res,
  query,
}) => {
  const pb = await initPocketBaseServer(req, res);

  const { id } = query;

  let user: Record | null = null;

  try {
    user = await pb.collection("users").getOne(Array.isArray(id) ? id[0] : id!);
  } catch (ex) {
    if ((ex as any).response.code === 404) {
      return { notFound: true };
    }
    console.error(ex);
  }

  if (!user) {
    return { notFound: true };
  }

  const avatar = pb.getFileUrl(user, user.avatar, {
    thumb: "100x100",
  });

  const userPosts = await pb.collection("posts").getList<Post>(1, 20, {
    expand: "files,author",
    sort: "-created",
    $autoCancel: false,
    filter: `author.id = "${user.id}"`,
  });

  const postsLength = userPosts.totalItems;

  return {
    props: withEnv({ avatar, postsLength, username: user.username }),
  };
};
