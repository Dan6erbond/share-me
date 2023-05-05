import { IMAGE_MIME_TYPE, MIME_TYPES } from "@mantine/dropzone";

const VIDEO_MIME_TYPE = [
  MIME_TYPES.mp4,
  "video/mpeg",
  "video/quicktime",
  "video/webm",
] as const;

export const MEDIA_MIME_TYPE = [...IMAGE_MIME_TYPE, ...VIDEO_MIME_TYPE];
