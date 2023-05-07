import { pocketBaseUrl } from "../pocketbase";

export const withEnv = <T>(
  props: T
): T & { signupEnabled: boolean; pocketbaseUrl?: string } =>
  pocketBaseUrl({
    ...props,
    signupEnabled: process.env.SIGNUP_ENABLED
      ? process.env.SIGNUP_ENABLED === "true"
      : true,
  });
