//@ts-nocheck
import { userModel } from "../models/userModel.js";
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { resetPasswordSuccessEmail, sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail } from "../config/mailtrap/email.js";


export const signup = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        if (!email || !password || !name) {
            throw new Error("All fields required")
        }
        const userAlreadyExists = await userModel.findOne({ email })

        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists!" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();


        const user = new userModel({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
        })
        await user.save()
        // jwt
        generateTokenAndSetCookie(res, user._id)
        // verify email 
        await sendVerificationEmail(user.email, verificationToken)

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: null
            }
        })

    } catch (error) {
        console.log("EF-B/signup ", error.message);
        res.status(400).json({ success: false, message: "EF-B/signup " + error.message })
    }
}

export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await userModel.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        })

        if (!user) return res.status(400).json({ success: false, message: "Invalid or expired verification code" })

        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiresAt = undefined
        await user.save()

        await sendWelcomeEmail(user.email, user.name)

        res.status(200).json({ success: true, message: "Email verified successfully", user: { ...user._doc, password: undefined } })

    } catch (error) {
        console.log("EF-B/verifyEmail ", error.message);
        res.status(400).json({ success: false, message: "EF-B/verifyEmail " + error.message })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await userModel.findOne({ email })

        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" })
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) return res.status(400).json({ success: false, message: "Invalid credentials" })

        if (!user.isVerified) return res.status(400).json({ success: false, message: "Please verify your email first!" })

        generateTokenAndSetCookie(res, user._id)
        user.lastLogin = new Date()
        await user.save()

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: {
                ...user._doc,
                password: null
            }
        })

    } catch (error) {
        console.log("EF-B/login ", error.message);
        res.status(400).json({ success: false, message: "EF-B/login " + error.message })
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email })
        if (!user) return res.status(400).json({ success: false, message: "user not found" })

        //generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex")
        const resetTokenExpiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = resetTokenExpiresAt

        await user.save()

        //send email
        await sendPasswordResetEmail(user.email, `http:localhost:5173/reset-password/${resetToken}`)

        res.status(200).json({
            success: true,
            message: "Password reset email sent. Please check your email."
        });

    } catch (error) {
        console.log("EF-B/password-reset ", error.message);
        res.status(400).json({ success: false, message: "EF-B/password-reset " + error.message })
    }
}

export const resetPassword = async (req, res) => {
    const { newPassword, confirmNewPassword } = req.body;
    const resetToken = req.params.token;

    try {
        // Find user by reset token and check token expiration
        const user = await userModel.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token." });

        // Check if new passwords match
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ success: false, message: "New password and confirmation password do not match." });
        }

        // Hash new password and update it
        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        //send reset password successfull mail
        await resetPasswordSuccessEmail(user.email)

        res.status(200).json({
            success: true,
            message: "Password reset successful.",
        });

    } catch (error) {
        console.error("Error in resetPassword:", error.message);
        res.status(500).json({ success: false, message: "Server error" + error.message });
    }
};

export const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,           // Secure cookies only accessible by the server
        secure: "production", // Set secure flag only in production (for HTTPS)
        sameSite: "None",         // Allows cross-site requests (important for third-party contexts)
    });
    res.status(200).send("Logged out successfully.");
};



export const checkAuth = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select("-password")
        if (!user) return res.status(400).json({ success: false, message: "user not found" })

        return res.status(200).json({ success: true, user })

    } catch (error) {
        console.error("EF-B/CheckAuth ", error.message);
        res.status(500).json({ success: false, message: "EF-B/CheckAuth " + error.message });
    }
}