'use client';

import GraphWrapper from "./GraphWrapper";
import { ResponsiveScatterPlot } from '@nivo/scatterplot'
import { GRAPH_THEME } from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ReadingTime({ data }: { data: any }) {
    return (
        <GraphWrapper>
            <ResponsiveScatterPlot /* or ScatterPlot for fixed dimensions */
                data={data}
                margin={{ top: 30, right: 35, bottom: 35, left: 35 }}
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
                layers={[
                    "grid",
                    "axes",
                    "nodes",
                ]}
            />
        </GraphWrapper>
    )
}