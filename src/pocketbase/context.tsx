import PocketBase from "pocketbase";
import React, { useContext } from "react";

const PocketBaseContext = React.createContext<PocketBase | null>(null);

interface PocketBaseProviderProps {
  client: PocketBase;
  children?: React.ReactNode;
}

export const PocketBaseProvider = ({
  client,
  children,
}: PocketBaseProviderProps) => {
  return (
    <PocketBaseContext.Provider value={client}>
      {children}
    </PocketBaseContext.Provider>
  );
};

export const usePocketBase = () => {
  const pb = useContext(PocketBaseContext);

  if (!pb) {
    throw Error("could not retrieve PocketBase client");
  }

  return pb;
};
