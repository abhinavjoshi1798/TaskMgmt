export interface User {
    _id?: string;
    id?: string;
    email: string;
    name: string;
    role: "admin" | "user";
    points?: number;
    emailVerified?: boolean;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

export interface Task {
    _id: string;
    title: string;
    description: string;
    images?: string[];
    status: "TODO" | "IN_PROGRESS" | "DONE";
    assignedTo?: {
        _id: string;
        name: string;
        email: string;
    } | string;
    createdBy: {
        _id: string;
        name: string;
        email: string;
    } | string;
    createdAt: string;
    updatedAt: string;
}

export interface ActivityLog {
    _id: string;
    taskId: string;
    action: "CREATED" | "ASSIGNED" | "REASSIGNED" | "STATUS_UPDATED" | "CONTENT_UPDATED";
    performedBy: {
        _id: string;
        name: string;
        email: string;
    };
    previousValue?: string;
    newValue?: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    email: string;
    points: number;
}

export interface UserStats {
    points: number;
    rank: number | null;
}