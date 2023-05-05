import { File as ShareMeFile } from "@/pocketbase/models";
import { uploadFile } from "@/pocketbase/uploadFile";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import { usePocketBase } from "@/pocketbase";

interface NewFile {
  file: File;
  name: string;
  author: string;
  description: string;
}

export const useUploadFiles = () => {
  const pb = usePocketBase();
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (files: NewFile[]) => {
    setUploading(true);

    const promises = files.map(async (file) => {
      try {
        const createdRecord = await uploadFile(pb, {
          file: file.file,
          name: file.name,
          author: file.author,
          description: file.description,
        });
        return createdRecord;
      } catch (ex: any) {
        console.error(ex);

        if (ex.response) {
          const { data, message } = ex.response;
          if (message === "Failed to create record.") {
            if (data.file) {
              const { code, message } = data.file;
              if (code === "validation_file_size_limit") {
                notifications.show({
                  color: "orange",
                  title: "File too large",
                  message: message,
                  icon: <IconAlertCircle />,
                });
                return;
              }
            }
          }
        }

        notifications.show({
          color: "red",
          title: "An error occured",
          message: "Please contact the developers",
          icon: <IconAlertCircle />,
        });
      }
    });

    const records = (await Promise.all(promises)).filter(
      (r) => r !== undefined
    ) as ShareMeFile[];

    setUploading(false);

    return records;
  };

  return { uploading, uploadFiles };
};
