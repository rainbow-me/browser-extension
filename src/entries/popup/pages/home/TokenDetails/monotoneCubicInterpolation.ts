interface DataPoint {
  x: number;
  y: number;
}

export function monotoneCubicInterpolation(
  dataPoints: DataPoint[],
  range: number,
  mergeThreshold = 6,
): string {
  // Ensure the dataPoints array is sorted by x values
  dataPoints.sort((a, b) => a.x - b.x);

  // Helper function to check if two numbers are almost equal
  function isClose(a: number, b: number): boolean {
    return Math.abs(a - b) <= mergeThreshold;
  }

  // Merge close data points by updating their y-values
  const mergedDataPoints: DataPoint[] = [];
  let prev: DataPoint = dataPoints[0];
  mergedDataPoints.push(prev);
  for (let i = 1; i < dataPoints.length; i++) {
    const curr: DataPoint = dataPoints[i];
    if (!isClose(curr.x, prev.x)) {
      mergedDataPoints.push(curr);
      prev = curr;
    } else {
      prev.y = curr.y;
    }
  }

  const len: number = mergedDataPoints.length;
  const path: string[] = [];

  // Helper function to compute the slope at a given index
  function slope(index: number): number {
    const prev: DataPoint =
      mergedDataPoints[index - 1] || mergedDataPoints[index];
    const next: DataPoint =
      mergedDataPoints[index + 1] || mergedDataPoints[index];
    return (next.y - prev.y) / (next.x - prev.x);
  }

  // Push the starting point of the path
  const { x, y } = mergedDataPoints[0];
  path.push(`M${x},${y}`);

  // Iterate through each data point and add cubic Bezier segments to the path
  for (let i = 0; i < len - 1; i++) {
    const curr: DataPoint = mergedDataPoints[i];
    const next: DataPoint = mergedDataPoints[i + 1];
    const m0: number = slope(i);
    const m1: number = slope(i + 1);
    const deltaX: number = (next.x - curr.x) / range;
    const controlPoint1X: number = curr.x + deltaX;
    const controlPoint1Y: number = curr.y + deltaX * m0 * range;
    const controlPoint2X: number = next.x - deltaX;
    const controlPoint2Y: number = next.y - deltaX * m1 * range;
    const endPointX: number = next.x;
    const endPointY: number = next.y;
    path.push(
      `C${controlPoint1X},${controlPoint1Y},${controlPoint2X},${controlPoint2Y},${endPointX},${endPointY}`,
    );
  }

  return path.join(' ');
}
