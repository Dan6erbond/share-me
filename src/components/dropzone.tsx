import { MEDIA_MIME_TYPE } from "@/utils/mediaTypes";
import { Box, Group, Text, rem, useMantineTheme } from "@mantine/core";
import { DropzoneProps, Dropzone as MantineDropzone } from "@mantine/dropzone";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";

function Dropzone(
  props: Pick<DropzoneProps, "onDrop"> & Partial<DropzoneProps>
) {
  const theme = useMantineTheme();

  return (
    <MantineDropzone
      onReject={(files) => console.log("rejected files", files)}
      accept={MEDIA_MIME_TYPE}
      {...props}
    >
      <Group
        position="center"
        spacing="xl"
        style={{ minHeight: rem(220), pointerEvents: "none" }}
      >
        <MantineDropzone.Accept>
          <IconUpload
            size="3.2rem"
            stroke={1.5}
            color={
              theme.colors[theme.primaryColor][
                theme.colorScheme === "dark" ? 4 : 6
              ]
            }
          />
        </MantineDropzone.Accept>
        <MantineDropzone.Reject>
          <IconX
            size="3.2rem"
            stroke={1.5}
            color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
          />
        </MantineDropzone.Reject>
        <MantineDropzone.Idle>
          <IconPhoto size="3.2rem" stroke={1.5} />
        </MantineDropzone.Idle>

        <Box>
          <Text size="xl" inline>
            Drag images here or click to select files
          </Text>
          <Text size="sm" color="dimmed" inline mt={7}>
            Attach as many files as you like
          </Text>
        </Box>
      </Group>
    </MantineDropzone>
  );
}

export default Dropzone;
