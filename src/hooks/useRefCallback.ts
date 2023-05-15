import { DependencyList, useCallback, useEffect, useRef } from "react";

export const useRefCallback = <T extends Function>(
  callback: T,
  deps: DependencyList
) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const func = useCallback(callback, deps);
  const ref = useRef(func);

  useEffect(() => {
    ref.current = func;
  }, [func]);

  return ref;
};
