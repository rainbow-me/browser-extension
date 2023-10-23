/* eslint-disable react/jsx-props-no-spreading */
import omit from 'lodash/omit';
import * as React from 'react';

import { Box, Text } from '~/design-system';
import { TextProps } from '~/design-system/components/Text/Text';
import { BoxStyles } from '~/design-system/styles/core.css';

import { maybeSignUri } from '../../handlers/imgix';

const getClosestSize = (size: number): TextProps['size'] => {
  const allowedSizes = [11, 12, 14, 16, 20, 23, 26, 32, 44];
  const closestSize = allowedSizes.reduce((prev, curr) => {
    return Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev;
  });
  return `${closestSize}pt` as TextProps['size'];
};

const ExternalImage = (
  props: JSX.IntrinsicAttributes &
    React.ClassAttributes<HTMLImageElement> &
    React.ImgHTMLAttributes<HTMLImageElement> & {
      mask?: string;
      onError?: () => void;
      borderRadius?: BoxStyles['borderRadius'];
    },
) => {
  const [fallback, setFallback] = React.useState(false);
  const width = Number(props.width) || undefined;
  const height = Number(props.height) || undefined;

  const signedUrl = React.useMemo(
    () =>
      maybeSignUri(props.src, {
        w: width,
        h: height,
      }),
    [height, props.src, width],
  );

  const handleError = React.useCallback(() => {
    setFallback(true);
    props?.onError?.();
  }, [props]);

  if (fallback) {
    return (
      <Box
        style={{ width, height }}
        alignItems="center"
        justifyContent="center"
        display="flex"
      >
        <Text size={getClosestSize(Number(width || height))} weight="bold">
          {'👽'}
        </Text>
      </Box>
    );
  }

  if (!signedUrl) return null;
  return (
    <Box
      style={{
        overflow: 'clip',
        maxHeight: props.height,
      }}
      borderRadius={props.borderRadius}
    >
      <img
        {...omit(props, 'borderRadius')}
        style={{
          ...(props.mask
            ? {
                maskImage: `url(${props.mask})`,
                WebkitMaskImage: `url(${props.mask})`,
              }
            : {}),
          objectFit: 'cover',
          ...props.style,
        }}
        src={signedUrl}
        onError={handleError}
      />
    </Box>
  );
};

export default ExternalImage;
