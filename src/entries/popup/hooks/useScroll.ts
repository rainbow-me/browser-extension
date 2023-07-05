import { useScroll as useMotionScroll } from 'framer-motion';

import { useContainerRef } from '~/design-system/components/AnimatedRoute/AnimatedRoute';

export const useScroll = (options?: Parameters<typeof useMotionScroll>[0]) => {
  const container = useContainerRef();
  return useMotionScroll({ container, layoutEffect: false, ...options });
};
