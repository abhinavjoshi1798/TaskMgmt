import mongoose, { Schema } from "mongoose";
import { User } from "../constant/interface.js";

const UserSchema: Schema<User> = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        required: true,
        default: "user"
    },
    points: {
        type: Number,
        default: 0
    },
    emailVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    isDeleted:{
        type: Boolean,
        required: true,
        default: false
    }
}, {
    versionKey: false,
});

export const UserModel = mongoose.model<User>("User", UserSchema);
