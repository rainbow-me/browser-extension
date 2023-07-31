type Point = { x: number; y: number };

function slope(points: Point[], index: number) {
  const prev = points[index - 1] || points[index];
  const next = points[index + 1] || points[index];
  return (next.y - prev.y) / (next.x - prev.x);
}

export function monotoneCubicInterpolation(points: Point[], range = 2): string {
  points.sort((a, b) => a.x - b.x);

  const path: string[] = [];

  const smoothedPoints: Point[] = [];
  let prev = points[0];
  smoothedPoints.push(prev);
  for (let i = 1; i < points.length; i++) {
    const curr = points[i];
    if (Math.abs(curr.x - prev.x) > 6 || i === points.length - 1) {
      smoothedPoints.push(curr);
      prev = curr;
    } else {
      prev.y = curr.y;
    }
  }

  const { x, y } = smoothedPoints[0];
  path.push(`M${x},${y}`);

  for (let i = 0; i < smoothedPoints.length - 1; i++) {
    const curr = smoothedPoints[i];
    const next = smoothedPoints[i + 1] || curr;

    const deltaX = (next.x - curr.x) / range;
    const x1 = curr.x + deltaX;
    const y1 = curr.y + deltaX * slope(smoothedPoints, i) * range;
    const x2 = next.x - deltaX;
    const y2 = next.y - deltaX * slope(smoothedPoints, i + 1) * range;
    const endX = next.x;
    const endY = next.y;
    path.push(`C${x1},${y1},${x2},${y2},${endX},${endY}`);
  }

  return path.join(' ');
}
