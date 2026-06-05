"use client";

import { ResponsiveTimeRange } from "@nivo/calendar";
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
    // Show only the last 6 calendar months, ending today, as a continuous strip
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const to = today.toISOString().slice(0, 10);
    const from = sixMonthsAgo.toISOString().slice(0, 10);

    return (
        <GraphWrapper title="Network activity" isAlwaysTitle={false}>
            <ResponsiveTimeRange
                data={data}
                from={from}
                to={to}
                emptyColor={COLORS.background}
                margin={{ top: 40, right: 20, bottom: 20, left: 30 }}
                dayBorderColor={COLORS.surfaceLight}
                weekdayLegendOffset={0}
                weekdayTicks={[]}
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
