import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { useEffect, useRef } from "react";

interface UsePasteFilesOptions {
  acceptTypes: string[];
  onPaste: (files: File[]) => void;
}

export const usePasteFiles = ({
  acceptTypes,
  onPaste,
}: UsePasteFilesOptions) => {
  const pasteListenerRef = useRef<(ev: ClipboardEvent) => void>();

  useEffect(() => {
    if (typeof document !== "undefined") {
      pasteListenerRef.current &&
        document.removeEventListener("paste", pasteListenerRef.current);

      pasteListenerRef.current = (ev) => {
        if (!ev.clipboardData?.files.length) {
          return;
        }
        const files = Array.from(ev.clipboardData.files);
        if (files.filter((f) => !acceptTypes.includes(f.type)).length !== 0) {
          notifications.show({
            color: "red",
            title: "An error occured",
            message: "Please contact the developers",
            icon: <IconAlertCircle />,
          });
          return;
        }
        onPaste(files);
      };

      document.addEventListener("paste", pasteListenerRef.current);

      return () =>
        pasteListenerRef.current &&
        document.removeEventListener("paste", pasteListenerRef.current);
    }
  }, [onPaste, acceptTypes]);
};
