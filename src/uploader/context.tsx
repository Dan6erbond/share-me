import { Post, File as ShareMeFile } from "@/pocketbase/models";
import PocketBase from "pocketbase";
import React, { useReducer } from "react";
import { NewFile, Upload, uploaderReducer } from "./reducer";

interface Uploader {
  uploadFile: (
    file: NewFile,
    post: Post,
    onCompleted: (file: ShareMeFile) => void,
    onError: (exception: any) => void
  ) => Promise<void>;
  uploads: Upload[];
}

const UploaderContext = React.createContext<Uploader | null>(null);

interface UploaderContextProviderProps {
  children?: React.ReactNode;
  pocketBase: PocketBase;
}

export const UploaderContextProvider = ({
  children,
  pocketBase,
}: UploaderContextProviderProps) => {
  const [state, dispatch] = useReducer(uploaderReducer, {
    pocketBase,
    uploads: [],
    onUploadProgress: (upload: Upload, progress?: number) => {
      dispatch({ type: "UPDATE_PROGRESS", upload, progress });
    },
  });

  const uploadFile = async (
    file: NewFile,
    post: Post,
    onCompleted: (file: ShareMeFile) => void,
    onError: (exception: any) => void
  ) => {
    dispatch({
      type: "ADD_UPLOAD",
      file,
      post,
      onCompleted: (upload: Upload, file: ShareMeFile) => {
        dispatch({
          type: "FINISH_UPLOAD",
          upload,
        });
        onCompleted(file);
      },
      onError,
    });
  };

  return (
    <UploaderContext.Provider value={{ uploadFile, uploads: state.uploads }}>
      {children}
    </UploaderContext.Provider>
  );
};
