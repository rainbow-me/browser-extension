// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { url as cloudinaryURL } from 'cloudinary/lib/cloudinary';

import { memoFn } from '../utils/memoFn';

type CloudinaryConfig = {
  width: number;
  height: number;
  format: string;
};

export function pickScale(
  scales: Array<number>,
  deviceScale: number = window.devicePixelRatio,
): number {
  for (let i = 0; i < scales.length; i++) {
    if (scales[i] >= deviceScale) {
      return scales[i];
    }
  }

  // If nothing matches, device scale is larger than any available
  // scales, so we return the biggest one. Unless the array is empty,
  // in which case we default to 1
  return scales[scales.length - 1] || 1;
}

// NOTE: currently, we assume that width and height are always equal and provided.
// We use this storage only for assets.
export const signUrl = memoFn(
  (url: string, config: Partial<CloudinaryConfig>) => {
    const { format, ...widthAndHeight } = config;
    let internalAddress = url.split('/upload/')[1];
    if (format) {
      internalAddress = internalAddress.split('.')[0] + '.' + format;
    }

    const { width } = widthAndHeight;

    const cloudinaryImg = cloudinaryURL(internalAddress, {
      height: width,
      sign_url: true,
      width: width,
    });

    if (cloudinaryImg.startsWith('http:')) {
      return 'https' + cloudinaryImg.substring(4);
    }
    return cloudinaryImg;
  },
  (url, options) =>
    `${url}-${options.width}-${options.height}-${options.format}`,
);

export function isCloudinaryStorageLink(url: string): boolean {
  return url.startsWith('https://rainbowme-res.cloudinary.com/');
}
