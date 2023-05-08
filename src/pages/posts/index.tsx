import Layout from "@/components/layout";
import PostCard from "@/components/postCard";
import { useCreatePost } from "@/hooks/useCreatePost";
import { usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import { Post } from "@/pocketbase/models";
import { ShareMeEnv, withEnv } from "@/utils/env";
import { MEDIA_MIME_TYPE } from "@/utils/mediaTypes";
import { Skeleton, Stack, Text } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useInfiniteQuery } from "react-query";

interface PostsProps extends ShareMeEnv {}

export default function Posts({ signUpEnabled }: PostsProps) {
  const router = useRouter();
  const pb = usePocketBase();
  const { user } = useAuth();
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

  const { ref, entry } = useIntersection();

  useEffect(() => {
    entry &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isLoading &&
      fetchNextPage();
  }, [isLoading, hasNextPage, entry, isFetchingNextPage, fetchNextPage]);

  return (
    <Layout
      signUpEnabled={signUpEnabled}
      onFiles={(files) => user && createPost(files)}
    >
      <Stack align="stretch" maw={450} m="0 auto">
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
              <Skeleton key={i} height={200} width="100%" maw={400} ref={ref} />
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
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: withEnv({}),
  };
};
