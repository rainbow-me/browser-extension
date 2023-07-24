function cubicHermiteInterpolation(t: number) {
  const t2 = t * t;
  const t3 = t * t2;
  return [
    2 * t3 - 3 * t2 + 1,
    t3 - 2 * t2 + t,
    -2 * t3 + 3 * t2,
    t3 - t2,
  ] as const;
}

function calculateSlopes(x: number[], y: number[]) {
  const n = x.length;
  const slopes: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    if (x[i + 1] === x[i]) slopes[i] = 0;
    else slopes[i] = (y[i + 1] - y[i]) / (x[i + 1] - x[i]);

    if (i > 0 && slopes[i - 1] * slopes[i] <= 0) slopes[i - 1] = 0;
  }

  slopes[n - 1] = slopes[n - 2];

  return slopes;
}

export function monotoneCubicInterpolation(
  data: { x: number; y: number }[],
  range: number,
): string {
  if (!data || data.length === 0) return '';

  const x = data.map((point) => point.x);
  const y = data.map((point) => point.y);

  const slopes = calculateSlopes(x, y);

  const pathSegments: string[] = [];

  for (let j = 0; j < range; j++) {
    const interpolatedX = x[0] + (x[x.length - 1] - x[0]) * (j / range);

    const currentIndex = x.findIndex(
      (_x, index) => _x <= interpolatedX && x[index + 1] > interpolatedX,
    );
    const nextIndex = currentIndex + 1;
    const segmentWidth = x[nextIndex] - x[currentIndex];
    const relativePosition = (interpolatedX - x[currentIndex]) / segmentWidth;

    const [h00, h10, h01, h11] = Number.isFinite(relativePosition)
      ? cubicHermiteInterpolation(relativePosition)
      : [1, 0, 0, 0];

    const interpolatedYValue =
      h00 * y[currentIndex] +
      h10 * segmentWidth * slopes[currentIndex] +
      h01 * y[nextIndex] +
      h11 * segmentWidth * slopes[nextIndex];

    pathSegments.push(`${interpolatedX},${interpolatedYValue}`);
  }

  pathSegments.push(`${x[x.length - 1]},${y[y.length - 1]}`);

  return `M${pathSegments.join(' L')}`;
}
