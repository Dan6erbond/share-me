import { usePocketBase } from "@/pocketbase";
import { Post } from "@/pocketbase/models";
import {
  Badge,
  Box,
  Card,
  CardProps,
  Center,
  Image,
  Text,
  Title,
} from "@mantine/core";
import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import Link from "next/link";
import { Record } from "pocketbase";

interface PostCardProps extends Omit<CardProps, "children"> {
  post: Post;
}

function PostCard({ post, ...props }: PostCardProps) {
  const pb = usePocketBase();

  return (
    <Card
      key={post.id}
      p={0}
      {...props}
      component={Link}
      href={`/posts/${post.id}`}
      sx={(theme) => ({
        ":hover": { background: theme.colors.dark[8] },
      })}
    >
      <Card.Section p="md" pt={32} m={0}>
        <Title order={4}>
          {post.title || `Post by ${(post.expand.author as Record).username}`}
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
                  `Post by ${(post.expand.author as Record).username}`
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
                  background: theme.fn.rgba(theme.colors.dark[8], 0.7),
                })}
                top={0}
                right={0}
                bottom={0}
                left={0}
              >
                <Center h="100%" w="100%">
                  <Box>
                    <Text size="xl">{post.expand.files.length - 1} +</Text>
                  </Box>
                </Center>
              </Box>
            )}
          </Box>
        )}
      </Card.Section>
    </Card>
  );
}

export default PostCard;
