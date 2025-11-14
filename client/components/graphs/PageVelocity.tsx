'use client';

import { ResponsiveLine } from '@nivo/line'
import GraphWrapper from './GraphWrapper';
import { GRAPH_THEME } from '@/lib/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PageVelocity({ data }: { data: any }) {
    return (
        <GraphWrapper>
            <ResponsiveLine /* or Line for fixed dimensions */
                data={data}
                margin={{ top: 40, right: 20, bottom: 20, left: 20 }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                curve="natural"
                pointSize={12}
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