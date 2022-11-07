import { RefObject, useEffect, useRef, useState } from 'react';

export function useHover<T>(): [RefObject<T>, boolean] {
  const [isHovered, setIsHovered] = useState(false);
  const ref: RefObject<T> = useRef<T>(null);

  const handleMouseOver = (): void => setIsHovered(true);
  const handleMouseOut = (): void => setIsHovered(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node: any = ref.current;
    if (node) {
      node.addEventListener('mouseover', handleMouseOver);
      node.addEventListener('mouseout', handleMouseOut);
    }
    return () => {
      node.removeEventListener('mouseover', handleMouseOver);
      node.removeEventListener('mouseout', handleMouseOut);
    };
  }, [ref]);

  return [ref, isHovered];
}
