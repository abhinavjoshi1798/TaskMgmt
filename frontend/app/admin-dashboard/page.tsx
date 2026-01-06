"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { AuthState } from "@/constants/interface";
import { fetchTasksAction, createTaskAction, updateTaskAction, deleteTaskAction, fetchTaskActivityLogAction } from "@/actions/taskActions";
import { fetchLeaderboardAction } from "@/actions/leaderboardActions";
import { setTasks, setLoading, setError } from "@/lib/slices/taskSlice";
import { initializeSocket, getSocket } from "@/lib/socket";
import {
    Button,
    Card,
    Table,
    Tag,
    message,
    Modal,
    Form,
    Input,
    Select,
    Space,
    Typography,
    Statistic,
    Row,
    Col,
    Popconfirm,
    Drawer,
    Timeline,
    Descriptions,
    Upload
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    HistoryOutlined,
    TrophyOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    UserOutlined,
    LoginOutlined
} from "@ant-design/icons";
import { updateTask, addTask, removeTask } from "@/lib/slices/taskSlice";
import type { ColumnsType } from "antd/es/table";
import { Task, LeaderboardEntry, ActivityLog } from "@/constants/interface";
import axios from "axios";
import { getItem } from "@/utils/localStorage";
import { ClientDate } from "@/components/ClientDate";
import { adminLoginAsUserAction } from "@/actions/authActions";
import { loginUser } from "@/lib/slices/authSlice";
import { useRouter } from "next/navigation";

const { Title } = Typography;
const { TextArea } = Input;

