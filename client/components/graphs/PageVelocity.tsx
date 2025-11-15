'use client';

import { ResponsiveLine } from '@nivo/line'
import GraphWrapper from './GraphWrapper';
import { GRAPH_THEME } from '@/lib/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPointLabelData = (datum: any) => {
    const monthAndYear = new Date(datum.data.xFormatted).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
    });
    return `${datum.data.y} (${monthAndYear})`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PageVelocity({ data }: { data: any }) {
    return (
        <GraphWrapper title="Number of pages per month">
            <ResponsiveLine
                data={data}
                margin={{ top: 40, right: 20, bottom: 20, left: 20 }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                curve="natural"
                pointSize={12}
                pointLabel={getPointLabelData}
                pointLabelYOffset={-20}
                motionConfig={"molasses"}
                layers={[
                    "lines",
                    "points",
                ]}
                colors={{ scheme: "set2" }}
                enablePointLabel={true}
                theme={GRAPH_THEME}

            />
        </GraphWrapper>
    )
}