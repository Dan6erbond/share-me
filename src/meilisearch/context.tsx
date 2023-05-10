import { MeiliSearch } from "meilisearch";
import React, { useContext, useEffect, useState } from "react";

const MeiliSearchContext = React.createContext<MeiliSearch | null>(null);

interface MeiliSearchProviderProps {
  init: () => MeiliSearch | undefined | Promise<MeiliSearch | undefined>;
  children?: React.ReactNode;
}

export const MeiliSearchProvider = ({
  init,
  children,
}: MeiliSearchProviderProps) => {
  const [client, setClient] = useState<MeiliSearch | null | undefined>(null);

  useEffect(() => {
    const res = init();

    if (res instanceof Promise) {
      res.then(setClient);
    } else {
      setClient(res);
    }
  }, [setClient, init]);

  return (
    <MeiliSearchContext.Provider value={client ?? null}>
      {children}
    </MeiliSearchContext.Provider>
  );
};

export const useMeiliSearch = () => useContext(MeiliSearchContext);
