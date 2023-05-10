import { usePocketBase } from "@/pocketbase";
import { Avatar, AvatarProps } from "@mantine/core";
import { Record } from "pocketbase";

interface UserAvatarProps extends AvatarProps {
  user?: Record | null;
}

function UserAvatar({ user, ...props }: UserAvatarProps) {
  const pb = usePocketBase();

  return (
    <Avatar
      radius="xl"
      size="sm"
      src={
        user &&
        pb.getFileUrl(user, user.avatar, {
          thumb: "100x100",
        })
      }
      {...props}
    />
  );
}

export default UserAvatar;
