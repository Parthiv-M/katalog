'use client';

import { ResponsiveBar } from '@nivo/bar'
import GraphWrapper from './GraphWrapper';
import { GRAPH_THEME } from '@/lib/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RatingDistribution({ data }: { data: any }) {
  return (
    <GraphWrapper title="How you rate (1-5 stars)">
      <ResponsiveBar
        enableLabel={false}
        isInteractive={false}
        data={data}
        indexBy="rating"
        keys={[
          'count'
        ]}
        margin={{
          bottom: 30,
          left: 20,
          right: 20,
          top: 40
        }}
        padding={0.1}
        enableTotals={true}
        enableGridY={false}
        axisLeft={null}
        axisBottom={{
          tickSize: 0,
          tickPadding: 5,
          format: (v) => '★'.repeat(Number(v)),
        }}
        colors={{ scheme: "set2" }}
        theme={{
          ...GRAPH_THEME,
          axis: {
            ...GRAPH_THEME.axis,
            ticks: {
              ...GRAPH_THEME.axis.ticks,
              text: { ...GRAPH_THEME.axis.ticks.text, fontSize: 16 },
            },
          },
        }}
        layers={[
          "axes",
          "bars",
          "totals",
        ]}
      />
    </GraphWrapper>
  )
}
