/* eslint-disable @typescript-eslint/no-explicit-any */
import ImgixClient from 'imgix-core-js';
import LRUCache from 'mnemonist/lru-cache';

import { RainbowError, logger } from '~/logger';

const domain = process.env.IMGIX_DOMAIN;
const secureURLToken = process.env.IMGIX_TOKEN;

export const getPixelSizeForLayoutSize = (size: number) => {
  const pixelRatio = window.devicePixelRatio || 1;
  return size * pixelRatio;
};

const shouldCreateImgixClient = (): ImgixClient | null => {
  if (
    typeof domain === 'string' &&
    !!domain.length &&
    typeof secureURLToken === 'string' &&
    !!secureURLToken.length
  ) {
    return new ImgixClient({
      domain,
      includeLibraryParam: false,
      secureURLToken,
    });
  }
  logger.error(
    new RainbowError(
      '[Imgix] Image signing disabled. Please ensure you have specified both IMGIX_DOMAIN and IMGIX_TOKEN inside your .env.',
    ),
  );
  return null;
};

const staticImgixClient = shouldCreateImgixClient();

// Below, we use a static buffer to prevent multiple successive signing attempts
// for components which may have been unmounted/remounted. This is done to
// increase performance.

// TODO: We need to find a suitable upper limit.
//       This might be conditional based upon either the runtime
//       hardware or the number of unique tokens a user may have.
const capacity = 1024;
export const staticSignatureLRU: LRUCache<string, string> = new LRUCache(
  capacity,
);

interface ImgOptions {
  w?: number;
  h?: number;
  fm?: string;
}

const shouldSignUri = (
  externalImageUri: string,
  options?: ImgOptions,
): string | undefined => {
  try {
    const updatedOptions: ImgOptions = {};
    if (options?.w) {
      updatedOptions.w = getPixelSizeForLayoutSize(options.w);
    }
    if (options?.h) {
      updatedOptions.h = getPixelSizeForLayoutSize(options.h);
    }

    if (options?.fm) {
      updatedOptions.fm = options.fm;
    }

    // We'll only attempt to sign if there's an available client. A client
    // will not exist if the .env hasn't been configured correctly.
    if (staticImgixClient) {
      // Attempt to sign the image.

      const signedExternalImageUri = staticImgixClient.buildURL(
        externalImageUri,
        updatedOptions,
      );

      // Check that the URL was signed as expected.
      if (typeof signedExternalImageUri === 'string') {
        // Buffer the signature into the LRU for future use.
        const signature = `${externalImageUri}-${options?.w}`;
        !staticSignatureLRU.has(signature) &&
          staticSignatureLRU.set(signature, signedExternalImageUri);
        // Return the signed image.
        return signedExternalImageUri;
      }
      throw new Error(
        `Expected string signedExternalImageUri, encountered ${typeof signedExternalImageUri} (for input "${externalImageUri}").`,
      );
    }
  } catch (e: any) {
    logger.error(new RainbowError(`[Imgix]: Failed to sign`), {
      externalImageUri,
      message: e.message,
    });
    // If something goes wrong, it is not safe to assume the image is valid.
    return undefined;
  }
  return externalImageUri;
};

// Determines whether an externalImageUri should be signed.
// It should be a non-empty string which points to a remote address.
// Other strings (such as those which point to local assets) should
// not be signed.
const isPossibleToSignUri = (externalImageUri: string | undefined): boolean => {
  if (typeof externalImageUri === 'string' && !!externalImageUri.length) {
    try {
      const { host } = new URL(externalImageUri);
      return typeof host === 'string' && !!host.length;
    } catch (e: any) {
      logger.error(new RainbowError(`[Imgix]: Failed to parse`), {
        externalImageUri,
        message: e.message,
      });
      return false;
    }
  }
  return false;
};

export const maybeSignUri = (
  externalImageUri: string | undefined,
  options?: ImgOptions,
  skipCaching = false,
): string | undefined => {
  // Just in case we try to load a local image
  if (!externalImageUri?.startsWith('https://')) {
    return externalImageUri;
  }

  // If the image has already been signed, return this quickly.
  const signature = `${externalImageUri}-${options?.w}`;
  if (
    typeof externalImageUri === 'string' &&
    staticSignatureLRU.has(signature as string) &&
    !skipCaching
  ) {
    return staticSignatureLRU.get(signature);
  }
  if (
    typeof externalImageUri === 'string' &&
    !!externalImageUri.length &&
    isPossibleToSignUri(externalImageUri)
  ) {
    return shouldSignUri(externalImageUri, options);
  }
  return externalImageUri;
};

export const imageToPng = (url: string, w: number) => {
  return maybeSignUri(url, { fm: 'png', w });
};
