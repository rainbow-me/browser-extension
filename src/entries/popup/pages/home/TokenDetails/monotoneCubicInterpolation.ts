type Point = { x: number; y: number };

function slope(points: Point[], index: number) {
  const prev = points[index - 1] || points[index];
  const next = points[index + 1] || points[index];
  return (next.y - prev.y) / (next.x - prev.x);
}

export function monotoneCubicInterpolation(
  points: Point[],
  range = 2,
  mergeThreshold = 6,
): string {
  points.sort((a, b) => a.x - b.x);

  // Merge close data points
  const smoothedPoints: Point[] = [];
  let prev = points[0];
  smoothedPoints.push(prev);
  for (let i = 1; i < points.length; i++) {
    const curr = points[i];
    if (Math.abs(curr.x - prev.x) > mergeThreshold) {
      smoothedPoints.push(curr);
      prev = curr;
    } else {
      prev.y = curr.y;
    }
  }

  const path: string[] = [];

  // Push the starting point of the path
  const { x, y } = smoothedPoints[0];
  path.push(`M${x},${y}`);

  // Iterate through each data point and add cubic Bezier segments to the path
  for (let i = 0; i < smoothedPoints.length - 1; i++) {
    const curr = smoothedPoints[i];
    const next = smoothedPoints[i + 1];
    if (!next) break;
    const deltaX = (next.x - curr.x) / range;
    const x1 = curr.x + deltaX;
    const y1 = curr.y + deltaX * slope(points, i) * range;
    const x2 = next.x - deltaX;
    const y2 = next.y - deltaX * slope(points, i + 1) * range;
    const endX = next.x;
    const endY = next.y;
    path.push(`C${x1},${y1},${x2},${y2},${endX},${endY}`);
  }

  return path.join(' ');
}
