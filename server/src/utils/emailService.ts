import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

export const sendVerificationEmail = async (email: string, token: string, userName: string): Promise<void> => {
    try {
        const transporter = createTransporter();
        
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        
        const templatePath = path.resolve(__dirname, "../views/emailVerification.ejs");
        const html = await ejs.renderFile(templatePath, {
            userName,
            verificationUrl
        });
        
        const mailOptions = {
            from: process.env.EMAIL_ID,
            to: email,
            subject: "Email Verification",
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw error;
    }
};
