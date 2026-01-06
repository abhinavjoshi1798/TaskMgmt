"use client";

export function ClientDate({ date, format = "full" }: { date: string | Date; format?: "full" | "date-only" }) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    let formatted: string;
    try {
        if (format === "date-only") {
            formatted = dateObj.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } else {
            formatted = dateObj.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        }
    } catch {
        formatted = dateObj.toString();
    }

    return <span>{formatted}</span>;
}
