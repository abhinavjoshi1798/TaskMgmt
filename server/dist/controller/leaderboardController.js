import { getLeaderboard, getUserPoints, getUserRank } from "../services/leaderboardService.js";
export const getLeaderboardData = async (req, res) => {
    try {
        const userRole = req.user.role;
        if (userRole !== "admin") {
            res.status(403).json({ message: "Only admin can view leaderboard" });
            return;
        }
        const limit = parseInt(req.query.limit) || 10;
        const leaderboard = await getLeaderboard(limit);
        res.status(200).json({ leaderboard });
    }
    catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getUserStats = async (req, res) => {
    try {
        const userId = req.userId;
        const points = await getUserPoints(userId);
        const rank = await getUserRank(userId);
        res.status(200).json({
            points,
            rank: rank || null
        });
    }
    catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
