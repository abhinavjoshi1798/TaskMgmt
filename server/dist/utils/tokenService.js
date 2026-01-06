import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET_KEY;
export const generateVerificationToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};
export const verifyToken = (token) => {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "object" &&
        "email" in decoded &&
        "userId" in decoded) {
        return {
            email: decoded.email,
            userId: decoded.userId,
        };
    }
    return null;
};
