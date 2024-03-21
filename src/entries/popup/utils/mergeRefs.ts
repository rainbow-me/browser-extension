import type { LegacyRef, MutableRefObject, RefCallback } from 'react';

export const mergeRefs =
  <T>(
    ...refs: Array<MutableRefObject<T> | LegacyRef<T> | undefined | null>
  ): RefCallback<T> =>
  (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref != null) (ref as MutableRefObject<T | null>).current = node;
    }
  };
