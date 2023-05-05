import Dropzone from "@/components/dropzone";
import Nav from "@/components/nav";
import { pocketBaseUrl, usePocketBase } from "@/pocketbase";
import { useAuth } from "@/pocketbase/auth";
import { File } from "@/pocketbase/models";
import { Box, Group } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { GetServerSideProps } from "next";
import Head from "next/head";
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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("type", file.type);
      formData.append("author", user?.id!);
      formData.append("description", "");
      try {
        const createdRecord = await pb
          .collection("files")
          .create<File>(formData);
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
      <Head>
        <title>Share Me</title>
        <meta
          name="description"
          content="Easily share images and videos with others"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
