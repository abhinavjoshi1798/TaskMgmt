"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/hooks";
import { AuthState } from "@/constants/interface";

export function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
    const router = useRouter();
    const { isAuthenticated, user } = useAppSelector((state: { auth: AuthState }) => state.auth);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        if (requireAdmin && user?.role !== "admin") {
            router.push("/dashboard");
            return;
        }
    }, [isAuthenticated, user, router, requireAdmin]);

    if (!isAuthenticated) {
        return null;
    }

    if (requireAdmin && user?.role !== "admin") {
        return null;
    }

    return <>{children}</>;
}
