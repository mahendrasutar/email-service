const express = require("express");
require("dotenv").config();
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT;

const transpoter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

app.get("/health", (req, res) => {
    return res.json({
        message: "Server is healthy"
    });
});

app.post("/api/v1/sendMail", async (req, res) => {
    const {name, email, message} = await req.body;

    try{
        if(!name || !email || !message){
            return res.status(400).json({
                message: "inputs fields are empty!"
            });
        }

        const mailData = {
            from: email,
            to: process.env.EMAIL_USER,
            subject: `New contact form submission from ${name}`,
            text: `
                Name: ${name},
                Email: ${email},
                Message: ${message}
            `,
        };

        const info = await transpoter.sendMail(mailData, (error, info) => {
            if(error){
                console.log(error);
                return res.json({
                    message: "Error sending mail",
                    error: error
                });
            }

            console.log(info);
            return res.json({
                message: "Mail sent successfully",
                info: info
            });
        });
    }catch{
        return res.json({
            message: "Error sending mail. Try again after sometime"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

