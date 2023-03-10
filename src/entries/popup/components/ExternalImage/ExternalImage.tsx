/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';

import { maybeSignUri } from '../../handlers/imgix';

const ExternalImage = (
  props: JSX.IntrinsicAttributes &
    React.ClassAttributes<HTMLImageElement> &
    React.ImgHTMLAttributes<HTMLImageElement>,
) => {
  const width = Number(props.width) || undefined;
  const height = Number(props.height) || undefined;

  const signedUrl = maybeSignUri(props.src, {
    w: width,
    h: height,
  });

  return <img {...props} src={signedUrl} />;
};

export default ExternalImage;
