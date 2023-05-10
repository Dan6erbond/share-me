import { usePocketBase } from "@/pocketbase";
import { Post } from "@/pocketbase/models";
import { getRelativeTime } from "@/utils/relativeTime";
import {
  Anchor,
  Badge,
  Box,
  BoxProps,
  Flex,
  Group,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import Link from "next/link";
import { Record } from "pocketbase";
import UserAvatar from "./userAvatar";

interface PostTitleProps extends BoxProps {
  post: Post;
  compact?: boolean;
}

function PostTitle({ post, compact, ...props }: PostTitleProps) {
  const pb = usePocketBase();

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
        <Anchor
          component={Link}
          href={`/users/${(post.expand.author as Record).id}`}
          sx={{ ":hover": { textDecoration: "underline" } }}
          unstyled
        >
          <Group spacing="sm">
            <Text size="sm">{(post.expand.author as Record).username}</Text>
            <UserAvatar user={post.expand.author as Record | null} />
          </Group>
        </Anchor>
      </Flex>
      <Anchor component={Link} href={`/posts/${post.id}`} unstyled>
        <Title order={4}>
          {post.title || `Post by ${(post.expand.author as Record).username}`}
        </Title>
      </Anchor>
      {post.nsfw && <Badge color="red">NSFW</Badge>}
    </Box>
  );
}

export default PostTitle;
