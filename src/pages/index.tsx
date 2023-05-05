import Dropzone from "@/components/dropzone";
import Head from "@/components/head";
import Nav from "@/components/nav";
import { pocketBaseUrl, usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import { Box, Group } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useUploadFiles } from "@/hooks/useUploadFiles";

export default function Home() {
  const router = useRouter();
  const pb = usePocketBase();
  const { user } = useAuth();

  const { uploading, uploadFiles: _uploadFiles } = useUploadFiles();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const uploadFiles = async (files: FileWithPath[]) =>
    _uploadFiles(
      files.map((file) => ({
        file: file,
        name: file.name,
        author: user?.id!,
        description: "",
      }))
    ).then(async (records) => {
      if (records.length === 0) {
        return;
      }

      const post = await pb.collection("posts").create({
        title: "",
        author: user?.id!,
        files: records.map((f) => f.id),
        public: false,
      });

      router.push("/posts/" + post.id);
    });

  return (
    <>
      <Head pageTitle="Upload" />
      <Box component="main" p="lg">
        <Nav />
        <Group sx={{ justifyContent: "center" }} align="start">
          <Dropzone onDrop={uploadFiles} loading={uploading} />
        </Group>
      </Box>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: pocketBaseUrl({}),
  };
};
