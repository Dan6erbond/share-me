import { useEffect, useState } from "react";
import { usePocketBase } from "../pocketbase";
import { AuthProviderInfo } from "pocketbase";

export const useAuthMethods = () => {
  const pb = usePocketBase();

  const [usernamePasswordEnabled, setUsernamePasswordEnabled] = useState(true);
  const [authProviders, setAuthProviders] = useState<AuthProviderInfo[]>();

  useEffect(() => {
    (async () => {
      const authMethods = await pb.collection("users").listAuthMethods();
      setAuthProviders(authMethods.authProviders);
      setUsernamePasswordEnabled(
        authMethods.usernamePassword || authMethods.emailPassword
      );
    })();
  }, [pb, setAuthProviders, setUsernamePasswordEnabled]);

  return { usernamePasswordEnabled, authProviders };
};