import { getDashboardData } from '@/lib/queries';
import ReadingVelocity from "@/components/graphs/ReadingVelocity"
import Card from "@/components/ui/Card"
import PageVelocity from '@/components/graphs/PageVelocity';
import ReadingTime from '@/components/graphs/ReadingTime';
import TopAuthors from '@/components/graphs/TopAuthors';
import Composition from '@/components/graphs/Composition';
import RatingCritic from '@/components/graphs/RatingCritic';
import { getFeedData } from '@/lib/queries';
import FeedBooks from '@/components/graphs/FeedBooks';
import FeedCalendar from '@/components/graphs/Calendar';
import NetworkStream from '@/components/graphs/NetworkStream';
import ActivityList from '@/components/ui/ActivityList';
import StatusBar from '@/components/ui/StatusBar';
import ChallengeTile from '@/components/ui/ChallengeTile';
import Katalog from '@/components/ui/Logo';
import ShareCard from '@/components/ui/ShareCard';
import { ReadingChallenge } from '@/types';
import { getChallengeData } from '@/lib/queries/challengeQueries';

export default async function Page() {
    const data = await getDashboardData();
    const feed = await getFeedData();
    const challenge: ReadingChallenge = await getChallengeData();
    const topAuthorName = data.topAuthors && data.topAuthors.length > 0
        ? data.topAuthors[0].author
        : 'Unknown';

    return (
        <div className="h-screen w-full overflow-y-scroll overflow-x-hidden bg-zinc-900 lg:snap-y lg:snap-mandatory scroll-smooth">
            <Katalog />
            {/* first page: Dashboard */}
            <div className="lg:h-screen lg:px-48 snap-start shrink-0">
                <div className="h-full grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-3 gap-3 p-3 auto-rows-[22rem] lg:auto-rows-auto">
                    <Card><ReadingVelocity data={data.monthlyReading} /></Card>
                    <Card><RatingCritic data={data.ratingHeatmap} /></Card>
                    <Card><Composition data={data.shelfComposition} /></Card>

                    <Card classes="lg:row-span-2">
                        <ReadingTime data={data.readingTimeData} />
                    </Card>

                    {/* Nested grid for Page Velocity and Authors */}
                    <div className="grid grid-cols-1 lg:grid-cols-1 grid-rows-2 gap-3 lg:col-span-2 lg:row-span-2 auto-rows-[22rem] lg:auto-rows-auto">
                        <PageVelocity data={data.monthlyPages} />
                        <Card><TopAuthors data={data.topAuthors} /></Card>
                    </div>
                </div>
            </div>

            {/* second page: Feed */}
            <div className="lg:h-screen lg:px-48 w-full bg-zinc-800/40 snap-start shrink-0">
                <div className="h-full grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-4 gap-3 p-3 auto-rows-[22rem] lg:auto-rows-auto">
                    <Card classes='lg:row-span-2'>
                        <ActivityList data={feed.feedMessageList} />
                    </Card>

                    <Card classes='lg:row-span-2'>
                        <FeedBooks data={feed.actionBreakdown} />
                    </Card>

                    <Card classes="lg:block"><ChallengeTile /></Card>
                    <Card classes="lg:order-none order-last row-span-2 lg:block">
                        <ShareCard summary={data.summary} topAuthor={topAuthorName} percentage={challenge?.percentage || 0} />
                    </Card>

                    <Card classes='lg:col-span-2'>
                        <FeedCalendar data={feed.calendarData} />
                    </Card>

                    <Card classes='lg:col-span-3'>
                        <NetworkStream data={feed.networkActivity} />
                    </Card>
                </div>
            </div>
            <StatusBar />
        </div>
    )
}