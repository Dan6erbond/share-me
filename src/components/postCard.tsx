import { usePocketBase } from "@/pocketbase";
import { Post } from "@/pocketbase/models";
import { Carousel } from "@mantine/carousel";
import { CardProps, Flex, Image, Paper, Stack } from "@mantine/core";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import Link from "next/link";
import { Record } from "pocketbase";
import PostTitle from "./postTitle";

interface PostCardProps extends Omit<CardProps, "children"> {
  post: Post;
}

function PostCard({ post, ...props }: PostCardProps) {
  const pb = usePocketBase();

  return (
    <Paper
      key={post.id}
      p={0}
      {...props}
      component={Link}
      href={`/posts/${post.id}`}
      sx={(theme) => ({
        ":hover": { background: theme.colors.dark[8] },
        overflow: "hidden",
      })}
      bg="dark.6"
      radius="md"
      miw={0}
    >
      <Stack mah="70vh">
        <PostTitle post={post} p="md" />
        <Flex mih={0} w="100%" miw={0}>
          <Carousel
            withIndicators
            onClickCapture={(ev) => ev.preventDefault()}
            height="100%"
            w="100%"
          >
            {Array.isArray(post.expand.files) &&
              post.expand.files.map((f) => (
                <Carousel.Slide key={f.id}>
                  <Flex align="center" h="100%" w="100%" justify="center">
                    {IMAGE_MIME_TYPE.includes(f.type) ? (
                      <Image
                        src={pb.files.getUrl(f, f.file)}
                        sx={{ flex: 1 }}
                        alt={
                          post.title ||
                          `Post by ${(post.expand.author as Record).username}`
                        }
                      />
                    ) : (
                      <video
                        src={pb.files.getUrl(f, f.file)}
                        muted
                        autoPlay
                        controls={false}
                        style={{
                          objectFit: "contain",
                          objectPosition: "center",
                          maxHeight: "100%",
                          margin: "0 auto",
                          display: "block",
                        }}
                      />
                    )}
                  </Flex>
                </Carousel.Slide>
              ))}
          </Carousel>
        </Flex>
      </Stack>
    </Paper>
  );
}

export default PostCard;
