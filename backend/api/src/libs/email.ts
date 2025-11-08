import nodemailer from "nodemailer";
import type { SendMailOptions, Transporter } from "nodemailer";


const transporter: Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER as string,
    pass: process.env.GMAIL_PASS as string,
  },
});

async function verifyTransporter(): Promise<boolean> {
    try {
        await transporter.verify();
        console.log("Email transporter is ready to send messages.");
        return true;
    } catch (error) {
        console.error("Error verifying email transporter:", error);
        return false;
    }
}

verifyTransporter();


export async function sendEmail(mailOptions: SendMailOptions): Promise<void> {
    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to", mailOptions.to);
    } catch (error) {
        console.error("Error sending email to", mailOptions.to, ":", error);
    }

}

export async function sendVerificationEmail(toEmail: string, verificationLink: string): Promise<boolean> {
    const mailOptions: SendMailOptions = {
        from: `Addis Music <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: "Verify your email for Addis Music",
        text: `Please verify your email by clicking the following link: ${verificationLink}`,
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
            <div style="background-color: #007bff; padding: 20px 0; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">Addis Music</h1>
            </div>
            <div style="padding: 30px;">
            <h2 style="font-size: 22px;">Confirm Your Email Address</h2>
            <p style="font-size: 16px;">
                Thank you for joining Addis Music! Click the button below to verify your email address.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="background-color: #28a745; color: #fff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 18px; font-weight: bold;">Verify Email</a>
            </div>
            <p>If the button above does not work, copy and paste this link:</p>
            <p style="color: #007bff; word-break: break-all;">
                <a href="${verificationLink}" style="color: #007bff;">${verificationLink}</a>
            </p>
            <p style="margin-top: 30px;">Best regards,<br>The Addis Music Team</p>
            </div>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #ddd; border-radius: 0 0 8px 8px;">
            <p style="font-size: 12px; color: #999;">
                You received this email because you signed up for Addis Music. If you did not, please ignore this email.
            </p>
            <p style="font-size: 12px; color: #999;">&copy; 2025 Addis Music. All rights reserved.</p>
            </div>
        </div>
        `,
    };

    await sendEmail(mailOptions);
    return true;
}
