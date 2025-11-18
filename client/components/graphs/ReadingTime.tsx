'use client';

import GraphWrapper from "./GraphWrapper";
import { ResponsiveScatterPlot } from '@nivo/scatterplot'
import { GRAPH_THEME } from "@/lib/constants";
import CustomTooltip from "./CustomTooltip";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ReadingTime({ data }: { data: any }) {
    return (
        <GraphWrapper title="Reading time v/s number of pages">
            <ResponsiveScatterPlot
                data={data}
                margin={{ top: 30, right: 30, bottom: 45, left: 45 }}
                axisBottom={{ legend: 'Pages', legendOffset: -10 }}
                axisLeft={{ legend: 'Days', legendOffset: 10 }}
                yScale={{
                    type: "point",
                }}
                xScale={{
                    type: "linear",
                    min: 100
                }}
                colors={{ scheme: "set2" }}
                theme={GRAPH_THEME}
                tooltip={({
                    node
                }) => <CustomTooltip>{node.formattedY} days for {node.formattedX} pages</CustomTooltip>}
                layers={[
                    "grid",
                    "axes",
                    "nodes",
                ]}
            />
        </GraphWrapper>
    )
}