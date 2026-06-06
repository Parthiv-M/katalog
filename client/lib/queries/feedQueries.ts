import { DailyActivity, ActivityStream, CalendarDay, Feed, FeedData } from "@/types";
import { supabase } from "../supabase";
import { ALL_POSSIBLE_ACTIONS, FEED_TABLE_NAME } from "../constants";

export async function getFeedData(userId?: string): Promise<FeedData> {
    const { data: feed, error } = await supabase
        .from(FEED_TABLE_NAME)
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

    const dailyActivity = calculateDailyActivity(feedData);

    const calendarData = calculateCalendarData(feedData);

    const networkActivity = calculateNetworkActivity(feedData, allActionsForCharts);

    const { data: feedMessages, error: feedMessageerror } = await supabase
        .from(FEED_TABLE_NAME)
        .select('action, header_text, book_title, timestamp')
        .order('timestamp', { ascending: false })
        .limit(10);

    if (feedMessageerror) {
        console.error('Error fetching feed:', error);
        throw new Error('Failed to fetch feed data');
    }

    const feedMessageList = (feedMessages as Feed[]) || [];

    return {
        dailyActivity,
        calendarData,
        networkActivity,
        feedMessageList
    };
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Count feed events for each of the last 7 calendar days (oldest -> today),
 * labelled by weekday name. Days with no activity are zero-filled.
 */
function calculateDailyActivity(feed: Feed[]): DailyActivity[] {
    // Tally events per calendar day ("YYYY-MM-DD")
    const dayCounts = new Map<string, number>();
    for (const item of feed) {
        if (!item.timestamp) continue;
        const key = item.timestamp.slice(0, 10);
        dayCounts.set(key, (dayCounts.get(key) || 0) + 1);
    }

    const now = Date.now();
    const result: DailyActivity[] = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now - i * DAY_MS);
        const key = date.toISOString().slice(0, 10); // "YYYY-MM-DD"
        result.push({
            day: WEEKDAYS[date.getUTCDay()],
            count: dayCounts.get(key) || 0,
        });
    }
    return result;
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