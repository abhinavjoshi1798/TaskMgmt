import mongoose, { Schema } from "mongoose";
const TaskSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    images: [{
            type: String
        }],
    status: {
        type: String,
        enum: ["TODO", "IN_PROGRESS", "DONE"],
        required: true,
        default: "TODO"
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    versionKey: false,
    timestamps: true
});
export const TaskModel = mongoose.model("Task", TaskSchema);
