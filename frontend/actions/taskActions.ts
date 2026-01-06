import {
    TASKS_URL,
    TASK_BY_ID_URL,
    TASK_STATUS_URL,
    TASK_ACTIVITY_URL
} from "@/constants/UrlConstants";
import axios from "axios";
import { getItem } from "@/utils/localStorage";
import { Task, ActivityLog } from "@/constants/interface";

const getAuthHeaders = () => {
    const token = getItem("token");
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export const fetchTasksAction = async (): Promise<{ status: boolean; tasks?: Task[]; message?: string }> => {
    try {
        const response = await axios.get(TASKS_URL, getAuthHeaders());
        return {
            status: true,
            tasks: response.data.tasks
        };
    } catch (error: unknown) {
        console.error("Error fetching tasks:", error);
        let errorMessage = "Failed to fetch tasks";
        if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data?.message || errorMessage;
        }
        return {
            status: false,
            message: errorMessage
        };
    }
};

export const fetchTaskByIdAction = async (id: string): Promise<{ status: boolean; task?: Task; message?: string }> => {
    try {
        const response = await axios.get(TASK_BY_ID_URL(id), getAuthHeaders());
        return {
            status: true,
            task: response.data.task
        };
    } catch (error: unknown) {
        console.error("Error fetching task:", error);
        let errorMessage = "Failed to fetch task";
        if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data?.message || errorMessage;
        }
        return {
            status: false,
            message: errorMessage
        };
    }
};

export const createTaskAction = async (taskData: {
    title: string;
    description: string;
    image?: File;
    assignedTo?: string;
}): Promise<{ status: boolean; task?: Task; message?: string; errors?: any }> => {
    try {
        const formData = new FormData();
        formData.append("title", taskData.title);
        formData.append("description", taskData.description);
        if (taskData.image) {
            formData.append("image", taskData.image);
        }
        if (taskData.assignedTo) {
            formData.append("assignedTo", taskData.assignedTo);
        }

        const token = getItem("token");
        const response = await axios.post(TASKS_URL, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        });
        return {
            status: true,
            task: response.data.task,
            message: response.data.message
        };
    } catch (error: unknown) {
        console.error("Error creating task:", error);
        let errorMessage = "Failed to create task";
        let errors: any = undefined;
        if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data?.message || errorMessage;
            errors = error.response.data?.errors || error.response.data?.error;
        }
        return {
            status: false,
            message: errorMessage,
            errors
        };
    }
};

export const updateTaskAction = async (
    id: string,
    taskData: {
        title?: string;
        description?: string;
        image?: File | null;
        assignedTo?: string;
    }
): Promise<{ status: boolean; task?: Task; message?: string; errors?: any }> => {
    try {
        const formData = new FormData();
        if (taskData.title !== undefined) {
            formData.append("title", taskData.title);
        }
        if (taskData.description !== undefined) {
            formData.append("description", taskData.description);
        }
        if (taskData.image !== undefined) {
            if (taskData.image) {
                formData.append("image", taskData.image);
            }
        }
        if (taskData.assignedTo !== undefined) {
            formData.append("assignedTo", taskData.assignedTo || "");
        }

        const token = getItem("token");
        const response = await axios.put(TASK_BY_ID_URL(id), formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        });
        return {
            status: true,
            task: response.data.task,
            message: response.data.message
        };
    } catch (error: unknown) {
        console.error("Error updating task:", error);
        let errorMessage = "Failed to update task";
        let errors: any = undefined;
        if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data?.message || errorMessage;
            errors = error.response.data?.errors || error.response.data?.error;
        }
        return {
            status: false,
            message: errorMessage,
            errors
        };
    }
};

export const updateTaskStatusAction = async (
    id: string,
    status: "TODO" | "IN_PROGRESS" | "DONE"
): Promise<{ status: boolean; task?: Task; message?: string }> => {
    try {
        const response = await axios.patch(TASK_STATUS_URL(id), { status }, getAuthHeaders());
        return {
            status: true,
            task: response.data.task,
            message: response.data.message
        };
    } catch (error: unknown) {
        console.error("Error updating task status:", error);
        let errorMessage = "Failed to update task status";
        if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data?.message || errorMessage;
        }
        return {
            status: false,
            message: errorMessage
        };
    }
};

export const deleteTaskAction = async (id: string): Promise<{ status: boolean; message?: string }> => {
    try {
        const response = await axios.delete(TASK_BY_ID_URL(id), getAuthHeaders());
        return {
            status: true,
            message: response.data.message
        };
    } catch (error: unknown) {
        console.error("Error deleting task:", error);
        let errorMessage = "Failed to delete task";
        if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data?.message || errorMessage;
        }
        return {
            status: false,
            message: errorMessage
        };
    }
};

export const fetchTaskActivityLogAction = async (id: string): Promise<{ status: boolean; activityLogs?: ActivityLog[]; message?: string }> => {
    try {
        const response = await axios.get(TASK_ACTIVITY_URL(id), getAuthHeaders());
        return {
            status: true,
            activityLogs: response.data.activityLogs
        };
    } catch (error: unknown) {
        console.error("Error fetching activity logs:", error);
        let errorMessage = "Failed to fetch activity logs";
        if (axios.isAxiosError(error) && error.response) {
            errorMessage = error.response.data?.message || errorMessage;
        }
        return {
            status: false,
            message: errorMessage
        };
    }
};
