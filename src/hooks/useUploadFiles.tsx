import { usePocketBase } from "@/pocketbase";
import { File as ShareMeFile } from "@/pocketbase/models";
import { uploadFile } from "@/pocketbase/uploadFile";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export interface NewFile {
  file: File;
  name: string;
  author: string;
  description: string;
}

interface Upload {
  file: NewFile;
  uuid: string;
}

interface UseUploadFilesOptions {
  acceptTypes: string[];
}

export const useUploadFiles = ({ acceptTypes }: UseUploadFilesOptions) => {
  const pb = usePocketBase();
  const [uploads, setUploads] = useState([] as Upload[]);

  const uploadFiles = useCallback(
    async (files: NewFile[]) => {
      const promises = files.map(async (file) => {
        if (!acceptTypes.includes(file.file.type)) return;

        const uuid = uuidv4();

        try {
          setUploads((uploads) => [...uploads, { file, uuid }]);
          const createdRecord = await uploadFile(pb, file);
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
        } finally {
          setUploads((uploads) => uploads.filter(({ uuid: u }) => u !== uuid));
        }
      });

      const records = (await Promise.all(promises)).filter(
        (r) => r !== undefined
      ) as ShareMeFile[];

      return records;
    },
    [setUploads, acceptTypes, pb]
  );

  return { uploads, uploadFiles, uploading: uploads.length !== 0 };
};
