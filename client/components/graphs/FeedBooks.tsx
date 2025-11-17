"use client";

import { ResponsiveBar } from "@nivo/bar"
import GraphWrapper from "./GraphWrapper"
import { ACTION_TO_READABLE_STRING_MAP, GRAPH_THEME } from "@/lib/constants"
import { COLORS } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FeedBooks({ data }: { data: any }) {
    const allKeys = Object.keys(data[0]);
    const barKeys = allKeys.filter(key => key !== 'action' && key !== 'other');
    return (
        <GraphWrapper title="Activity breakdown">
            <ResponsiveBar
                enableLabel={true}
                isInteractive={false}
                data={data}
                indexBy="action"
                keys={barKeys}
                labelSkipHeight={10}
                legends={[
                    {
                        dataFrom: 'keys',
                        anchor: 'top',
                        direction: 'column',
                        translateX: 50,
                        itemsSpacing: 5,
                        itemWidth: 50,
                        itemHeight: 16,
                    }
                ]}
                margin={{
                    bottom: 40,
                    left: 20,
                    right: 20,
                    top: 40
                }}
                axisLeft={null}
                axisBottom={{
                    format: (value) => ACTION_TO_READABLE_STRING_MAP.get(value)
                }}
                colors={{ scheme: 'yellow_green_blue' }}
                theme={GRAPH_THEME}
                labelTextColor={COLORS.background}
                padding={0.1}
                enableGridY={false}
                enableTotals={true}
                layers={[
                    "axes",
                    "bars",
                    "totals",
                    "legends"
                ]}
            />
        </GraphWrapper>
    )
}