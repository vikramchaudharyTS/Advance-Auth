//@ts-nocheck
import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookie = (res, userId) => {
    // creating token by jwt
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })

    // setting the token in cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return token;
}