function AdminDashboard() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { user } = useAppSelector((state: { auth: AuthState }) => state.auth);
    const { tasks, loading } = useAppSelector((state) => state.task);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [form] = Form.useForm();
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    useEffect(() => {
        loadData();
        initializeSocket();

        const socket = getSocket();
        if (socket) {
            socket.on("taskAssigned", (data) => {
                message.info(`Task assigned to user: ${data.title}`);
                loadData();
            });

            socket.on("taskStatusUpdated", (data) => {
                message.info(`Task status updated: ${data.title} - ${data.status}`);
                loadData();
            });

            socket.on("pointsUpdated", () => {
                loadLeaderboard();
            });

            return () => {
                socket.off("taskAssigned");
                socket.off("taskStatusUpdated");
                socket.off("pointsUpdated");
            };
        }
    }, []);

    const loadData = async () => {
        dispatch(setLoading(true));
        const tasksResult = await fetchTasksAction();
        if (tasksResult.status && tasksResult.tasks) {
            dispatch(setTasks(tasksResult.tasks));
        } else {
            dispatch(setError(tasksResult.message || "Failed to load tasks"));
            message.error(tasksResult.message);
        }

        loadLeaderboard();
    };

    const loadLeaderboard = async () => {
        const result = await fetchLeaderboardAction(10);
        if (result.status && result.leaderboard) {
            setLeaderboard(result.leaderboard);
        }
    };

    const handleCreateTask = () => {
        setEditingTask(null);
        form.resetFields();
        setIsTaskModalOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        form.setFieldsValue({
            title: task.title,
            description: task.description,
            assignedTo: typeof task.assignedTo === "object" ? task.assignedTo._id : task.assignedTo
        });
        setIsTaskModalOpen(true);
    };

    const handleSubmitTask = async (values: any) => {
        try {
            const imageFile = values.image && values.image.length > 0 ? values.image[0].originFileObj : null;
            
            const taskData = {
                title: values.title,
                description: values.description,
                assignedTo: values.assignedTo,
                image: imageFile
            };

            if (editingTask) {
                const result = await updateTaskAction(editingTask._id, taskData);
                if (result.status && result.task) {
                    dispatch(updateTask(result.task));
                    message.success("Task updated successfully");
                    setIsTaskModalOpen(false);
                    form.resetFields();
                } else {
                    if (result.errors) {
                        Object.keys(result.errors).forEach(key => {
                            message.error(result.errors![key]);
                        });
                    } else {
                        message.error(result.message || "Failed to update task");
                    }
                }
            } else {
                const result = await createTaskAction(taskData);
                if (result.status && result.task) {
                    dispatch(addTask(result.task));
                    message.success("Task created successfully");
                    setIsTaskModalOpen(false);
                    form.resetFields();
                } else {
                    if (result.errors) {
                        Object.keys(result.errors).forEach(key => {
                            message.error(result.errors![key]);
                        });
                    } else {
                        message.error(result.message || "Failed to create task");
                    }
                }
            }
        } catch (error) {
            console.error("Error submitting task:", error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        const result = await deleteTaskAction(taskId);
        if (result.status) {
            dispatch(removeTask(taskId));
            message.success("Task deleted successfully");
        } else {
            message.error(result.message || "Failed to delete task");
        }
    };

    const handleViewActivity = async (task: Task) => {
        setSelectedTask(task);
        setIsActivityDrawerOpen(true);
        const result = await fetchTaskActivityLogAction(task._id);
        if (result.status && result.activityLogs) {
            setActivityLogs(result.activityLogs);
        }
    };

    const fetchUsers = async (): Promise<any[]> => {
        try {
            const token = getItem("token");
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5000"}/api/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.users || [];
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    };

    const [users, setUsers] = useState<any[]>([]);
    const [loginAsUserLoading, setLoginAsUserLoading] = useState<string | null>(null);
    const [isLoginAsUserModalOpen, setIsLoginAsUserModalOpen] = useState(false);
    const [selectedUserForLogin, setSelectedUserForLogin] = useState<any>(null);
    const [loginPasswordForm] = Form.useForm();

    useEffect(() => {
        fetchUsers().then(setUsers);
    }, []);

    const handleLoginAsUserClick = (targetUser: any) => {
        setSelectedUserForLogin(targetUser);
        setIsLoginAsUserModalOpen(true);
        loginPasswordForm.resetFields();
    };

    const handleLoginAsUserConfirm = async () => {
        if (!user?.email || !selectedUserForLogin) {
            message.error("Admin email or target user not found");
            return;
        }

        try {
            const values = await loginPasswordForm.validateFields();
            const adminPassword = values.password;

            setLoginAsUserLoading(selectedUserForLogin._id || selectedUserForLogin.id);

            const result = await adminLoginAsUserAction(
                user.email,
                adminPassword,
                selectedUserForLogin._id || selectedUserForLogin.id
            );

            if (result.status && result.token && result.user) {
                dispatch(loginUser({ user: result.user, token: result.token }));
                message.success(`Logged in as ${result.user.name}`);
                setIsLoginAsUserModalOpen(false);
                setSelectedUserForLogin(null);
                loginPasswordForm.resetFields();
                router.push("/dashboard");
            } else {
                message.error(result.message || "Failed to login as user");
            }
        } catch (error) {
        } finally {
            setLoginAsUserLoading(null);
        }
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
            render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
        },
        {
            title: "Assigned To",
            dataIndex: "assignedTo",
            key: "assignedTo",
            render: (assignedTo: any) => {
                if (!assignedTo) return "-";
                return typeof assignedTo === "object" ? assignedTo.name : "-";
            },
        },
        {
            title: "Created By",
            dataIndex: "createdBy",
            key: "createdBy",
            render: (createdBy: any) => {
                return typeof createdBy === "object" ? createdBy.name : "-";
            },
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record: Task) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEditTask(record)}
                        disabled={record.status !== "TODO"}
                    >
                        Edit
                    </Button>
                    <Button
                        icon={<HistoryOutlined />}
                        onClick={() => handleViewActivity(record)}
                    >
                        Activity
                    </Button>
                    <Popconfirm
                        title="Delete this task?"
                        onConfirm={() => handleDeleteTask(record._id)}
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const todoCount = tasks.filter(t => t.status === "TODO").length;
    const inProgressCount = tasks.filter(t => t.status === "IN_PROGRESS").length;
    const doneCount = tasks.filter(t => t.status === "DONE").length;

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                <Title level={2}>Admin Dashboard</Title>

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

                <Row gutter={16} className="mb-6">
                    <Col xs={24} lg={16}>
                        <Card
                            title="Tasks"
                            extra={
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleCreateTask}
                                >
                                    Create Task
                                </Button>
                            }
                        >
                            <Table
                                columns={columns}
                                dataSource={tasks}
                                rowKey="_id"
                                loading={loading}
                                pagination={{ pageSize: 10 }}
                                scroll={{ x: 'max-content' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card title={
                            <Space>
                                <TrophyOutlined />
                                Leaderboard
                            </Space>
                        }>
                            <Table
                                dataSource={leaderboard}
                                rowKey="userId"
                                pagination={false}
                                size="small"
                                columns={[
                                    {
                                        title: "Rank",
                                        dataIndex: "rank",
                                        key: "rank",
                                        width: 60,
                                    },
                                    {
                                        title: "Name",
                                        dataIndex: "name",
                                        key: "name",
                                    },
                                    {
                                        title: "Points",
                                        dataIndex: "points",
                                        key: "points",
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>

                <Row gutter={16} className="mb-6">
                    <Col xs={24}>
                        <Card title={
                            <Space>
                                <UserOutlined />
                                Users
                            </Space>
                        }>
                            <Table
                                dataSource={users.filter(u => u.role === "user")}
                                rowKey={(record) => record._id || record.id}
                                pagination={{ pageSize: 10 }}
                                columns={[
                                    {
                                        title: "Name",
                                        dataIndex: "name",
                                        key: "name",
                                    },
                                    {
                                        title: "Email",
                                        dataIndex: "email",
                                        key: "email",
                                    },
                                    {
                                        title: "Points",
                                        dataIndex: "points",
                                        key: "points",
                                        render: (points: number) => points || 0,
                                    },
                                    {
                                        title: "Actions",
                                        key: "actions",
                                        render: (_, record: any) => (
                                            <Button
                                                type="primary"
                                                icon={<LoginOutlined />}
                                                onClick={() => handleLoginAsUserClick(record)}
                                                loading={loginAsUserLoading === (record._id || record.id)}
                                            >
                                                Login as User
                                            </Button>
                                        ),
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>

                <Modal
                    title={editingTask ? "Edit Task" : "Create Task"}
                    open={isTaskModalOpen}
                    onCancel={() => {
                        setIsTaskModalOpen(false);
                        form.resetFields();
                        setEditingTask(null);
                    }}
                    onOk={() => form.submit()}
                    width={600}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmitTask}
                    >
                        <Form.Item
                            name="title"
                            label="Title"
                            rules={[{ required: true, message: "Please enter task title" }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, message: "Please enter task description" }]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                        <Form.Item
                            name="image"
                            label="Image"
                            valuePropName="fileList"
                            getValueFromEvent={(e) => {
                                if (Array.isArray(e)) {
                                    return e;
                                }
                                return e?.fileList;
                            }}
                            rules={editingTask ? [] : [{ required: true, message: "Please upload an image" }]}
                        >
                            <Upload
                                listType="picture-card"
                                beforeUpload={(file) => {
                                    const isImage = file.type.startsWith('image/');
                                    if (!isImage) {
                                        message.error('You can only upload image files!');
                                        return Upload.LIST_IGNORE;
                                    }
                                    const isLt2M = file.size / 1024 / 1024 < 2;
                                    if (!isLt2M) {
                                        message.error('Image must be smaller than 2MB!');
                                        return Upload.LIST_IGNORE;
                                    }
                                    return false;
                                }}
                                maxCount={1}
                            >
                                <div>
                                    <div style={{ marginTop: 8 }}>Upload</div>
                                </div>
                            </Upload>
                        </Form.Item>
                        <Form.Item
                            name="assignedTo"
                            label="Assign To"
                        >
                            <Select
                                placeholder="Select user"
                                allowClear
                                showSearch
                                optionFilterProp="children"
                            >
                                {users.map(user => (
                                    <Select.Option key={user._id || user.id} value={user._id || user.id}>
                                        {user.name} ({user.email})
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Modal>

                <Drawer
                    title="Task Activity Log"
                    placement="right"
                    onClose={() => setIsActivityDrawerOpen(false)}
                    open={isActivityDrawerOpen}
                    size={600}
                >
                    {selectedTask && (
                        <Descriptions column={1} className="mb-4">
                            <Descriptions.Item label="Title">{selectedTask.title}</Descriptions.Item>
                            <Descriptions.Item label="Description">{selectedTask.description}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={getStatusColor(selectedTask.status)}>{selectedTask.status}</Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                    <Timeline
                        items={activityLogs.map((log) => ({
                            content: (
                                <div>
                                    <div className="font-semibold">{log.action.replace("_", " ")}</div>
                                    <div className="text-gray-500 text-sm">
                                        By: {typeof log.performedBy === "object" ? log.performedBy.name : "Unknown"}
                                    </div>
                                    {log.previousValue && (
                                        <div className="text-gray-500 text-sm">
                                            From: {log.previousValue}
                                        </div>
                                    )}
                                    {log.newValue && (
                                        <div className="text-gray-500 text-sm">
                                            To: {log.newValue}
                                        </div>
                                    )}
                                    <div className="text-gray-400 text-xs mt-1">
                                        <ClientDate date={log.timestamp} format="full" />
                                    </div>
                                </div>
                            ),
                        }))}
                    />
                </Drawer>

                <Modal
                    title={`Login as ${selectedUserForLogin?.name || "User"}`}
                    open={isLoginAsUserModalOpen}
                    onOk={handleLoginAsUserConfirm}
                    onCancel={() => {
                        setIsLoginAsUserModalOpen(false);
                        setSelectedUserForLogin(null);
                        loginPasswordForm.resetFields();
                    }}
                    confirmLoading={loginAsUserLoading !== null}
                    okText="Login"
                >
                    <Form
                        form={loginPasswordForm}
                        layout="vertical"
                        onFinish={handleLoginAsUserConfirm}
                    >
                        <Form.Item
                            name="password"
                            label="Enter your admin password"
                            rules={[{ required: true, message: "Please enter your admin password" }]}
                        >
                            <Input.Password placeholder="Admin password" />
                        </Form.Item>
                        {selectedUserForLogin && (
                            <p className="text-gray-500 text-sm">
                                You are about to login as: <strong>{selectedUserForLogin.name}</strong> ({selectedUserForLogin.email})
                            </p>
                        )}
                    </Form>
                </Modal>
            </div>
        </div>
        </DashboardLayout>
    );
}

export default function AdminDashboardPage() {
    return (
        <ProtectedRoute requireAdmin>
            <AdminDashboard />
        </ProtectedRoute>
    );
}
