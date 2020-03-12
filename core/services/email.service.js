var nodemailer = require('nodemailer');
var config = require('../config').config();

exports.sendEmail = function (emailObj, next) {
    // create reusable transporter object
    if (config.emailConfig.test === true) {
        emailObj.toEmail = config.emailConfig.testRecepient;
    }
    var transporter = nodemailer.createTransport({
        service: 'SMTP',
        auth: {
            user: config.emailConfig.user,
            pass: config.emailConfig.pass,
        },
        secureConnection: true, // use SSL
        port: config.emailConfig.port, // port for secure SMTP
        host: config.emailConfig.host, // Amazon email SMTP hostname
    });

    // setup email data with unicode symbols
    var mailOptions = {
        from: config.emailConfig.fromEmail, // sender address
        to: emailObj.toEmail, // list of receivers
        subject: emailObj.subject, // Subject line
        html: getEmailBody(emailObj.subject, emailObj.body, "<b>HR team</b><br>Akeo Software Solutions Pvt Ltd<br><a href='mailto:hr@akeo.in'>hr@akeo.in</a>") // html body,
    };

    if (emailObj.attachments) {
        mailOptions.attachments = emailObj.attachments
    }

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            next(error, null);
        } else {
            next(null, 'Email sent');
        }
    });
}


exports.getEmailBody = function (title, body, signature) {
    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
                <title>${title}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body {
                    font-family: proxima-nova, sans-serif !important;
                    }

                    a {
                    text-decoration: none;
                    color: #273f5b
                    }

                    a i {
                    color: #fff;
                    }

                    .custom a {
                    text-decoration: underline;
                    color: #fff !important;
                    }

                    .custom {
                    color: #ffffff !important;
                    }

                    .bg-footer {
                    background-size: cover;
                    background: url(https://cdn.akeo.tech/footer_bg.jpg);
                    }
                </style>
            </head>
            <body style="margin:0; background: #F7F7F7" data-gr-c-s-loaded="true">
                <table width="600" cellspacing="0" bgcolor="#fff" align="center">
                    <thead>
                        <tr>
                            <td>
                            <div style="display: block;">
                                <img src="https://cdn.akeo.tech/header.jpg" style="width:100%;height:auto">
                            </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="color: #444; padding: 1.0em 1.5em; ">
                                <h3 style="font-weight: 400; margin-top: 0;">
                                    ${title}
                                </h3>
                                ${body}
                                <p style="font-weight: 300 ; margin-bottom: 0;margin-top: 10px;">
                                    ${signature}
                                </p>
                                <p style="font-size: 10px;">
                                    <b>NOTE: This is an automatically generated email, please do not reply.</b>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div class="bg-footer" style=" background-size: cover; background: url(https://cdn.akeo.tech/footer_bg.jpg); display: flex; padding: 15px; color: #fff;">
                                    <div style="width: 60%; max-width: 60%">
                                        <p class="custom" style="margin: 0; color: #ffffff!important; font-size: 14px;">Malwa Towers, A-13, Hanuman Nagar</p>
                                        <p class="custom" style="margin: 0; color: #fff!important; font-size: 14px;">Sirsi Road, Jaipur - 302021</p>
                                        </div>
                                        <div style="width: 40%; max-width: 40%; font-size: 18px; text-align: right; margin-top: 5px">
                                        <a href="https://www.facebook.com/AkeoIndia/">
                                            <img src="https://cdn.akeo.tech/f1.png" style=" margin-right: 10px">
                                        </a>
                                        <a href="https://twitter.com/Akeo_Tech">
                                            <img src="https://cdn.akeo.tech/2t.png" style=" margin-right: 10px">
                                        </a>
                                        <a href="https://www.linkedin.com/company/akeoindia">
                                            <img src="https://cdn.akeo.tech/3l.png" style=" margin-right: 10px">
                                        </a>
                                        <a href="https://medium.com/akeo-tech">
                                            <img src="https://cdn.akeo.tech/4m.png" style=" margin-right: 10px">
                                        </a>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
        </html>
    `
}

exports.getEmailContent = function (heading, url) {
    return `
        <h1 style="font-weight: 400; margin-top: 0;">${heading}</h1>
        <p>To verify account and generate new password.<a href="${url}">click here</a> </p>
    `
}