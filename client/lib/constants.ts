import { COLORS } from "./utils";

export const GRAPH_THEME = {
    text: {
        fill: COLORS.text
    },
    axis: {
        ticks: { text: { fill: COLORS.textMuted } },
        legend: { text: { fill: COLORS.textMuted } },
        domain: { line: { stroke: COLORS.surfaceLight } }
    },
    grid: {
        line: { stroke: COLORS.surfaceLight }
    }
}

export const IS_PROD: boolean = process.env.ENVIRONMENT === "production";

export const BOOKS_TABLE_NAME = IS_PROD ? "books" : "books_dev";
export const FEED_TABLE_NAME = IS_PROD ? "feed" : "feed_dev";

export const ACTION_WANTS_TO_READ = "wants_to_read";
export const ACTION_STARTED_READING = "started_reading";
export const ACTION_CURRENTLY_READING = "currently_reading";
export const ACTION_PROGRESS = "progress";
export const ACTION_RATED = "rated";
export const ACTION_REVIEWED = "reviewed";
export const ACTION_OTHER = "other";
export const ALL_POSSIBLE_ACTIONS = [ACTION_CURRENTLY_READING, ACTION_PROGRESS, ACTION_RATED, ACTION_REVIEWED, ACTION_STARTED_READING, ACTION_WANTS_TO_READ, ACTION_OTHER];
export const ACTION_TO_READABLE_STRING_MAP = new Map<string, string>([
    [ACTION_WANTS_TO_READ, "Wants to read"],
    [ACTION_CURRENTLY_READING, "Currently reading"],
    [ACTION_PROGRESS, "Made progress"],
    [ACTION_STARTED_READING, "Started reading"],
    [ACTION_RATED, "Rated"],
    [ACTION_REVIEWED, "Reviewed"],
    [ACTION_OTHER, "Other"],
])