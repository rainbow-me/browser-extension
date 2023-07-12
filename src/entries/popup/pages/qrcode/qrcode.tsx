import QRCodeUtil from 'qrcode';
import React, { useMemo } from 'react';

import { Box } from '~/design-system';

import { AvatarSection } from '../home/Header';

export type QRCodeErrorCorrectionLevel =
  | 'low'
  | 'medium'
  | 'quartile'
  | 'high'
  | 'L'
  | 'M'
  | 'Q'
  | 'H';

const generateMatrix = (
  value: string,
  errorCorrectionLevel: QRCodeErrorCorrectionLevel,
) => {
  const arr = Array.prototype.slice.call(
    QRCodeUtil.create(value, { errorCorrectionLevel }).modules.data,
    0,
  );
  const sqrt = Math.sqrt(arr.length);
  return arr.reduce(
    (rows, key, index) =>
      (index % sqrt === 0
        ? rows.push([key])
        : rows[rows.length - 1].push(key)) && rows,
    [],
  );
};

export const QRCode = ({
  ecl = 'Q',
  logoMargin = -32,
  logoSize = 120,
  size = 320,
  value = 'QR Code',
}: {
  ecl?: QRCodeErrorCorrectionLevel;
  logoMargin?: number;
  logoSize?: number;
  size?: number;
  value?: string;
}) => {
  const dots = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dots: any[] = [];
    const matrix = generateMatrix(value, ecl);
    const cellSize = size / matrix.length;
    const qrList = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ];

    qrList.forEach(({ x, y }) => {
      const x1 = (matrix.length - 7) * cellSize * x;
      const y1 = (matrix.length - 7) * cellSize * y;
      for (let i = 0; i < 3; i++) {
        dots.push(
          <rect
            fill={i % 2 !== 0 ? 'white' : 'black'}
            height={cellSize * (7 - i * 2)}
            key={`${i}-${x}-${y}`}
            rx={(i - 3) * -5 + (i === 0 ? 2 : 0)} // calculated border radius for corner squares
            ry={(i - 3) * -5 + (i === 0 ? 2 : 0)} // calculated border radius for corner squares
            width={cellSize * (7 - i * 2)}
            x={x1 + cellSize * i}
            y={y1 + cellSize * i}
          />,
        );
      }
    });

    const clearArenaSize = Math.floor((logoSize + 5) / cellSize);
    const matrixMiddleStart = matrix.length / 2 - clearArenaSize / 2;
    const matrixMiddleEnd = matrix.length / 2 + clearArenaSize / 2 - 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matrix.forEach((row: any[], i: number) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      row.forEach((column: any, j: number) => {
        if (matrix[i][j]) {
          if (
            !(
              (i < 7 && j < 7) ||
              (i > matrix.length - 8 && j < 7) ||
              (i < 7 && j > matrix.length - 8)
            )
          ) {
            if (
              !(
                i > matrixMiddleStart &&
                i < matrixMiddleEnd &&
                j > matrixMiddleStart &&
                j < matrixMiddleEnd &&
                i < j + clearArenaSize / 2 &&
                j < i + clearArenaSize / 2 + 1
              )
            ) {
              dots.push(
                <circle
                  cx={i * cellSize + cellSize / 2}
                  cy={j * cellSize + cellSize / 2}
                  fill="black"
                  key={`circle-${i}-${j}`}
                  r={cellSize / 3} // calculate size of single dots
                />,
              );
            }
          }
        }
      });
    });

    return dots;
  }, [ecl, logoSize, size, value]);

  const logoPosition = size / 2 - logoSize / 2 - logoMargin;
  const logoWrapperSize = logoSize + logoMargin * 2;

  return (
    <Box
      style={{
        userSelect: 'none',
        width: '320px',
        height: '320px',
        marginBottom: '32px',
      }}
      background={'white'}
      borderRadius="26px"
      padding="20px"
    >
      <Box
        style={{
          height: 0,
          left: logoPosition,
          position: 'relative',
          top: logoPosition,
        }}
      >
        <AvatarSection />
      </Box>
      <svg height={size} width={size}>
        <defs>
          <clipPath id="clip-wrapper">
            <rect height={logoWrapperSize} width={logoWrapperSize} />
          </clipPath>
          <clipPath id="clip-logo">
            <rect height={logoSize} width={logoSize} />
          </clipPath>
        </defs>
        <rect fill="transparent" height={size} width={size} />
        {dots}
      </svg>
    </Box>
  );
};
