import { ActivityLogModel } from "../models/ActivityLog.js";
import { ActivityLog } from "../constant/interface.js";

export const createActivityLog = async (logData: {
    taskId: string;
    action: ActivityLog["action"];
    performedBy: string;
    previousValue?: string;
    newValue?: string;
    metadata?: Record<string, any>;
}): Promise<void> => {
    try {
        await ActivityLogModel.create({
            ...logData,
            timestamp: new Date()
        });
    } catch (error) {
        console.error("Error creating activity log:", error);
    }
};

export const getTaskActivityLogs = async (taskId: string) => {
    return await ActivityLogModel.find({ taskId })
        .populate("performedBy", "name email")
        .sort({ timestamp: -1 });
};
