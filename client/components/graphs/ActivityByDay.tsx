'use client';

import { ResponsiveBar } from '@nivo/bar'
import GraphWrapper from './GraphWrapper';
import { GRAPH_THEME } from '@/lib/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ActivityByDay({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <GraphWrapper title="Activity by weekday"><div>No data available</div></GraphWrapper>;
  }

  return (
    <GraphWrapper title="Activity by weekday">
      <ResponsiveBar
        enableLabel={false}
        isInteractive={false}
        data={data}
        indexBy="day"
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
          tickPadding: 8,
          format: (value) => String(value).slice(0, 3),
        }}
        colors={{ scheme: "set2" }}
        theme={GRAPH_THEME}
        layers={[
          "axes",
          "bars",
          "totals",
        ]}
      />
    </GraphWrapper>
  )
}
