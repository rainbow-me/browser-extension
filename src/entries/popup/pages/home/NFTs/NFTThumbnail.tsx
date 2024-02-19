import { memo } from 'react';

import { BoxProps } from '~/design-system/components/Box/Box';
import { Lens } from '~/design-system/components/Lens/Lens';
import ExternalImage from '~/entries/popup/components/ExternalImage/ExternalImage';

export const NFTThumbnail = memo(function NftThumbnail({
  borderRadius,
  size,
  imageSrc,
  onClick,
  index,
  placeholderSrc,
}: {
  borderRadius: BoxProps['borderRadius'];
  size: number;
  imageSrc?: string;
  onClick?: () => void;
  index: number;
  placeholderSrc?: string;
}) {
  return (
    <Lens
      style={{ height: size, width: size }}
      borderRadius={borderRadius}
      background="fillQuaternary"
      onClick={onClick}
      testId={`nft-thumbnail-${imageSrc}-${index}`}
    >
      <ExternalImage
        borderRadius={borderRadius}
        src={imageSrc}
        placeholderSrc={placeholderSrc}
        height={size}
        width={size}
      />
    </Lens>
  );
});
