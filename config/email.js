import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io", //host
  port: 2525, //port
  secure: false, // true for 465 port else false
  auth: {
    user: "b787310f8d19d4",
    pass: "ee581ace71e81e",
  },
});

export default transporter;
