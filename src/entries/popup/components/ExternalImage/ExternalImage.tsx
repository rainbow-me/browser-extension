import * as React from 'react';
import { Img, useImage } from 'react-image';

import { Box, Symbol } from '~/design-system';
import { BoxStyles } from '~/design-system/styles/core.css';

import { maybeSignUri } from '../../handlers/imgix';

type ExternalImageProps = JSX.IntrinsicAttributes &
  React.ClassAttributes<HTMLImageElement> &
  React.ImgHTMLAttributes<HTMLImageElement> & {
    borderRadius?: BoxStyles['borderRadius'];
    customFallback?: React.ReactElement;
    mask?: string;
  };

const ExternalImage = (props: ExternalImageProps) => {
  const signedUrl = React.useMemo(() => {
    return maybeSignUri(props.src, {
      h: Number(props.height),
      w: Number(props.width),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.src]);

  const { src, isLoading, error } = useImage({
    srcList: signedUrl || '',
    useSuspense: false,
  });

  return (
    <Box
      alignItems="center"
      borderRadius={props.borderRadius}
      display="flex"
      justifyContent="center"
      style={{
        height: props.height,
        overflow: error ? 'visible' : 'clip',
        width: props.width,
      }}
    >
      {/* eslint-disable-next-line no-nested-ternary */}
      {isLoading ? (
        <Box background="fillQuaternary" height="full" width="full" />
      ) : // eslint-disable-next-line no-nested-ternary
      error ? (
        props.customFallback ? (
          <Box
            alignItems="center"
            display="flex"
            height="full"
            justifyContent="center"
            width="full"
          >
            {props.customFallback}
          </Box>
        ) : (
          <Box
            alignItems="center"
            background="fillQuaternary"
            borderColor="separatorTertiary"
            borderRadius={props.borderRadius}
            borderWidth="1px"
            display="flex"
            height="full"
            justifyContent="center"
            width="full"
          >
            <Box opacity="0.5">
              <Symbol
                color="labelQuaternary"
                size={Math.min(Number(props.width) / 2.2, 24)}
                symbol="photo.fill"
                weight="bold"
              />
            </Box>
          </Box>
        )
      ) : (
        <Img
          height={props.height}
          loading="lazy"
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
          src={src || ''}
          width={props.width}
        />
      )}
    </Box>
  );
};

export default ExternalImage;
