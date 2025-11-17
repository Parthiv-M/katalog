import { Feed } from "@/types";
import GraphWrapper from "../graphs/GraphWrapper";
import ActivityTile from "./ActivityTile";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ActivityList({ data }: { data: any }) {
    return (
        <GraphWrapper title="Your feed" classes="overflow-y-scroll" isAlwaysTitle>
            {
                !data &&
                <div className="h-full w-full flex text-sm justify-center items-center">
                    <p className="text-neutral-400">No updates yet.</p>
                </div>
            }
            {
                data.map((item: Feed) => <ActivityTile key={item.timestamp} data={item} />)
            }
        </GraphWrapper>
    )
}