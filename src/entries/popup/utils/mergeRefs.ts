import type { ForwardedRef, RefCallback } from 'react';

export const mergeRefs =
  <T>(...refs: Array<ForwardedRef<T>>): RefCallback<T> =>
  (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref != null) ref.current = node;
    }
  };
