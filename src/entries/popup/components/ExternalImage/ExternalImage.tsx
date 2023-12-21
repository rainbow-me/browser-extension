import * as React from 'react';
import { Img, useImage } from 'react-image';

import { Box, Symbol } from '~/design-system';
import { BoxStyles } from '~/design-system/styles/core.css';
import { SymbolName } from '~/design-system/styles/designTokens';

import { maybeSignUri } from '../../handlers/imgix';

type ExternalImageProps = JSX.IntrinsicAttributes &
  React.ClassAttributes<HTMLImageElement> &
  React.ImgHTMLAttributes<HTMLImageElement> & {
    borderRadius?: BoxStyles['borderRadius'] | number;
    boxShadow?: React.CSSProperties['boxShadow'];
    customFallback?: React.ReactElement;
    customFallbackSymbol?: SymbolName;
    mask?: string;
    resizeMode?: 'contain' | 'cover';
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
      borderRadius={
        typeof props.borderRadius !== 'number' ? props.borderRadius : undefined
      }
      display="flex"
      justifyContent="center"
      style={{
        ...(typeof props.borderRadius === 'number'
          ? { borderRadius: props.borderRadius }
          : {}),
        boxShadow: isLoading || error ? undefined : props.boxShadow,
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
            borderRadius={
              typeof props.borderRadius !== 'number'
                ? props.borderRadius
                : undefined
            }
            borderWidth="1px"
            display="flex"
            height="full"
            justifyContent="center"
            style={
              typeof props.borderRadius === 'number'
                ? { borderRadius: props.borderRadius }
                : {}
            }
            width="full"
          >
            <Box opacity="0.5">
              <Symbol
                color="labelQuaternary"
                size={Math.min(Number(props.width) / 2.2, 24)}
                symbol={props.customFallbackSymbol || 'photo.fill'}
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
            objectFit: props.resizeMode || 'cover',
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
