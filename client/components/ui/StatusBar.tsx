import { getLastUpdated } from "@/lib/queries";
import { getNextScrape } from "@/lib/queries/metadataQueries";
import { formatToKatalogDate } from "@/lib/utils";

export default async function StatusBar() {
    const lastUpdated = await getLastUpdated();
    const nextScrape = await getNextScrape();
    return (
        <div className="snap-end shrink-0 w-full bg-black py-2 px-3 text-sm text-neutral-400 flex justify-between">
            <div className="flex items-center">
                <div className="h-2 w-2 bg-red-200 animate-pulse rounded-full mr-2"></div>
                <p>Last deployed on {formatToKatalogDate(lastUpdated)}</p>
            </div>
            <p>Next scraper run at {formatToKatalogDate(nextScrape)}</p>
        </div>
    )
}