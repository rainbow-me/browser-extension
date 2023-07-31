type Point = { x: number; y: number };

function slope(points: Point[], index: number) {
  const prev = points[index - 1] || points[index];
  const next = points[index + 1] || {
    x: points[index].x + 10,
    y: points[index].y,
  };
  return (next.y - prev.y) / (next.x - prev.x);
}

const normalizePointsLength = (points: Point[], desiredLength: number) => {
  const interpolatedData = [];
  const step = (points.length - 1) / (desiredLength - 1);

  for (let i = 0; i < desiredLength; i++) {
    const index = i * step;
    const lowIndex = Math.floor(index);
    const highIndex = Math.ceil(index);
    const weight = index - lowIndex;

    if (lowIndex === highIndex) {
      interpolatedData.push(points[lowIndex]);
    } else {
      const lowPoint = points[lowIndex];
      const hightPoint = points[highIndex];
      const interpolatedX = lowPoint.x * (1 - weight) + hightPoint.x * weight;
      const interpolatedY = lowPoint.y * (1 - weight) + hightPoint.y * weight;
      interpolatedData.push({ x: interpolatedX, y: interpolatedY });
    }
  }

  return interpolatedData;
};

export function monotoneCubicInterpolation(points: Point[]): string {
  points.sort((a, b) => a.x - b.x);

  const normalizedPoints = normalizePointsLength(points, 60);

  const path: string[] = [];

  const { x, y } = normalizedPoints[0];
  path.push(`M${x},${y}`);

  const range = 2;
  const length = normalizedPoints.length;
  for (let i = 0; i < length - 1; i++) {
    const curr = normalizedPoints[i];
    const next = normalizedPoints[i + 1] || curr;

    const deltaX = (next.x - curr.x) / range;
    const x1 = curr.x + deltaX;
    const y1 = curr.y + deltaX * slope(normalizedPoints, i) * range;
    const x2 = next.x - deltaX;
    const y2 = next.y - deltaX * slope(normalizedPoints, i + 1) * range;
    const endX = next.x;
    const endY = next.y;
    path.push(`C${x1},${y1},${x2},${y2},${endX},${endY}`);
  }

  // Extend the last point's line to one more point on the x-axis
  // so the it won't look like it ended before overflowing the screen
  const lastPoint = normalizedPoints[length - 1];
  const slopeAtLastPoint = slope(normalizedPoints, length - 1);
  const extendedX = lastPoint.x + range;
  const extendedY = lastPoint.y + range * slopeAtLastPoint;
  path.push(`L${extendedX},${extendedY}`);

  return path.join(' ');
}
