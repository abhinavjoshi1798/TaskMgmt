import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

export const generateVerificationToken = (payload: {
  email: string;
  userId: string;
}): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

export const verifyToken = (
  token: string
): { email: string; userId: string } | null => {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (
    typeof decoded === "object" &&
    "email" in decoded &&
    "userId" in decoded
  ) {
    return {
      email: decoded.email as string,
      userId: decoded.userId as string,
    };
  }
  return null;
};
