import { ActivityLogModel } from "../models/ActivityLog.js";
export const createActivityLog = async (logData) => {
    try {
        await ActivityLogModel.create({
            ...logData,
            timestamp: new Date()
        });
    }
    catch (error) {
        console.error("Error creating activity log:", error);
    }
};
export const getTaskActivityLogs = async (taskId) => {
    return await ActivityLogModel.find({ taskId })
        .populate("performedBy", "name email")
        .sort({ timestamp: -1 });
};
