var nodemailer = require('nodemailer');
var config = require('../config').config();
var companyService = require('../services/company.service');

exports.sendEmail = async function (emailObj, next) {
    if (config.emailConfig.stop === false) {

        // get email configuration by company
        let emailConfig = await getEmailConfig('smtp');

        if (emailConfig && emailConfig.hasOwnProperty('user')) {
            // create reusable transporter object
            if (emailObj.toEmail && config.emailConfig.test === true) {
                emailObj.toEmail = config.emailConfig.testRecepient;
            }
            var transporter = nodemailer.createTransport({
                service: 'SMTP',
                auth: {
                    user: emailConfig.user,
                    pass: emailConfig.password,
                },
                secureConnection: true, // use SSL
                port: emailConfig.port, // port for secure SMTP
                host: emailConfig.host, // Amazon email SMTP hostname
            });

            // setup email data with unicode symbols
            var mailOptions = {
                from: emailConfig.fromEmail, // sender address
                to: emailObj.toEmail, // list of receivers
                subject: emailObj.subject, // Subject line
                html: await getEmailBody({
                    title: emailObj.title,
                    body: emailObj.body,
                    signature: config.companyInfo.signature
                }) // html body,
            };

            if (emailObj.attachments) {
                mailOptions.attachments = emailObj.attachments
            }

            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('email config error', error);
                    next(error, null);
                } else {
                    next(null, 'Email sent');
                }
            });
        } else {
            console.log('email config not found');
            next({status: 500, message: 'email config not found'}, null);
        }
    } else {
        console.log(`send email service stop : ${config.emailConfig.stop}`);
        next(null, {status: 200, message: `send email service stop : ${config.emailConfig.stop}`});
    }
}


let getEmailBody = async function (obj) {
    let emailTemplate = await getEmailConfig('template');
    var content = emailTemplate.content;
    if (content) {
        for (var prop in obj) {
            content = content.replace(new RegExp('{' + prop + '}', 'g'), obj[prop]);
        }
    }
    return content;
}

exports.getEmailContent = function (heading, url) {
    return `
        <h1 style="font-weight: 400; margin-top: 0;">${heading}</h1>
        <p>To verify account and generate new password.<a href="${url}">click here</a> </p>
    `
}

let getEmailConfig = async (group) => {
    let company = [];
    let settings = [];
    company = await companyService.getCompany();
    settings = await companyService.getSettings({id: company[0].id, group});
    let emailConfig = {};
    for (let i = 0; i < settings.length; i++) {
        Object.defineProperty(emailConfig, settings[i].key, {
            value: settings[i].value,
            writable: true
        });
    }
    return emailConfig;
}
