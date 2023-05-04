import { IncomingMessage, ServerResponse } from "http";
import PocketBase from "pocketbase";

export const initPocketBase = (host?: string) => {
  return new PocketBase(
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_POCKETBASE_URL
      : host ?? "/"
  );
};

export const initPocketBaseServer = async (
  req?: IncomingMessage & {
    cookies: Partial<{
      [key: string]: string;
    }>;
  },
  res?: ServerResponse<IncomingMessage>
) => {
  const pb = initPocketBase(process.env.POCKETBASE_URL);

  // load the store data from the request cookie string
  pb.authStore.loadFromCookie(req?.headers?.cookie || "");

  // send back the default 'pb_auth' cookie to the client with the latest store state
  pb.authStore.onChange(() => {
    res?.setHeader("set-cookie", pb.authStore.exportToCookie());
  });

  try {
    // get an up-to-date auth store state by verifying and refreshing the loaded auth model (if any)
    pb.authStore.isValid && (await pb.collection("users").authRefresh());
  } catch (_) {
    // clear the auth store on failed refresh
    pb.authStore.clear();
  }

  return pb;
};

export const pocketBaseUrl = <T>(props: T): T & { pocketBaseUrl?: string } => ({
  ...props,
  pocketBaseUrl: process.env.POCKETBASE_URL,
});

export * from "./context";
