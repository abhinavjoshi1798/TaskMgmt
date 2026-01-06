"use client";

import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { logout } from "@/lib/slices/authSlice";
import { disconnectSocket } from "@/lib/socket";
import { Layout, Button, Typography, Space } from "antd";
import { LogoutOutlined, DashboardOutlined, TrophyOutlined } from "@ant-design/icons";
import { AuthState } from "@/constants/interface";

const { Header, Content } = Layout;
const { Title } = Typography;

function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state: { auth: AuthState }) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        disconnectSocket();
        router.push("/login");
    };

    const menuItems = [
        {
            key: user?.role === "admin" ? "/admin-dashboard" : "/dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
        },
    ];

    if (user?.role === "admin") {
        menuItems.push({
            key: "/admin-dashboard",
            icon: <TrophyOutlined />,
            label: "Admin Dashboard",
        });
    }

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "0 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <Title level={4} style={{ margin: 0 }}>
                    Task Management System
                </Title>
                <Space>
                    <span>Welcome, {user?.name}</span>
                    <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>
                        Logout
                    </Button>
                </Space>
            </Header>
            <Content style={{ padding: "24px" }}>
                {children}
            </Content>
        </Layout>
    );
}

export default DashboardLayoutClient;
