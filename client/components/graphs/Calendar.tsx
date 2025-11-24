"use client";

import { ResponsiveCalendar } from "@nivo/calendar";
import GraphWrapper from "./GraphWrapper";
import { COLORS } from "@/lib/utils";
import { GRAPH_THEME } from "@/lib/constants";
import CustomTooltip from "./CustomTooltip";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CalendarTooltip = ({ node }: { node: any }) => {
    return (
        <CustomTooltip width="w-48">{node.value} updates on {node.day}</CustomTooltip>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FeedCalendar({ data }: { data: any }) {
    return (
        <GraphWrapper title="Network activity" isAlwaysTitle={false}>
            <ResponsiveCalendar
                data={data}
                from={data[data.length - 1].day}
                to={data[0].day}
                emptyColor={COLORS.background}
                margin={{ top: 20, right: 20, bottom: 20, left: 30 }}
                dayBorderColor={COLORS.surfaceLight}
                yearLegend={_ => ""}
                monthBorderColor={COLORS.surfaceLight}
                monthBorderWidth={1}
                monthSpacing={20}
                theme={GRAPH_THEME}
                legends={[
                    {
                        anchor: 'bottom-right',
                        direction: 'row',
                        translateY: 36,
                        itemCount: 4,
                        itemWidth: 42,
                        itemHeight: 36,
                        itemsSpacing: 14,
                        itemDirection: 'right-to-left'
                    }
                ]}
                tooltip={(node) => <CalendarTooltip node={node}/>}
            />
        </GraphWrapper>
    )
}