import * as React from 'react';
import { Img, useImage } from 'react-image';

import { Box, Symbol } from '~/design-system';
import { BoxStyles } from '~/design-system/styles/core.css';
import { SymbolName } from '~/design-system/styles/designTokens';

import { maybeSignUri } from '../../handlers/imgix';

const GOOGLE_USER_CONTENT_URL = 'https://lh3.googleusercontent.com/';

type ExternalImageProps = JSX.IntrinsicAttributes &
  React.ClassAttributes<HTMLImageElement> &
  React.ImgHTMLAttributes<HTMLImageElement> & {
    borderRadius?: BoxStyles['borderRadius'] | number;
    boxShadow?: React.CSSProperties['boxShadow'];
    customFallback?: React.ReactElement;
    customFallbackSymbol?: SymbolName;
    mask?: string;
    resizeMode?: 'contain' | 'cover';
    placeholderSrc?: string;
    avoidImgix?: boolean;
  };

const ExternalImage = (props: ExternalImageProps) => {
  const signedUrl = React.useMemo(() => {
    if (props.avoidImgix && props.src?.startsWith(GOOGLE_USER_CONTENT_URL)) {
      return props.src;
    }
    return maybeSignUri(props.src, {
      h: Number(props.height),
      w: Number(props.width),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.src]);
  const signedPlaceholderUrl = React.useMemo(() => {
    if (
      props.avoidImgix &&
      props.placeholderSrc?.startsWith(GOOGLE_USER_CONTENT_URL)
    ) {
      return props.placeholderSrc;
    }
    return maybeSignUri(props.placeholderSrc, {
      h: Number(props.height),
      w: Number(props.width),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.placeholderSrc]);

  const { src, isLoading, error } = useImage({
    srcList: signedUrl || '',
    useSuspense: false,
  });

  const {
    src: placeholderSrc,
    isLoading: placeholderIsLoading,
    error: placeholderError,
  } = useImage({
    srcList: signedPlaceholderUrl || '',
    useSuspense: false,
    imgPromise: async (img) => {
      if (img) {
        return img;
      }
      return undefined;
    },
  });

  const placeholderLoaded =
    !!signedPlaceholderUrl && !placeholderIsLoading && !placeholderError;

  const renderContent = () => {
    if (isLoading && !placeholderLoaded) {
      // nothing has loaded yet
      return <Box background="fillQuaternary" height="full" width="full" />;
    } else if (error && !placeholderLoaded) {
      // error fetching src and no available placeholder
      return props.customFallback ? (
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
      );
    } else {
      const availableSrc =
        isLoading && placeholderLoaded ? placeholderSrc : src;
      return (
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
          src={availableSrc || ''}
          width={props.width}
        />
      );
    }
  };

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
        overflow: error ? 'visible' : 'clip',
        height: Number(props.height) || props.height,
        width: Number(props.width) || props.width,
      }}
    >
      {renderContent()}
    </Box>
  );
};

export default ExternalImage;
