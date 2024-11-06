//@ts-nocheck
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplates.js"
import { mailtrapClient, sender } from "./mailtrap.config.js"


export const sendVerificationEmail = async (email, verificationToken) => {
    const recipients = [{ email }]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipients,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        })

        console.log("Verification Email send successfully", response);
    } catch (error) {
        console.log("EF-B/sendVerificationEmail ", error.message);
        res.status(400).json({ success: false, message: "EF-B/sendVerificationEmail " + error.message })
    }
}

export const sendWelcomeEmail = async (email, name) => {
    const recipients = [{ email }]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipients,
            template_uuid: "25e70844-ac5b-412c-bf83-0ac672d41eda",
            template_variables: {
                "company_info_name": "the_secret_room",
                "name": name
            }
        })
        console.log("Welcome Email send sucessfully", response);
    } catch (error) {
        console.log("EF-B/sendWelcomeEmail", error.message);
        throw new Error("Error sending welcome email", error.message)
    }

}

export const sendPasswordResetEmail = async (email, url) => {
    const recipients = [{ email }]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipients,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", url),
            category: "reset password"
        })
        console.log("Reset password email send successfully", response);
    } catch (error) {
        console.log("EF-B/resetPasswordEmail ", error.message);
        res.status(400).json({ success: false, message: "EF-B/resetPasswordEmail " + error.message })
    }
}

export const resetPasswordSuccessEmail = async (email) => {
    const recipients = [{ email }]
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipients,
            subject: "Reset password successfull",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "reset password"
        })
        console.log("Reset password successfully", response);
    } catch (error) {
        console.log("EF-B/resetPasswordSuccessEmail ", error.message);
        res.status(400).json({ success: false, message: "EF-B/resetPasswordSuccessEmail " + error.message })
    }
}