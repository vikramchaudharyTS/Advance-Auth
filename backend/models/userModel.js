import mongoose, { mongo } from "mongoose";

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    name:{
        type: String,
    },
    password:{
        type: String,
        required: true,
    },
    lastLogin:{
        type:Date,
        default: Date.now()
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date,
}, {timestamps: true})

export const userModel = mongoose.model("User", userSchema)

