'use client'
import { GRAPH_THEME } from '@/lib/constants';
import { COLORS } from '@/lib/utils'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import GraphWrapper from './GraphWrapper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MyCustomHeatmapTooltip = ({ cell }: { cell: any }) => {
  return (
    <div
      style={{
        width: '220px',
        background: '#00000060',
        backdropFilter: 'blur(5px)',
        padding: '9px 12px',
        border: '1px solid #000',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      }}
    >
      <strong>Your rating:</strong> {cell.serieId}
      <br />
      <strong>Community rating:</strong> {cell.data.x}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getLabelColor = (datum: any) => {
  if (datum.value > 12) {
    return COLORS.text;
  } else {
    return COLORS.background;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RatingCritic({ data }: { data: any }) {
  return (
    <GraphWrapper title="Your rating v/s community rating">
      <ResponsiveHeatMap /* or HeatMap for fixed dimensions */
        data={data}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        colors={{
          type: 'diverging',
          scheme: 'yellow_green_blue',
          divergeAt: 0.5,
        }}
        opacity={0.8}
        labelTextColor={getLabelColor}
        label={d => `${d.value}`}
        layers={[
          "cells"
        ]}
        tooltip={MyCustomHeatmapTooltip}
        theme={GRAPH_THEME}
      />
    </GraphWrapper>
  )
}