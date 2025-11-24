'use client';

import { ResponsiveBar } from "@nivo/bar";
import GraphWrapper from "./GraphWrapper";
import { GRAPH_THEME } from "@/lib/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function TopAuthors({ data }: { data: any }) {
    return (
        <GraphWrapper title="Your top authors" isAlwaysTitle={false}>
            <ResponsiveBar
                layout="horizontal"
                isInteractive={false}
                label={d => `${d.indexValue}`}
                labelPosition="start"
                labelOffset={20}
                data={data}
                indexBy="author"
                keys={[
                    'count'
                ]}
                margin={{
                    bottom: 20,
                    left: 20,
                    right: 50,
                    top: 20
                }}
                padding={0.1}
                enableTotals={true}
                colors={{ scheme: "set2" }}
                theme={GRAPH_THEME}
                layers={[
                    "bars",
                    "totals",
                ]}
            />
        </GraphWrapper>
    )
}