import nodemailer from "nodemailer";
import { dev } from "../config/index";

export const sendVerifyEmail = async (email: string, _id: string) => {
  try {
    //create transporter
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: dev.auth_email,
        pass: dev.auth_pw,
      },
    });

    const mailOptions = {
      from: dev.auth_email,
      to: email, //list of receivers
      subject: "verification email",
      html: `<p>Hi! <a href="http://localhost:3006/verify?id=${_id}">Please click on this link to verify your email address.</p>`,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Message sent: %s", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
