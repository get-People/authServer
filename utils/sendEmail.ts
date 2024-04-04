import { createTransport } from "nodemailer"

 const sendEmail = async (to: string, subject: string, message: string) => {
    try {
        const transport = createTransport({
            "service": "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });
        await transport.sendMail({
            from: process.env.EMAIL,
            to,
            subject,
            html: message
        })
        return true
    }
    catch (error) {
        console.error(error);
        return false;
    }
}

export default sendEmail;