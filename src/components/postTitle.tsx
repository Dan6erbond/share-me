import { Post } from "@/pocketbase/models";
import { getRelativeTime } from "@/utils/relativeTime";
import {
  Avatar,
  Badge,
  Box,
  BoxProps,
  Flex,
  Group,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { Record } from "pocketbase";

interface PostTitleProps extends BoxProps {
  post: Post;
  compact?: boolean;
}

function PostTitle({ post, compact, ...props }: PostTitleProps) {
  return (
    <Box {...props}>
      <Flex sx={{ justifyContent: "space-between" }} mb={compact ? 0 : "xs"}>
        <Tooltip
          label={new Date(post.created).toLocaleString()}
          color="dark"
          zIndex={1100}
        >
          <Text color="gray.6" size="sm">
            {getRelativeTime(new Date(), new Date(post.created))}
          </Text>
        </Tooltip>
        <Group spacing="sm">
          <Text size="sm">{(post.expand.author as Record).username}</Text>
          <Avatar radius="xl" size="sm"></Avatar>
        </Group>
      </Flex>
      <Title order={4}>
        {post.title || `Post by ${(post.expand.author as Record).username}`}
      </Title>
      {post.nsfw && <Badge color="red">NSFW</Badge>}
    </Box>
  );
}

export default PostTitle;
