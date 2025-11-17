import { ActionBreakdown, ActivityStream, CalendarDay, Feed, FeedData } from "@/types";
import { supabase } from "../supabase";
import { ALL_POSSIBLE_ACTIONS } from "../constants";

export async function getFeedData(userId?: string): Promise<FeedData> {
    const { data: feed, error } = await supabase
        .from('feed_dev')
        .select('action, book_title, timestamp')
        .order('timestamp', { ascending: false })
        .limit(2000);

    if (error) {
        console.error('Error fetching feed:', error);
        throw new Error('Failed to fetch feed data');
    }

    const feedData = (feed as Feed[]) || [];

    const discoveredActions = [
        ...new Set(feedData.map((item) => item.action).filter(Boolean) as string[]),
    ];
    const allActionsForCharts = Array.from(new Set([...ALL_POSSIBLE_ACTIONS, ...discoveredActions]));

    const allActions = [
        ...new Set(feedData.map((item) => item.action).filter(Boolean) as string[]),
    ];

    const top10BookTitles = getTop10Books(feedData);

    const actionBreakdown = calculateActionBreakdown(
        feedData,
        allActions,
        top10BookTitles
    );

    const calendarData = calculateCalendarData(feedData);

    const networkActivity = calculateNetworkActivity(feedData, allActionsForCharts);

    const { data: feedMessages, error: feedMessageerror } = await supabase
        .from('feed_dev')
        .select('action, header_text, book_title, timestamp')
        .order('timestamp', { ascending: false })
        .limit(10);

    if (feedMessageerror) {
        console.error('Error fetching feed:', error);
        throw new Error('Failed to fetch feed data');
    }

    const feedMessageList = (feedMessages as Feed[]) || [];

    return {
        actionBreakdown,
        calendarData,
        networkActivity,
        top10BookTitles,
        feedMessageList
    };
}

/**
 * Helper to get the top 10 most frequent book titles
 */
function getTop10Books(feed: Feed[]): string[] {
    const bookMap = new Map<string, number>();

    for (const item of feed) {
        if (!item.book_title) continue;
        bookMap.set(item.book_title, (bookMap.get(item.book_title) || 0) + 1);
    }

    const sortedBooks = Array.from(bookMap.entries()).sort(
        (a, b) => b[1] - a[1]
    );
    return sortedBooks.slice(0, 9).map((b) => b[0]);
}

function calculateActionBreakdown(
    feed: Feed[],
    allActions: string[],
    top10BookTitles: string[]
): ActionBreakdown[] {
    const topBooksSet = new Set(top10BookTitles);

    const bookCountTemplate: { [key: string]: number } = {};
    for (const title of top10BookTitles) {
        bookCountTemplate[title] = 0;
    }
    bookCountTemplate['other'] = 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const actionMap = new Map<string, any>();
    for (const action of allActions) {
        actionMap.set(action, { ...bookCountTemplate });
    }

    // Populate the map
    for (const item of feed) {
        if (!item.action || !item.book_title) continue;

        const actionStats = actionMap.get(item.action);
        if (!actionStats) continue; // Not one of the main actions

        if (topBooksSet.has(item.book_title)) {
            actionStats[item.book_title] += 1;
        } else {
            actionStats['other'] += 1;
        }
    }

    return Array.from(actionMap.entries()).map(([action, bookCounts]) => ({
        action,
        ...bookCounts,
    }));
}


function calculateCalendarData(feed: Feed[]): CalendarDay[] {
    const dayMap = new Map<string, number>();

    for (const item of feed) {
        if (!item.timestamp) continue;

        try {
            const day = item.timestamp.slice(0, 10); // "YYYY-MM-DD"
            dayMap.set(day, (dayMap.get(day) || 0) + 1);
        } catch (e) {
            console.warn('Invalid timestamp:', item.timestamp);
        }
    }

    return Array.from(dayMap.entries()).map(([day, value]) => ({
        day,
        value,
    }));
}

function calculateNetworkActivity(feed: Feed[], allActions: string[]): ActivityStream[] {
    const monthMap = new Map<string, Map<string, number>>();

    for (const item of feed) {
        if (!item.timestamp) continue;

        try {
            const month = item.timestamp.slice(0, 7); // "YYYY-MM"
            if (!monthMap.has(month)) {
                // Initialize the month with all possible actions set to 0
                const initialActionCounts = new Map<string, number>();
                for (const action of allActions) {
                    initialActionCounts.set(action, 0);
                }
                monthMap.set(month, initialActionCounts);
            }

            const actionMap = monthMap.get(month)!;
            if (item.action) { // Only increment if action exists
                actionMap.set(item.action, (actionMap.get(item.action) || 0) + 1);
            }
        } catch (e) {
            console.warn('Invalid timestamp:', item.timestamp);
        }
    }

    return Array.from(monthMap.entries()).map(([month, actionMap]) => {
        const streamItem: ActivityStream = { month };
        for (const action of allActions) {
            streamItem[action] = actionMap.get(action) || 0; // Ensure 0 if not present
        }
        return streamItem;
    });
}