import { Admin, Record } from "pocketbase";
import { useEffect, useState } from "react";
import { usePocketBase } from "./context";

export const useAuth = () => {
  const pb = usePocketBase();

  const [user, setUser] = useState(pb.authStore.model);

  useEffect(() => {
    pb.authStore.onChange((_, model) => {
      setUser(model);
    });
  }, [pb, setUser]);

  return { user };
};
