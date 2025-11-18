'use client'
import { GRAPH_THEME } from '@/lib/constants';
import { COLORS } from '@/lib/utils'
import { ResponsiveHeatMap } from '@nivo/heatmap'
import GraphWrapper from './GraphWrapper';
import CustomTooltip from './CustomTooltip';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HeatMapTooltip = ({cell}: {cell: any}) => {
  return (
    <CustomTooltip>
      <p>You rated it {cell.serieId}</p>
      <p>Others rated it {cell.data.x}</p>
    </CustomTooltip>
  )
}

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
        tooltip={
          ({ cell }) => <HeatMapTooltip cell={cell}/>
        }
        theme={GRAPH_THEME}
      />
    </GraphWrapper>
  )
}