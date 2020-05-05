var nodemailer = require('nodemailer');
var config = require('../config').config();
var companyService = require('../services/company.service');

exports.sendEmail = async function (emailObj, next) {
    // get email configuration by company
    let emailConfig = await getEmailConfig('smtp');

    // create reusable transporter object
    if (config.emailConfig.test === true) {
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
        html: await getEmailBody({ title: emailObj.subject, body: emailObj.body, signature: "<b>HR team</b><br>Akeo Software Solutions Pvt Ltd<br><a href='mailto:hr@akeo.in'>hr@akeo.in</a>" }) // html body,
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


let getEmailBody = async function (obj) {
    let emailTemplate = await getEmailConfig('template');
    var content = emailTemplate.content;
    for(var prop in obj) {
        content = content.replace(new RegExp('{'+ prop +'}','g'), obj[prop]);
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
    let req = {
        query: { id: company[0].id, group }
    }
    settings = await companyService.getSettings(req);
    let emailConfig = {};
    for (let i =0; i < settings.length; i++) {        
        Object.defineProperty(emailConfig, settings[i].key, {
            value: settings[i].value,
            writable: true
        });
    }
    return emailConfig;
}