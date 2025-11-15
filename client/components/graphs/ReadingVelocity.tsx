'use client';

import { ResponsiveBar } from '@nivo/bar'
import { COLORS } from '@/lib/utils';
import { Key } from 'react';
import GraphWrapper from './GraphWrapper';
import { GRAPH_THEME } from '@/lib/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomRotatedLabels = ({ bars }: { bars: any }) => {
  return (
    bars.map((bar: {
      x: number; width: number; y: number; height: number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      key: Key | null | undefined; data: any;
    }) => {
      // Calculate the position for the label inside the bar
      const x = bar.x + bar.width / 2;
      const y = bar.y + bar.height - 15;
      const rotationAngle = -90; // Rotate 90 degrees counter-clockwise

      return (
        <text
          key={bar.key}
          x={x}
          y={y}
          transform={`rotate(${rotationAngle} ${x} ${y})`}
          textAnchor="start"
          dominantBaseline="middle"
          style={{
            fontSize: '12px',
            fill: COLORS.text
          }}
        >
          {bar.data.indexValue}
        </text>
      );
    })
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ReadingVelocity({ data }: { data: any }) {
  return (
    <GraphWrapper title="Number of books per month">
      <ResponsiveBar
        enableLabel={false}
        isInteractive={false}
        data={data}
        indexBy="month"
        keys={[
          'count'
        ]}
        margin={{
          bottom: 20,
          left: 20,
          right: 20,
          top: 40
        }}
        padding={0.1}
        enableTotals={true}
        enableGridY={false}
        colors={{ scheme: "set2" }}
        theme={GRAPH_THEME}
        layers={[
          "bars",
          "totals",
          CustomRotatedLabels
        ]}
      />
    </GraphWrapper>
  )
}