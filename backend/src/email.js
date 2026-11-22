import nodemailer from "nodemailer";

const port = Number(process.env.SMTP_PORT || 1025);

const config = {
  host: process.env.SMTP_HOST || "mailpit",
  port: port,
  secure: port === 465,
};

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  config.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };
}

const transporter = nodemailer.createTransport(config);

export async function sendVerificationEmail(email, code) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || "noreply@projecthealth.local",
    to: email,
    subject: "ProjectHealth AI - Email Verification",
    text: `Your ProjectHealth AI verification code is: ${code}

This code expires in 10 minutes.

If you did not request this code, ignore this email.`,
  });
}
