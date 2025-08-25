import nodemailer from "nodemailer";
import {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
} from "../config/env.js";

export const createTransporter = () => {
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    console.warn(
      "Email configuration incomplete. Email features will be disabled."
    );
    return null;
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT || 587,
    secure: EMAIL_PORT === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

export const sendEmail = async (options) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("Email service not configured. Skipping email send.");
    return { skipped: true };
  }

  const mailOptions = {
    from: EMAIL_FROM || `Haskmee <${EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

export const sendPasswordResetEmail = async (email, otp, name) => {
  return sendEmail({
    email,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>You recently requested to reset your password. Use the following OTP code to complete the process:</p>
        <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Best regards,<br/>Haskmee Team</p>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    email,
    subject: "Welcome to Haskmee!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333;">Welcome to Haskmee!</h2>
        <p>Hello ${name},</p>
        <p>Welcome to our document processing and question generation platform! We're excited to have you on board.</p>
        <p>Here's what you can do with your account:</p>
        <ul>
          <li>Upload documents (PDF, DOCX, images)</li>
          <li>Generate questions from your documents</li>
          <li>Chat with your documents using AI</li>
          <li>Create custom exams and quizzes</li>
        </ul>
        <p>Get started by logging into your account and uploading your first document.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br/>Haskmee Team</p>
      </div>
    `,
  });
};
