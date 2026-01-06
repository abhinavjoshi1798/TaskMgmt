"use client";

import dynamic from "next/dynamic";

const DashboardLayoutClient = dynamic(() => import("./DashboardLayoutClient"), {
    ssr: false,
    loading: () => <div style={{ minHeight: "100vh" }} />
});

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
