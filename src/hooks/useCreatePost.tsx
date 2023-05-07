import { usePocketBase } from "@/pocketbase";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { NewFile, useUploadFiles } from "./useUploadFiles";

interface NewPost {
  author: string;
  title: string;
  files: NewFile[];
  public?: boolean;
  nsfw?: boolean;
}

interface UseCreatePostOptions {
  acceptTypes: string[];
}

export const useCreatePost = ({ acceptTypes }: UseCreatePostOptions) => {
  const pb = usePocketBase();

  const { uploadFiles, uploading } = useUploadFiles({
    acceptTypes,
  });

  const createPost = (newPost: NewPost) => {
    notifications.show({
      id: "creating-post",
      title: "Creating Post",
      message: "Your files are being uploaded, this may take a while",
      loading: true,
    });

    return uploadFiles(newPost.files).then(async (records) => {
      if (records.length === 0) {
        notifications.show({
          color: "red",
          title: "An error occured",
          message: "No files were able to be uploaded",
          icon: <IconAlertCircle />,
        });

        return;
      }

      const post = await pb.collection("posts").create({
        title: newPost.title,
        author: newPost.author,
        files: records.map((f) => f.id),
        public: newPost.public,
        nsfw: newPost.nsfw,
      });

      notifications.hide("creating-post");

      return post;
    });
  };

  return { uploading, createPost };
};
