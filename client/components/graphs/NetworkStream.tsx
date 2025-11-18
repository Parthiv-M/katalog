"use client";

import { ResponsiveStream } from "@nivo/stream";
import GraphWrapper from "./GraphWrapper"
import { GRAPH_THEME } from "@/lib/constants"
import { COLORS } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function NetworkStream({ data }: { data: any }) {
    const allKeys = Object.keys(data[0]);
    const barKeys = allKeys.filter(key => key !== 'month');
    return (
        <GraphWrapper title="Activity over time">
            <ResponsiveStream
                data={data}
                keys={barKeys}
                margin={{ top: 20, right: 180, bottom: 20, left: 40 }}
                enableGridX={true}
                enableGridY={true}
                borderColor={{ theme: 'background' }}
                dotSize={8}
                dotBorderWidth={2}
                dotBorderColor={{ from: 'color', modifiers: [['darker', 0.7]] }}
                legends={[
                    {
                        anchor: 'right',
                        direction: 'column',
                        translateX: 100,
                        itemsSpacing: 15,
                        itemWidth: 80,
                        itemHeight: 16,
                    }
                ]}
                theme={{
                    ...GRAPH_THEME,
                    tooltip: {
                        container: {
                            background: COLORS.surface,
                            color: COLORS.text,
                            fontSize: '0.8rem'
                        }
                    }
                }}
                axisBottom={null}
                colors={{ scheme: 'yellow_green_blue' }}
            />
        </GraphWrapper>
    )
}