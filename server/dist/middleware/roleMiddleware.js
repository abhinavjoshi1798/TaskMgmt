export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: "Authentication required" });
        return;
    }
    if (req.user.role !== "admin") {
        res.status(403).json({ message: "Admin access required" });
        return;
    }
    next();
};
