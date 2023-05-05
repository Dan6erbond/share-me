import { Post, File as ShareMeFile } from "@/pocketbase/models";
import axios from "axios";
import PocketBase from "pocketbase";

export interface NewFile {
  file: File;
  name: string;
  author: string;
  description: string;
}

export interface Upload {
  file: File;
  post: Post;
  progress: number;
}

interface UploaderState {
  pocketBase: PocketBase;
  uploads: Upload[];
  onUploadProgress: (upload: Upload, progress?: number) => void;
}

type UploaderAction =
  | {
      type: "ADD_UPLOAD";
      file: NewFile;
      post: Post;
      onCompleted: (upload: Upload, file: ShareMeFile) => void;
      onError: (upload: Upload, exception: any) => void;
    }
  | { type: "UPDATE_PROGRESS"; upload: Upload; progress?: number }
  | { type: "FINISH_UPLOAD"; upload: Upload };

export const uploaderReducer = (
  state: UploaderState,
  action: UploaderAction
): UploaderState => {
  switch (action.type) {
    case "ADD_UPLOAD":
      const formData = new FormData();
      formData.append("file", action.file.file);
      formData.append("name", action.file.name);
      formData.append("type", action.file.file.type);
      formData.append("author", action.file.author);
      formData.append("description", action.file.description);

      const upload = { file: action.file.file, post: action.post, progress: 0 };

      axios
        .post(
          state.pocketBase.buildUrl("/collections/files/records"),
          formData,
          {
            onUploadProgress: (ev) =>
              state.onUploadProgress(upload, ev.progress),
          }
        )
        .then((res) => {
          if (res.status === 200) {
            action.onCompleted(upload, res.data);
          } else {
            action.onError(upload, res.data);
          }
        });
      return { ...state, uploads: [...state.uploads, upload] };
    case "UPDATE_PROGRESS":
      return {
        ...state,
        uploads: state.uploads.map((u) =>
          u.file.name === action.upload.file.name
            ? { ...u, progress: action.progress ?? u.progress }
            : u
        ),
      };
    case "FINISH_UPLOAD":
      return {
        ...state,
        uploads: state.uploads.filter(
          (u) => u.file.name !== action.upload.file.name
        ),
      };
  }
};
