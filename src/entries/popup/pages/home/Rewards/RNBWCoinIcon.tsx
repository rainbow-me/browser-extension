import rnbwImage from 'static/assets/rewards/rnbw.png';

interface RNBWCoinIconProps {
  size?: number;
  className?: string;
  alt?: string;
}

export const RNBWCoinIcon = ({
  size = 32,
  className,
  alt = 'RNBW',
}: RNBWCoinIconProps) => (
  <img
    src={rnbwImage}
    width={size}
    height={size}
    alt={alt}
    className={className}
    style={{
      borderRadius: '50%',
      objectFit: 'cover',
    }}
  />
);
