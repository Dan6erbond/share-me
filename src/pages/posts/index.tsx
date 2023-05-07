import Layout from "@/components/layout";
import PostCard from "@/components/postCard";
import { usePocketBase } from "@/pocketbase";
import { Post } from "@/pocketbase/models";
import { Skeleton, Stack, Text } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { useEffect } from "react";
import { useInfiniteQuery } from "react-query";

export default function Posts() {
  const pb = usePocketBase();
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

  const { ref, entry } = useIntersection();

  useEffect(() => {
    entry &&
      hasNextPage &&
      !isFetchingNextPage &&
      !isLoading &&
      fetchNextPage();
  }, [isLoading, hasNextPage, entry, isFetchingNextPage, fetchNextPage]);

  return (
    <Layout>
      <Stack align="center">
        {data?.pages.map((p) => (
          <>
            {p.items.map((p) => (
              <PostCard key={p.id} post={p} maw={400} />
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
