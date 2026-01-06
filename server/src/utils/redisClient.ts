import IORedis from "ioredis";

const Redis = IORedis as any;
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true
});

redisClient.on("error", (error) => {
    console.log("Redis error triggered:", error);
});

redisClient.on("connect", () => {
    console.log("Redis Client Connected");
});

redisClient.on("ready", () => {
    console.log("Redis Client Ready");
});

redisClient.on("close", () => {
    console.log("Redis Client Connection Closed");
});

redisClient.on("reconnecting", () => {
    console.log("Redis Client Reconnecting");
});

export const connectRedis = async (): Promise<void> => {
    try {
        await redisClient.connect();
        console.log("Redis connected successfully");
    } catch (error) {
        console.warn("Redis connection failed - continuing without Redis:", error);
    }
};

export default redisClient;
