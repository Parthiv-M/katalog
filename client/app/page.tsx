import { getDashboardData } from '@/lib/queries';
import ReadingVelocity from "@/components/graphs/ReadingVelocity"
import Card from "@/components/ui/Card"
import PageVelocity from '@/components/graphs/PageVelocity';
import ReadingTime from '@/components/graphs/ReadingTime';
import TopAuthors from '@/components/graphs/TopAuthors';
import Composition from '@/components/graphs/Composition';
import RatingCritic from '@/components/graphs/RatingCritic';

export default async function Page() {
    const data = await getDashboardData();
    return (
        <div className="h-screen w-screen overflow-x-hidden">
            {/* first page */}
            <div className="h-screen w-screen">
                <div className="h-full grid grid-cols-3 grid-rows-3 gap-3 p-3">
                    <Card>
                        <ReadingVelocity data={data.monthlyReading} />
                    </Card>
                    <Card>
                        <RatingCritic data={data.ratingHeatmap}/>
                    </Card>
                    <Card>
                        <Composition data={data.shelfComposition}/>
                    </Card>
                    <Card classes="row-span-2">
                        <ReadingTime data={data.readingTimeData}/>
                    </Card>
                    <div className="grid grid-rows-2 gap-3 col-span-2 row-span-2">
                        <PageVelocity data={data.monthlyPages} />
                        <Card><TopAuthors data={data.topAuthors} /></Card>
                    </div>
                </div>
            </div>
            {/* second page will go here at some point */}
        </div>
    )
}