import React from 'react';

import { Box, Inset } from '~/design-system';

import { skeletonCircle, skeletonLine } from './ActivitySkeleton.css';

export function TokensSkeleton() {
  const array = Array(6).fill(null);
  return (
    <Inset horizontal="20px">
      {array.map((_, index) => (
        <Box
          key={index}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          paddingBottom="16px"
        >
          <Box display="flex" alignItems="center">
            <Box className={skeletonCircle} background="fillHorizontal" />
            <Box paddingLeft="8px" flexDirection="column" display="flex">
              <Box
                className={skeletonLine}
                background="fillHorizontal"
                style={{
                  marginBottom: '8px',
                  width: '88px',
                  height: '10px',
                }}
              />
              <Box
                className={skeletonLine}
                background="fillHorizontal"
                style={{ width: '80px', height: '8px' }}
              />
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Box
              className={skeletonLine}
              background="fillHorizontal"
              style={{ marginBottom: '8px', width: '60px', height: '10px' }}
            />
            <Box
              className={skeletonLine}
              background="fillHorizontal"
              style={{ width: '44px', height: '8px' }}
            />
          </Box>
        </Box>
      ))}
    </Inset>
  );
}

export function ActivitySkeleton() {
  const array = Array(6).fill(null);
  return (
    <Inset horizontal="20px">
      <Box
        className={skeletonLine}
        background="fillHorizontal"
        style={{ width: '80px', height: '8px', marginBottom: '16px' }}
      />
      {array.map((_, index) => (
        <Box
          key={index}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          paddingBottom="16px"
        >
          <Box display="flex" alignItems="center">
            <Box className={skeletonCircle} background="fillHorizontal" />
            <Box paddingLeft="8px" flexDirection="column" display="flex">
              <Box
                className={skeletonLine}
                background="fillHorizontal"
                style={{ marginBottom: '8px', width: '62px', height: '8px' }}
              />
              <Box
                className={skeletonLine}
                background="fillHorizontal"
                style={{
                  width: '88px',
                  height: '10px',
                }}
              />
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Box
              className={skeletonLine}
              background="fillHorizontal"
              style={{ marginBottom: '8px', width: '44px', height: '8px' }}
            />
            <Box
              className={skeletonLine}
              background="fillHorizontal"
              style={{ width: '60px', height: '10px' }}
            />
          </Box>
        </Box>
      ))}
    </Inset>
  );
}
