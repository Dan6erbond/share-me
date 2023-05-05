import Dropzone from "@/components/dropzone";
import Nav from "@/components/nav";
import { pocketBaseUrl, usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import { File } from "@/pocketbase/models";
import { uploadFile } from "@/pocketbase/uploadFile";
import { Box, Group } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { GetServerSideProps } from "next";
import Head from "@/components/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const pb = usePocketBase();
  const { user } = useAuth();

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const uploadFiles = async (files: FileWithPath[]) => {
    setUploading(true);
    const records: File[] = [];

    for (const file of files) {
      try {
        const createdRecord = await uploadFile(pb, {
          file: file,
          name: file.name,
          author: user?.id!,
          description: "",
        });
        records.push(createdRecord);
      } catch (ex) {
        console.error(ex);
        notifications.show({
          color: "red",
          title: "An error occured",
          message: "Please contact the developers",
          icon: <IconAlertCircle />,
        });
      }
    }

    if (!records) {
      setUploading(false);
      return;
    }

    const post = await pb.collection("posts").create({
      title: "",
      author: user?.id!,
      files: records.map((f) => f.id),
      public: false,
    });
    setUploading(false);
    router.push("/posts/" + post.id);
  };

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
