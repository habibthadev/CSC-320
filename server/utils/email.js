import nodemailer from "nodemailer";

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Document QA <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(subject, text) {
    // Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text,
    };

    // Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      "Welcome to Document QA!",
      `Welcome to Document QA, ${this.firstName}! We're glad to have you on board.`
    );
  }

  async sendPasswordReset(otp) {
    await this.send(
      "Your password reset OTP (valid for 10 minutes)",
      `Forgot your password? Here is your OTP: ${otp}\nIf you didn't forget your password, please ignore this email!`
    );
  }
}

export default Email;
