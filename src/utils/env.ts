import { pocketBaseUrl } from "../pocketbase";

interface ShareMeEnv {
  signUpEnabled: boolean;
  pocketbaseUrl?: string;
}

export const withEnv = <T>(props: T): T & ShareMeEnv =>
  pocketBaseUrl({
    ...props,
    signUpEnabled: process.env.SIGNUP_ENABLED
      ? process.env.SIGNUP_ENABLED === "true"
      : true,
  });
