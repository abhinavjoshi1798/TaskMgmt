import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

export const supportMimes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/gif",
    "image/webp",
];

export const bytesToMb = (bytes: number): number => {
    return bytes / (1024 * 1024);
};

export const imageValidator = (size: number, mime: string): string | null => {
    if (bytesToMb(size) > 2) {
        return "Image size must be less than 2 MB";
    } else if (!supportMimes.includes(mime)) {
        return "Image must be of type png, jpg, jpeg, gif, webp.";
    }
    return null;
};

export const uploadedFile = async (image: UploadedFile): Promise<string> => {
    const imageName = `${uuidv4()}.png`;
    const uploadPath = path.join(process.cwd(), "public", "images", imageName);
    
    const dir = path.dirname(uploadPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    await new Promise<void>((resolve, reject) => {
        image.mv(uploadPath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });

    return imageName;
};

export const removeImage = (imageName: string): void => {
    const imagePath = path.join(process.cwd(), "public", "images", imageName);
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
};
