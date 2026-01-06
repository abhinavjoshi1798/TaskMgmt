"use client";

import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { AuthState } from "@/constants/interface";
import { fetchTasksAction } from "@/actions/taskActions";
import { fetchUserStatsAction } from "@/actions/leaderboardActions";
import { setTasks, setLoading, setError } from "@/lib/slices/taskSlice";
import { initializeSocket, getSocket } from "@/lib/socket";
import { Button, Card, Table, Tag, message, Select, Space, Typography, Statistic, Row, Col } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, TrophyOutlined } from "@ant-design/icons";
import { updateTaskStatusAction } from "@/actions/taskActions";
import { updateTask } from "@/lib/slices/taskSlice";
import type { ColumnsType } from "antd/es/table";
import { Task, UserStats } from "@/constants/interface";
import { ClientDate } from "@/components/ClientDate";

const { Title } = Typography;

function UserDashboard() {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: { auth: AuthState }) => state.auth);
    const { tasks, loading } = useAppSelector((state) => state.task);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [statusLoading, setStatusLoading] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        dispatch(setLoading(true));
        const tasksResult = await fetchTasksAction();
        if (tasksResult.status && tasksResult.tasks) {
            dispatch(setTasks(tasksResult.tasks));
        } else {
            dispatch(setError(tasksResult.message || "Failed to load tasks"));
            message.error(tasksResult.message);
        }

        const statsResult = await fetchUserStatsAction();
        if (statsResult.status && statsResult.stats) {
            setStats(statsResult.stats);
        }
    }, [dispatch]);

    const loadStats = useCallback(async () => {
        const statsResult = await fetchUserStatsAction();
        if (statsResult.status && statsResult.stats) {
            setStats(statsResult.stats);
        }
    }, []);

    useEffect(() => {
        (async () => {
            await loadData();
        })();
        initializeSocket();

        const socket = getSocket();
        if (socket) {
            socket.on("taskAssigned", (data) => {
                message.info(`New task assigned: ${data.title}`);
                loadData();
            });

            socket.on("pointsUpdated", (data) => {
                const userId = user?._id || user?.id;
                if (data.userId === userId) {
                    loadStats();
                }
            });

            socket.on("taskStatusUpdated", () => {
                loadData();
            });

            return () => {
                socket.off("taskAssigned");
                socket.off("pointsUpdated");
                socket.off("taskStatusUpdated");
            };
        }
    }, [user, loadData, loadStats]);

    const handleStatusChange = async (taskId: string, newStatus: "TODO" | "IN_PROGRESS" | "DONE") => {
        setStatusLoading(taskId);
        const result = await updateTaskStatusAction(taskId, newStatus);
        if (result.status && result.task) {
            dispatch(updateTask(result.task));
            message.success("Task status updated successfully");
            loadStats();
        } else {
            message.error(result.message || "Failed to update task status");
        }
        setStatusLoading(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "TODO":
                return "default";
            case "IN_PROGRESS":
                return "processing";
            case "DONE":
                return "success";
            default:
                return "default";
        }
    };

    const getNextStatus = (currentStatus: string): "IN_PROGRESS" | "DONE" | null => {
        if (currentStatus === "TODO") return "IN_PROGRESS";
        if (currentStatus === "IN_PROGRESS") return "DONE";
        return null;
    };

    const columns: ColumnsType<Task> = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            ellipsis: true,
        },
        {
            title: "Image",
            dataIndex: "images",
            key: "images",
            render: (images: string[]) => {
                if (!images || images.length === 0 || !images[0]) return "-";
                const imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"}/api/${images[0]}`;
                return (
                    <img 
                        src={imageUrl} 
                        alt="Task" 
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                    />
                );
            },
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string, record: Task) => {
                const nextStatus = getNextStatus(status);
                return (
                    <Space>
                        <Tag color={getStatusColor(status)}>{status}</Tag>
                        {nextStatus && (
                            <Button
                                size="small"
                                loading={statusLoading === record._id}
                                onClick={() => handleStatusChange(record._id, nextStatus)}
                                type="primary"
                            >
                                Mark as {nextStatus.replace("_", " ")}
                            </Button>
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => <ClientDate date={date} format="date-only" />,
        },
    ];

    const todoCount = tasks.filter(t => t.status === "TODO").length;
    const inProgressCount = tasks.filter(t => t.status === "IN_PROGRESS").length;
    const doneCount = tasks.filter(t => t.status === "DONE").length;

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                <Title level={2}>User Dashboard</Title>

                <Row gutter={16} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Total Tasks"
                                value={tasks.length}
                                prefix={<FileTextOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Todo"
                                value={todoCount}
                                prefix={<ClockCircleOutlined />}
                                styles={{ content: { color: "#faad14" } }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="In Progress"
                                value={inProgressCount}
                                prefix={<ClockCircleOutlined />}
                                styles={{ content: { color: "#1890ff" } }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic
                                title="Completed"
                                value={doneCount}
                                prefix={<CheckCircleOutlined />}
                                styles={{ content: { color: "#52c41a" } }}
                            />
                        </Card>
                    </Col>
                </Row>

                {stats && (
                    <Card className="mb-6">
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Statistic
                                    title="Your Points"
                                    value={stats.points}
                                    prefix={<TrophyOutlined />}
                                    styles={{ content: { color: "#faad14" } }}
                                />
                            </Col>
                            <Col xs={24} sm={12}>
                                <Statistic
                                    title="Your Rank"
                                    value={stats.rank || "N/A"}
                                    suffix={stats.rank ? "#" : ""}
                                />
                            </Col>
                        </Row>
                    </Card>
                )}

                <Card>
                    <Title level={4}>My Tasks</Title>
                    <Table
                        columns={columns}
                        dataSource={tasks}
                        rowKey="_id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                </Card>
            </div>
        </div>
        </DashboardLayout>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <UserDashboard />
        </ProtectedRoute>
    );
}
