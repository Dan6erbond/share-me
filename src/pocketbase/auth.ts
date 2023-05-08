import { useEffect, useState } from "react";
import { usePocketBase } from "./context";

export const useAuth = () => {
  const pb = usePocketBase();

  const [user, setUser] = useState(pb.authStore.model);

  useEffect(() => {
    pb.authStore.isValid &&
      pb
        .collection("users")
        .authRefresh({}, { $autoCancel: false })
        .then((record) => setUser(record.record))
        .catch((ex) => {
          console.error(ex);
          pb.authStore.clear();
          setUser(null);
        });
    pb.authStore.onChange((_, model) => {
      setUser(model);
    });
  }, [pb, setUser]);

  return { user };
};
