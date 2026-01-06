import { LEADERBOARD_URL, USER_STATS_URL } from "@/constants/UrlConstants";
import axios from "axios";
import { getItem } from "@/utils/localStorage";
import { LeaderboardEntry, UserStats } from "@/constants/interface";

const getAuthHeaders = () => {
    const token = getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const fetchLeaderboardAction = async (limit: number = 10): Promise<{ status: boolean; leaderboard?: LeaderboardEntry[]; message?: string }> => {
    try {
        const response = await axios.get(`${LEADERBOARD_URL}?limit=${limit}`, getAuthHeaders());
        return {
            status: true,
            leaderboard: response.data.leaderboard
        };
    } catch (error: unknown) {
        console.error("Error fetching leaderboard:", error);
        let errorMessage = "Failed to fetch leaderboard";
        if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data?.message || errorMessage;
        }
        return {
            status: false,
            message: errorMessage
        };
    }
};

export const fetchUserStatsAction = async (): Promise<{ status: boolean; stats?: UserStats; message?: string }> => {
    try {
        const response = await axios.get(USER_STATS_URL, getAuthHeaders());
        return {
            status: true,
            stats: response.data
        };
    } catch (error: unknown) {
        console.error("Error fetching user stats:", error);
        let errorMessage = "Failed to fetch user stats";
        if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data?.message || errorMessage;
        }
        return {
            status: false,
            message: errorMessage
        };
    }
};
