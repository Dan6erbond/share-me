import { File as ShareMeFile } from "@/pocketbase/models";
import PocketBase from "pocketbase";

interface NewFile {
  file: File;
  name: string;
  author: string;
  description: string;
}

export const uploadFile = async (pb: PocketBase, file: NewFile) => {
  const formData = new FormData();
  formData.append("file", file.file);
  formData.append("name", file.name);
  formData.append("type", file.file.type);
  formData.append("author", file.author);
  formData.append("description", file.description);
  const createdRecord = await pb
    .collection("files")
    .create<ShareMeFile>(formData, { $autoCancel: false });
  return createdRecord;
};
