import redisClient from "../utils/redisClient.js";
import { UserModel } from "../models/User.js";

const LEADERBOARD_KEY = "leaderboard";

export const updateUserPoints = async (userId: string, points: number): Promise<void> => {
    try {
        await UserModel.findByIdAndUpdate(userId, { $set: { points } });

        console.log(`[Redis] ZADD triggered - Key: ${LEADERBOARD_KEY}, Score: ${points}, UserId: ${userId}`);
        await redisClient.zadd(LEADERBOARD_KEY, points, userId.toString());
    } catch (error) {
        console.error("Error updating user points:", error);
    }
};

export const getUserRank = async (userId: string): Promise<number | null> => {
    try {
        console.log(`[Redis] ZREVRANK triggered - Key: ${LEADERBOARD_KEY}, UserId: ${userId}`);
        const rank = await redisClient.zrevrank(LEADERBOARD_KEY, userId.toString());
        return rank !== null ? rank + 1 : null;
    } catch (error) {
        console.error("Error getting user rank:", error);
        return null;
    }
};

export const getUserPoints = async (userId: string): Promise<number> => {
    try {
        console.log(`[Redis] ZSCORE triggered - Key: ${LEADERBOARD_KEY}, UserId: ${userId}`);
        const score = await redisClient.zscore(LEADERBOARD_KEY, userId.toString());
        if (score !== null) {
            return parseFloat(score);
        }
        const user = await UserModel.findById(userId);
        return user?.points || 0;
    } catch (error) {
        console.error("Error getting user points:", error);
        return 0;
    }
};

export const getLeaderboard = async (limit: number = 10) => {
    try {
        console.log(`[Redis] ZREVRANGE triggered - Key: ${LEADERBOARD_KEY}, Start: 0, Stop: ${limit - 1}, WithScores: true`);
        const topUsersWithScores = await redisClient.zrevrange(LEADERBOARD_KEY, 0, limit - 1, "WITHSCORES");

        const userIds: string[] = [];
        const userScores: Map<string, number> = new Map();
        
        for (let i = 0; i < topUsersWithScores.length; i += 2) {
            const userId = topUsersWithScores[i];
            const score = parseFloat(topUsersWithScores[i + 1]);
            userIds.push(userId);
            userScores.set(userId, score);
        }

        const users = await UserModel.find({
            _id: { $in: userIds },
            isDeleted: false
        }).select("name email points");

        const userMap = new Map(users.map(user => [user._id.toString(), user]));

        const leaderboard = userIds.map((userId, index) => {
            const user = userMap.get(userId);
            return {
                rank: index + 1,
                userId: userId,
                name: user?.name || "Unknown",
                email: user?.email || "",
                points: userScores.get(userId) || 0
            };
        });

        return leaderboard;
    } catch (error) {
        console.error("Error getting leaderboard:", error);
        const users = await UserModel.find({ isDeleted: false })
            .select("name email points")
            .sort({ points: -1 })
            .limit(limit);

        return users.map((user, index) => ({
            rank: index + 1,
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            points: user.points || 0
        }));
    }
};

export const initializeLeaderboard = async (): Promise<void> => {
    try {
        const users = await UserModel.find({ isDeleted: false });
        for (const user of users) {
            console.log(`[Redis] ZADD triggered (Initialize) - Key: ${LEADERBOARD_KEY}, Score: ${user.points || 0}, UserId: ${user._id}`);
            await redisClient.zadd(LEADERBOARD_KEY, user.points || 0, user._id.toString());
        }
        console.log("Leaderboard initialized in Redis");
    } catch (error) {
        console.error("Error initializing leaderboard:", error);
    }
};
