const dotenv = require('dotenv');
var pathToRegexp = require('path-to-regexp');
const fs = require('fs');
dotenv.config({path: "./.env"});
normalize = (param) => {
    if (typeof (param) == 'string') {
        param = param.replace(/\s+/g, '');
        return JSON.parse(param);
    }
    return param;
};

booleanConvert = (param) => {
    return param == 'true';
};

module.exports = {
    config: function () {
        return {
            secret: process.env.SECRET || 'ihatescotchyscotch',
            allowedOrigins: normalize(process.env.ALLOWED_ORIGINS) || ["*"],
            server: {
                cert: process.env.SERVER_CERT || './cer.pem',
                key: process.env.SERVER_KEY || './key.pem',
                ciphers: process.env.SERVER_CIPHER || 'ASPLIAASJHSGASAKSAJSKAJSAKSJ',
                honorCipherOrder: booleanConvert(process.env.SERVER_CIPHER_ORDER),
                secureProtocol: process.env.SERVER_SECURE_PROTOCOL || 'TLSv1_2_method'

            },
            website: process.env.WEB || 'https://www.eazyrecruit.in',
            emailConfig: {
                stop: booleanConvert(process.env.EMAIL_STOP) || false,
                test: booleanConvert(process.env.EMAIL_TEST),
                testRecepient: process.env.TEST_RECEPIENT || 'testeazyrecruit@gmail.com'
            },
            jwt: {
                secret: 'SHDJHDSDSD&(**DSUDSY^D&^USDHSODISOIY&D*SYDDH',
                expireTime: Number(process.env.JWT_EXPIRE_TIME) || 86400, // for admin we will use 24hr
                audience: process.env.JWT_AUDIENCE || 'EazyRecruitUsers',
                issuer: process.env.JWT_ISSUER || 'https://www.eazyrecruit.in'
            },
            googleAuth: {
                'callbackURL': process.env.GOOGLE_CALLBACK_URL || '/admin/assets/auth-callback.html'
            },
            mongo: {
                host: process.env.MONGO_URI || 'mongodb://userName:password@ez_mongodb/admin'
            },
            redis: {
                host: process.env.RADIS_URI || "redis://:userName@ez_redis:6379/0"
            },
            elasticSearch: {
                host: process.env.ELASTIC_SEARCH || "ez_elastic:9200"
            },
            encrypt: {
                iv: process.env.ENCRYPT_IV || 'acfftoftdfghdaoq',
                key: process.env.ENCRYPT_KEY || 'bzsdfgftshdndjrlxwmjxoofvpquspku'
            },
            pyUrl: process.env.PYTHON_URL || "/api/engine/resume",
            admin: {
                username: process.env.ADMIN_USER_NAME || "admin@eazyrecruit.in"
            },
            roles: ['admin', 'hr', 'interviewer'],
            companyInfo: {
                signature: process.env.COMPANY_SIGNATURE || "<b>HR team</b><br>Akeo Software Solutions Pvt Ltd<br><a href='mailto:hr@akeo.in'>hr@akeo.in</a>",
                name: process.env.COMPANY_NAME || 'Eazyrecruit',
                website: process.env.COMPANY_WEBSITE || 'https://www.eazsyrecruit.in/',
                email: process.env.COMPANY_EMAIL || 'info@eazyrecruist.in',
                address_line_1: process.env.COMPANY_ADRESS || '1st fsloor, malwa tower',
                phone: process.env.COMPANY_PHONE || '9876543210'
            }
        }
    }
};
