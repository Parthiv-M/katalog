"use client";

import GraphWrapper from "./GraphWrapper";
import { GRAPH_THEME } from "@/lib/constants";
import { COLORS } from "@/lib/utils";
import { ResponsivePie } from "@nivo/pie";

// Center layer: total book count in the donut hole
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CenteredTotal = ({ dataWithArc, centerX, centerY }: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const total = dataWithArc.reduce((sum: number, d: any) => sum + d.data.count, 0);
    return (
        <>
            <text
                x={centerX}
                y={centerY - 8}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontSize: "28px", fill: COLORS.text }}
            >
                {total}
            </text>
            <text
                x={centerX}
                y={centerY + 16}
                textAnchor="middle"
                dominantBaseline="central"
                style={{ fontSize: "12px", fill: COLORS.textMuted }}
            >
                books
            </text>
        </>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Composition({ data }: { data: any }) {
    // Use sqrt of the real count for the slice angle so dominant shelves
    // (e.g. "Read") don't squish small ones (e.g. a single "Currently Reading")
    // into an invisible sliver. The arc label still shows the true count.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pieData = (data?.children ?? []).map((c: any) => ({
        id: c.name,
        label: c.name,
        value: Math.sqrt(c.loc),
        count: c.loc,
    }));

    return (
        <GraphWrapper title="Your Bookshelf" isAlwaysTitle>
            <ResponsivePie
                isInteractive={false}
                data={pieData}
                innerRadius={0.6}
                padAngle={1}
                cornerRadius={3}
                margin={{ top: 40, right: 20, bottom: 20, left: 20 }}
                colors={{ scheme: "set2" }}
                theme={GRAPH_THEME}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                arcLabel={(d) => `${(d.data as any).count}`}
                arcLabelsTextColor={COLORS.background}
                enableArcLinkLabels={true}
                arcLinkLabelsColor={{ from: "color" }}
                arcLinkLabelsTextColor={COLORS.textMuted}
                arcLinkLabelsThickness={1}
                layers={["arcs", "arcLabels", "arcLinkLabels", CenteredTotal]}
            />
        </GraphWrapper>
    )
}
