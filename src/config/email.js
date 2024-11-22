const nodemailer = require('nodemailer');

const emailTransfer = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 465, // or 465 for secure,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USERNAME, // Your SMTP user
        pass: process.env.SMTP_PASSWORD, // Your SMTP password
    },
    logger: true,
    debug: true,
    connectionTimeout: 10000, // example of increasing timeout
    tls: {
        ciphers: 'SSLv3'
    }
});

const getResetPasswordHtmlTemplate = (token) => {
    const cliUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    const resetLink = `${cliUrl}/reset-password?token=${token}`; // Your reset link
    return `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Password Reset</title>
    </head>

    <body
        style="width: 100%; height: 100%; margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <table width="100%" cellspacing="0" cellpadding="0" border="0"
            style="background-color: #f5f5f5; margin: 0; padding: 0; width: 100%; height: 100%;">
            <tr>
                <td align="center" style="padding: 20px;">
                    <table style="max-width: 700px; width: 100%; text-align: center;">
                        <!-- Header with Logo -->
                        <tr>
                            <td style="padding: 30px 0;">
                                <img src="https://flpayif.stripocdn.email/content/guids/CABINET_96e4ae211adee07311e554c4273ffe1ff40f2ad1112c01c052932c2ce82cf820/images/66ffff3c572c0bae3c48532a_image_12.png" alt="Logo" style="max-width: 200px; display: block; margin: 0 auto;">
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td>
                                <div
                                    style="background: #ffffff; margin: 0 auto; border-radius: 10px; padding: 20px; color: #333333; text-align: center;">
                                    <h1 style="font-size: 46px; margin-bottom: 15px; color: #333333;">Password Reset</h1>
                                    <p style="text-align: left; margin: 15px 0; font-size: 16px;">
                                        After you click the button, you'll be asked to complete the following steps:
                                    </p>
                                    <ol style="text-align: left; margin: 20px auto; padding-left: 50px; font-size: 16px;">
                                        <li style="margin-bottom: 10px;">Enter a new password.</li>
                                        <li style="margin-bottom: 10px;">Confirm your new password.</li>
                                        <li style="margin-bottom: 10px;">Click Submit.</li>
                                    </ol>
                                    <a href="${resetLink}" target="_blank"
                                        style="display: inline-block; background: #ff8706; color: #fff; text-decoration: none; padding: 10px 30px; font-size: 20px; border-radius: 6px; margin-top: 20px;">RESET
                                        YOUR PASSWORD</a>
                                    <h3 style="color: #333333; margin-top: 20px;">This link is valid for one use only and
                                        expires in 1 hour.</h3>
                                    <p style="text-align: center; margin: 15px 0; font-size: 14px;">
                                        If you didn't request to reset your password, please disregard this message or
                                        contact our customer service department.
                                    </p>
                                </div>

                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px; text-align: center; font-size: 12px; color: #cccccc;">
                                <p style="margin: 0;">No longer want to receive these emails? <a href="#"
                                        style="color: #cccccc; text-decoration: underline;">Unsubscribe</a>.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>

    </html>
  `;
}

module.exports = {
    emailTransfer,
    getResetPasswordHtmlTemplate
}