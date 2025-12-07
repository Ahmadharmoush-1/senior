import nodemailer from "nodemailer";

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    console.log("ENV DEBUG:", {
      GMAIL_USER: process.env.GMAIL_USER,
      GMAIL_PASS_LENGTH: process.env.GMAIL_PASS?.length || "undefined",
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"CarFinder Hub" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent to:", to);
  } catch (err) {
    console.error("❌ FULL EMAIL ERROR:", err);
    throw err;
  }
};
