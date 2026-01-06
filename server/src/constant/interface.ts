export interface User {
    name: string;
    email: string;
    password: string;
    role: "admin" | "user";
    emailVerified: boolean;
    isDeleted: boolean;
    points?: number;
}

export interface Task {
    title: string;
    description: string;
    images?: string[];
    status: "TODO" | "IN_PROGRESS" | "DONE";
    assignedTo?: string;
    createdBy: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ActivityLog {
    taskId: string;
    action: "CREATED" | "ASSIGNED" | "REASSIGNED" | "STATUS_UPDATED" | "CONTENT_UPDATED";
    performedBy: string;
    previousValue?: string;
    newValue?: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}