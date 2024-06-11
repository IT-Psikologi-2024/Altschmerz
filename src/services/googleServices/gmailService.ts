import nodemailer from 'nodemailer';

const gmailSend = async (mailOptions: any) => {
    try {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASSWORD
            }
        });

        await transporter.sendMail(mailOptions);
        console.log('Email sent to:', mailOptions.to);
    } catch (error) {
        throw new Error(error);
    }
}

export { gmailSend }