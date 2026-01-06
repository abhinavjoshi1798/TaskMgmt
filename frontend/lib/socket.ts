import { io, Socket } from "socket.io-client";
import { getItem } from "@/utils/localStorage";

let socket: Socket | null = null;

export const initializeSocket = (): Socket | null => {
    if (typeof window === "undefined") {
        return null;
    }

    if (socket?.connected) {
        return socket;
    }

    const token = getItem("token");
    if (!token) {
        return null;
    }

    const serverUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

    socket = io(serverUrl, {
        auth: {
            token: token
        },
        transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
        console.log("Socket connected");
    });

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
    });

    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = (): Socket | null => {
    if (!socket) {
        return initializeSocket();
    }
    return socket;
};
