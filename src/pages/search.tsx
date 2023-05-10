import Layout from "@/components/layout";
import PostCard from "@/components/postCard";
import { useMeiliSearch } from "@/meilisearch/context";
import { usePocketBase } from "@/pocketbase";
import { Post } from "@/pocketbase/models";
import { ShareMeEnv, withEnv } from "@/utils/env";
import { Skeleton, Stack, Text, TextInput, Title } from "@mantine/core";
import { MeiliSearch } from "meilisearch";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useQuery } from "react-query";

interface SearchProps extends ShareMeEnv {}

function Search({ signUpEnabled }: SearchProps) {
  const router = useRouter();
  const pb = usePocketBase();
  const meiliSearch = useMeiliSearch();

  const { data: hits } = useQuery(
    ["search", router.query.query, meiliSearch] as [
      string,
      string[] | string | undefined,
      MeiliSearch
    ],
    ({ queryKey }) => {
      const [_, search, client] = queryKey;

      return client
        ?.index("posts")
        .search(Array.isArray(search) ? search[0] : search!);
    }
  );

  const { data, isLoading } = useQuery([hits], ({ queryKey }) => {
    const [hits] = queryKey;

    return hits?.hits.length
      ? pb.collection("posts").getList<Post>(1, 20, {
          expand: "files,author",
          filter: hits.hits.map((hit) => `id = '${hit.id}'`).join(" || "),
          $autoCancel: false,
        })
      : null;
  });

  return (
    <Layout signUpEnabled={signUpEnabled}>
      <Stack align="stretch" maw={450} m="0 auto">
        <Title order={2}>
          Search results for &apos;{router.query.query}&apos;
        </Title>
        <TextInput
          placeholder="Search"
          size="lg"
          radius="xl"
          variant="filled"
          value={router.query.query}
          onChange={(e) => router.push("/search?query=" + e.target.value)}
        />
        <Text>{hits?.hits.length} Results</Text>
        {data?.items.map((p) => (
          <PostCard key={p.id} post={p} maw="100%" />
        ))}
        {isLoading &&
          new Array(10)
            .fill(null)
            .map((_, i) => (
              <Skeleton key={i} height={200} width="100%" maw={400} />
            ))}
        <Text align="center">
          Showing {data?.items.length} / {data?.totalItems} Posts
        </Text>
      </Stack>
    </Layout>
  );
}

export default Search;

export const getServerSideProps: GetServerSideProps<SearchProps> = async () => {
  const props = withEnv({});

  if (!props.meiliSearch) {
    return { notFound: true };
  }

  return {
    props,
  };
};
