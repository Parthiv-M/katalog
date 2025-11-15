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