import dotenv from 'dotenv'
dotenv.config()

import nodemailer from 'nodemailer'

let transporter = nodemailer.createTransport({
    host : process.env.EMAIL_HOST, //host
    port : process.env.EMAIL_PORT, //port
    secure : false, // true for 465 port else false
    auth : {
        user : process.env.EMAIL_USER, //your gmail ID
        pass : process.env.EMAIL_PASS, //your gmail Password
    }
    
})

export default transporter