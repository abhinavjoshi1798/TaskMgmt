import mongoose, { Schema } from "mongoose";
const ActivityLogSchema = new Schema({
    taskId: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    action: {
        type: String,
        enum: ["CREATED", "ASSIGNED", "REASSIGNED", "STATUS_UPDATED", "CONTENT_UPDATED"],
        required: true
    },
    performedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    previousValue: {
        type: String
    },
    newValue: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: Schema.Types.Mixed
    }
}, {
    versionKey: false
});
export const ActivityLogModel = mongoose.model("ActivityLog", ActivityLogSchema);
