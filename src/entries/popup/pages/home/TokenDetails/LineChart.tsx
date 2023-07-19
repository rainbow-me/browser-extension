/* eslint-disable no-plusplus */
import { curveNatural, line, scaleLinear, select } from 'd3';
import { useEffect, useRef } from 'react';

const time = Date.now();
let day = 0;
const dates = Array.from({ length: 50 }).map(() =>
  new Date(time - ++day * 1000 * 60 * 60 * 24).getTime(),
);

const data = dates.map((date) => ({
  date,
  price: Math.random() * (122 - 98) + 98,
}));

export default function LineChart() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const y = scaleLinear()
      .range([height, 0])
      .domain([
        Math.min(...data.map((d) => d.price)) - 10,
        Math.max(...data.map((d) => d.price)) + 10,
      ]);

    const x = scaleLinear()
      .range([0, width])
      .domain([data.at(0)?.date || 0, data.at(-1)?.date || 0]);

    const rootArea = svg.append('g');

    // svg.on('mousemove', (event: MouseEvent) => {
    //   const mousePoint = {
    //     x: pointer(event)[0],
    //     y: pointer(event)[1],
    //   };
    //   const mouseData = {
    //     date: x.invert(mousePoint.x) || 0,
    //     price: y.invert(mousePoint.y) || 0,
    //   };

    //   const a = data.reduce((a, b) =>
    //     Math.abs(b.date - mouseData.date) < Math.abs(a.date - mouseData.date)
    //       ? b
    //       : a,
    //   );
    //   const index = data.findIndex((b) => b.date === a.date);

    //   // find more close point in the price line!
    //   // const indexBefore = 4;
    //   const closestDataPoint = data[index];
    //   const xPosition = x(closestDataPoint.date);
    //   circle.attr('cx', xPosition);
    //   circle.attr('cy', y(closestDataPoint.price));
    //   lineInCircle.attr('x1', xPosition);
    //   lineInCircle.attr('x2', xPosition);
    // });

    const pointLine = line<typeof data[number]>()
      .curve(curveNatural) // <curve effect
      .x((d) => x(d.date))
      .y((d) => y(d.price));

    const secondary = '#96979c';
    // const color = '#2775ca';

    rootArea
      .append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('d', pointLine)
      .attr('stroke-width', 3)
      .attr('stroke', secondary);

    // const lineInCircle = rootArea
    //   .append('line')
    //   .attr('y1', 0)
    //   .attr('y2', height)
    //   .attr('fill', color)
    //   .attr('stroke', color)
    //   .attr('stroke-width', '3');
    // const circle = rootArea.append('circle').attr('r', 10).attr('fill', color);

    return () => {
      svg.selectAll('*').remove();
    };
  }, []);
  return (
    <>
      <svg id="svg-chart" ref={svgRef} width={'100%'} height={'100%'} />
    </>
  );
}
