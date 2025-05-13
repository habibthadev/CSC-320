import nodemailer from "nodemailer";

export const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export const sendEmail = async (options) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.EMAIL_USERNAME}>`,
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
        <p>Best regards,<br/>Your App Team</p>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    email,
    subject: "Welcome to our platform!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333;">Welcome to Our Platform!</h2>
        <p>Hello ${name},</p>
        <p>Thank you for registering with us. We're excited to have you on board!</p>
        <p>With our platform, you can:</p>
        <ul>
          <li>Upload documents and extract information</li>
          <li>Generate questions from your documents</li>
          <li>Chat with your documents using RAG technology</li>
        </ul>
        <p>If you have any questions or need assistance, don't hesitate to contact our support team.</p>
        <p>Best regards,<br/>Your App Team</p>
      </div>
    `,
  });
};
