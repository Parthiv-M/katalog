"use client";

import GraphWrapper from "./GraphWrapper";
import { GRAPH_THEME } from "@/lib/constants";
import { ResponsiveTreeMap } from "@nivo/treemap";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Composition({ data }: { data: any }) {
    return (
        <GraphWrapper>
            <ResponsiveTreeMap
                isInteractive={false}
                data={data}
                identity="library"
                nodeOpacity={0.5}
                value="loc"
                label={d => `${d.data.name} (${d.value})`}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                labelTextColor={'white'}
                enableParentLabel={false}
                theme={GRAPH_THEME}
                colors={{ scheme: "yellow_green_blue" }}
            />
        </GraphWrapper>
    )
}