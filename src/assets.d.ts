/* eslint-disable import/no-default-export */

declare module '*.woff2' {
  const path: string;
  export default path;
}

interface StaticImageData {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
}

declare module '*.png' {
  const content: StaticImageData;

  export default content?.src;
}
