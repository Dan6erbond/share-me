import { usePocketBase } from "@/pocketbase";
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

  const createPost = (newPost: NewPost) =>
    uploadFiles(newPost.files).then(async (records) => {
      if (records.length === 0) {
        return;
      }

      const post = await pb.collection("posts").create({
        title: newPost.title,
        author: newPost.author,
        files: records.map((f) => f.id),
        public: newPost.public,
        nsfw: newPost.nsfw,
      });

      return post;
    });

  return { uploading, createPost };
};
