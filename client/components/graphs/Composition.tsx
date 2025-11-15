"use client";

import GraphWrapper from "./GraphWrapper";
import { GRAPH_THEME } from "@/lib/constants";
import { COLORS } from "@/lib/utils";
import { ResponsiveTreeMap } from "@nivo/treemap";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Composition({ data }: { data: any }) {
    return (
        <GraphWrapper title="Your Bookshelf">
            <ResponsiveTreeMap
                isInteractive={false}
                data={data}
                identity="library"
                nodeOpacity={0.5}
                value="scaledLoc"
                label={d => `${d.data.name} (${d.data.loc})`}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                labelTextColor={COLORS.background}
                enableParentLabel={false}
                theme={GRAPH_THEME}
                colors={{ scheme: "set2" }}
            />
        </GraphWrapper>
    )
}