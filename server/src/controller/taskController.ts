import { Response } from "express";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../middleware/authMiddleware.js";
import { TaskModel } from "../models/Task.js";
import { createActivityLog, getTaskActivityLogs } from "../services/activityLogService.js";
import { updateUserPoints, getUserPoints } from "../services/leaderboardService.js";
import { Server as SocketIOServer } from "socket.io";
import { imageValidator, uploadedFile, removeImage } from "../utils/imageUtils.js";

let ioInstance: SocketIOServer | null = null;

export const setSocketIO = (io: SocketIOServer) => {
    ioInstance = io;
};

const emitNotification = (event: string, data: any) => {
    if (ioInstance) {
        ioInstance.emit(event, data);
    }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, assignedTo } = req.body;
        const createdBy = req.userId!;

        if (!title || !description) {
            res.status(400).json({ message: "Title and description are required" });
            return;
        }

        let imageName: string | null = null;

        if (req.files?.image) {
            const image = req.files.image as UploadedFile;
            const validMsg = imageValidator(image.size, image.mimetype);
            if (validMsg) {
                res.status(422).json({ errors: { image: validMsg } });
                return;
            }
            imageName = await uploadedFile(image);
        } else {
            res.status(422).json({ error: { Image: "Image field is required." } });
            return;
        }

        const task = await TaskModel.create({
            title,
            description,
            images: imageName ? [imageName] : [],
            status: "TODO",
            assignedTo: assignedTo || null,
            createdBy,
            isDeleted: false
        });

        await createActivityLog({
            taskId: task._id.toString(),
            action: "CREATED",
            performedBy: createdBy,
            metadata: { title, description }
        });

        if (assignedTo) {
            await createActivityLog({
                taskId: task._id.toString(),
                action: "ASSIGNED",
                performedBy: createdBy,
                newValue: assignedTo,
                metadata: { assignedTo }
            });

            emitNotification("taskAssigned", {
                taskId: task._id.toString(),
                assignedTo,
                title: task.title
            });
        }

        const populatedTask = await TaskModel.findById(task._id)
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");

        res.status(201).json({
            message: "Task created successfully",
            task: populatedTask
        });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const userRole = req.user!.role;

        let query: any = { isDeleted: false };

        if (userRole === "user") {
            query.assignedTo = userId;
        }

        const tasks = await TaskModel.find(query)
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({ tasks });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.userId!;
        const userRole = req.user!.role;

        const task = await TaskModel.findOne({ _id: id, isDeleted: false })
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");

        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }

        if (userRole === "user" && task.assignedTo?.toString() !== userId) {
            res.status(403).json({ message: "Access denied" });
            return;
        }

        res.status(200).json({ task });
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, description, assignedTo } = req.body;
        const userId = req.userId!;
        const userRole = req.user!.role;

        if (userRole !== "admin") {
            res.status(403).json({ message: "Only admin can update task content" });
            return;
        }

        const task = await TaskModel.findOne({ _id: id, isDeleted: false });

        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }

        if (task.status !== "TODO") {
            res.status(400).json({ message: "Task content can only be edited when status is TODO" });
            return;
        }

        const changes: any = {};

        if (title !== undefined && title !== task.title) {
            changes.title = { previous: task.title, new: title };
            task.title = title;
        }

        if (description !== undefined && description !== task.description) {
            changes.description = { previous: task.description, new: description };
            task.description = description;
        }

        if (req.files?.image) {
            const image = req.files.image as UploadedFile;
            const validMsg = imageValidator(image.size, image.mimetype);
            if (validMsg) {
                res.status(422).json({ errors: { image: validMsg } });
                return;
            }

            if (task.images && task.images.length > 0 && task.images[0]) {
                removeImage(task.images[0]);
            }

            const imageName = await uploadedFile(image);
            changes.images = { previous: task.images, new: [imageName] };
            task.images = [imageName];
        }

        if (Object.keys(changes).length > 0) {
            await createActivityLog({
                taskId: task._id.toString(),
                action: "CONTENT_UPDATED",
                performedBy: userId,
                metadata: changes
            });
        }

        if (assignedTo !== undefined) {
            const oldAssignedTo = task.assignedTo?.toString();
            const newAssignedTo = assignedTo || null;

            if (oldAssignedTo !== newAssignedTo) {
                task.assignedTo = newAssignedTo;
                const action = oldAssignedTo ? "REASSIGNED" : "ASSIGNED";
                await createActivityLog({
                    taskId: task._id.toString(),
                    action,
                    performedBy: userId,
                    previousValue: oldAssignedTo || undefined,
                    newValue: newAssignedTo || undefined,
                    metadata: { oldAssignedTo, newAssignedTo }
                });

                emitNotification("taskAssigned", {
                    taskId: task._id.toString(),
                    assignedTo: newAssignedTo,
                    title: task.title,
                    reassigned: !!oldAssignedTo
                });
            }
        }

        await task.save();

        const updatedTask = await TaskModel.findById(task._id)
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");

        res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask
        });
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.userId!;
        const userRole = req.user!.role;

        if (!status || !["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
            res.status(400).json({ message: "Valid status is required (TODO, IN_PROGRESS, DONE)" });
            return;
        }

        const task = await TaskModel.findOne({ _id: id, isDeleted: false });

        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }

        if (userRole === "user" && task.assignedTo?.toString() !== userId) {
            res.status(403).json({ message: "You can only update tasks assigned to you" });
            return;
        }

        const previousStatus = task.status;
        
        if (status === "TODO" && previousStatus !== "TODO") {
            res.status(400).json({ message: "Cannot revert to TODO status" });
            return;
        }

        if (status === "IN_PROGRESS" && previousStatus === "DONE") {
            res.status(400).json({ message: "Cannot change status from DONE to IN_PROGRESS" });
            return;
        }

        task.status = status;
        await task.save();

        await createActivityLog({
            taskId: task._id.toString(),
            action: "STATUS_UPDATED",
            performedBy: userId,
            previousValue: previousStatus,
            newValue: status
        });

        if (status === "DONE" && previousStatus !== "DONE" && task.assignedTo) {
            const currentPoints = await getUserPoints(task.assignedTo.toString());
            await updateUserPoints(task.assignedTo.toString(), currentPoints + 1);

            emitNotification("pointsUpdated", {
                userId: task.assignedTo.toString(),
                points: currentPoints + 1
            });
        }

        emitNotification("taskStatusUpdated", {
            taskId: task._id.toString(),
            title: task.title,
            status,
            updatedBy: userId,
            assignedTo: task.assignedTo?.toString()
        });

        const updatedTask = await TaskModel.findById(task._id)
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email");

        res.status(200).json({
            message: "Task status updated successfully",
            task: updatedTask
        });
    } catch (error) {
        console.error("Error updating task status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.userId!;
        const userRole = req.user!.role;

        if (userRole !== "admin") {
            res.status(403).json({ message: "Only admin can delete tasks" });
            return;
        }

        const task = await TaskModel.findOne({ _id: id, isDeleted: false });

        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }

        if (task.images && task.images.length > 0) {
            task.images.forEach(imageName => {
                if (imageName) {
                    removeImage(imageName);
                }
            });
        }

        task.isDeleted = true;
        await task.save();

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getTaskActivityLog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userRole = req.user!.role;

        if (userRole !== "admin") {
            res.status(403).json({ message: "Only admin can view activity logs" });
            return;
        }

        const task = await TaskModel.findOne({ _id: id, isDeleted: false });

        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }

        const activityLogs = await getTaskActivityLogs(id);

        res.status(200).json({ activityLogs });
    } catch (error) {
        console.error("Error fetching activity logs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
