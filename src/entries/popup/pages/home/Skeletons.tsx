import { motion } from 'framer-motion';

import { Box, Inline, Inset, Stack } from '~/design-system';
import { Skeleton } from '~/design-system/components/Skeleton/Skeleton';

export function TokensSkeleton() {
  const array = Array(6).fill(null);
  return (
    <Box paddingTop="10px" style={{ height: 200, overflow: 'visible' }}>
      <Inset horizontal="20px">
        <Stack space="16px">
          {array.map((_, index) => (
            <Box
              key={index}
              as={motion.div}
              layoutId={`list-skeleton-${index}`}
              layoutScroll
              layout="position"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              style={{ opacity: 1 - index * 0.2 }}
            >
              <Inline alignVertical="center" space="8px">
                <Skeleton circle width="36px" height="36px" />
                <Stack space="8px">
                  <Skeleton
                    width="88px"
                    height="10px"
                    layoutId={`list-skeleton-${index}-1`}
                  />
                  <Skeleton
                    width="80px"
                    height="8px"
                    layoutId={`list-skeleton-${index}-2`}
                  />
                </Stack>
              </Inline>

              <Stack alignHorizontal="right" space="8px">
                <Skeleton
                  width="60px"
                  height="10px"
                  layoutId={`list-skeleton-${index}-3`}
                />
                <Skeleton
                  width="44px"
                  height="8px"
                  layoutId={`list-skeleton-${index}-4`}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Inset>
    </Box>
  );
}

export function ActivitySkeleton() {
  const array = Array(5).fill(null);
  return (
    <Box paddingTop="10px" style={{ height: 200, overflow: 'visible' }}>
      <Inset horizontal="20px">
        <Stack space="20px">
          <Skeleton
            width="80px"
            height="8px"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
          {array.map((_, index) => (
            <Box
              key={index}
              as={motion.div}
              layoutId={`list-skeleton-${index}`}
              layoutScroll
              layout="position"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              style={{ opacity: 1 - index * 0.2 }}
            >
              <Inline alignVertical="center" space="8px">
                <Skeleton circle width="36px" height="36px" />
                <Stack space="8px">
                  <Skeleton
                    width="62px"
                    height="8px"
                    layoutId={`list-skeleton-${index}-1`}
                  />
                  <Skeleton
                    width="88px"
                    height="10px"
                    layoutId={`list-skeleton-${index}-2`}
                  />
                </Stack>
              </Inline>

              <Stack alignHorizontal="right" space="8px">
                <Skeleton
                  width="44px"
                  height="8px"
                  layoutId={`list-skeleton-${index}-3`}
                />
                <Skeleton
                  width="60px"
                  height="10px"
                  layoutId={`list-skeleton-${index}-4`}
                />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Inset>
    </Box>
  );
}

export function ActivityDetailsContentSkeleton() {
  return (
    <>
      {/* ToFrom section */}
      <Stack space="24px">
        <Box display="flex" alignItems="center" gap="8px">
          <Skeleton circle width="16px" height="16px" />
          <Skeleton width="60px" height="12px" />
          <Box flexGrow="1" />
          <Skeleton width="120px" height="12px" />
        </Box>
        <Box display="flex" alignItems="center" gap="8px">
          <Skeleton circle width="16px" height="16px" />
          <Skeleton width="40px" height="12px" />
          <Box flexGrow="1" />
          <Skeleton width="120px" height="12px" />
        </Box>
      </Stack>

      {/* ConfirmationData section */}
      <Stack space="24px">
        <Box display="flex" alignItems="center" gap="8px">
          <Skeleton circle width="16px" height="16px" />
          <Skeleton width="40px" height="12px" />
          <Box flexGrow="1" />
          <Skeleton width="140px" height="12px" />
        </Box>
        <Box display="flex" alignItems="center" gap="8px">
          <Skeleton circle width="16px" height="16px" />
          <Skeleton width="80px" height="12px" />
          <Box flexGrow="1" />
          <Skeleton width="100px" height="12px" />
        </Box>
      </Stack>

      {/* NetworkData section */}
      <Stack space="24px">
        <Box display="flex" alignItems="center" gap="8px">
          <Skeleton circle width="16px" height="16px" />
          <Skeleton width="50px" height="12px" />
          <Box flexGrow="1" />
          <Skeleton width="80px" height="12px" />
        </Box>
        <Box display="flex" alignItems="center" gap="8px">
          <Skeleton circle width="16px" height="16px" />
          <Skeleton width="60px" height="12px" />
          <Box flexGrow="1" />
          <Skeleton width="90px" height="12px" />
        </Box>
        <Box display="flex" alignItems="center" gap="8px">
          <Skeleton circle width="16px" height="16px" />
          <Skeleton width="30px" height="12px" />
          <Box flexGrow="1" />
          <Skeleton width="70px" height="12px" />
        </Box>
      </Stack>
    </>
  );
}
