import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error("Error:", err);

    if (err.name === "ValidationError") {
        res.status(400).json({
            message: "Validation error",
            errors: err.errors || err.message
        });
        return;
    }

    if (err.name === "CastError") {
        res.status(400).json({
            message: "Invalid ID format"
        });
        return;
    }

    res.status(err.status || 500).json({
        message: err.message || "Internal server error"
    });
};

export const notFound = (req: Request, res: Response): void => {
    res.status(404).json({
        message: "Route not found"
    });
};
