import { ReadingChallenge } from "@/types";
import { CHALLENGES_TABLE_NAME } from "../constants";
import { supabase } from "../supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getChallengeData(userId?: string): Promise<ReadingChallenge> {
    const currentYear = new Date().getFullYear();
    let query = supabase.from(CHALLENGES_TABLE_NAME).select("*").eq('year', currentYear);

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching reading challenge details: ', error);
        throw new Error('Failed to fetch reading challenge data');
    }

    return data[0] as ReadingChallenge;
}