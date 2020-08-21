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

module.exports = {
    config: function () {
        return {
            secret: process.env.SECRET || 'ilovescotchyscotch',
            allowedOrigins: normalize(process.env.ALLOWED_ORIGINS) || ["https://dev.eazyrecruit.in", "http://localhost:8082", "http://localhost:8081/api", "*"],
            server: {
                cert: process.env.SERVER_CERT || './cer.pem',
                key: process.env.SERVER_KEY || './key.pem',
                ciphers: process.env.SERVER_CIPHER || 'DASDJHASJHSGASAKSAJSKAJSAKSJ',
                honorCipherOrder: process.env.SERVER_CIPHER_ORDER || true,
                secureProtocol: process.env.SERVER_SECURE_PROTOCOL || 'TLSv1_2_method'

            },
            website: process.env.WEB || 'https://dev.eazyrecruit.in',
            emailConfig: {
                stop: process.env.EMAIL_STOP || false,
                test: process.env.EMAIL_TEST || true,
                testRecepient: process.env.TEST_RECEPIENT || 'laxman@akeo.no'
            },
            jwt: {
                secret: process.env.JWT_SECRET || 'SHDJHDSDSD&(**DSUDSY^D&^USDHSODISOIY&D*SYDDH',
                expireTime: process.env.JWT_EXPIRE_TIME || 86400, // for admin we will use 24hr
                audience: process.env.JWT_AUDIENCE || 'EazyRecruitUsers',
                issuer: process.env.JWT_ISSUER || 'https://dev-api.eazyrecruit.in'
            },
            googleAuth: {
                'clientID': process.env.GOOGLE_CLIENTID || '760504546841-0plne4g72ekra4847vvb22tilolj8oc8.apps.googleusercontent.com',
                'clientSecret': process.env.GOOGLE_CLIENTSECRET || 'HgU2-NmRMW6Q77fh2KJeSYg2',
                'callbackURL': process.env.GOOGLE_CALLBACK_URL || '/admin/assets/auth-callback.html'
            },
            mongo: {
                host: process.env.MONGO_URI || 'mongodb://eazyrecruit:klkjhgbvfcf@ez_mongodb/admin'
            },
            redis: {
                host: process.env.RADIS_URI || "redis://:klkjhgbvfcf@ez_redis:6379/0"
            },
            elasticSearch: {
                host: process.env.ELASTIC_SEARCH || "ez_elastic:9200"
            },
            encrypt: {
                iv: process.env.ENCRYPT_IV || 'cattmbworqqehaoq',
                key: process.env.ENCRYPT_KEY || 'axiwhdscmzundjrlxwmjxoofvpquspku'
            },
            pyUrl: process.env.PYTHON_URL || "/api/engine/resume",
            admin: {
                username: process.env.ADMIN_USER_NAME || "admin@eazyrecruit.in"
            },
            roles: ['admin', 'hr', 'interviewer'],
            companyInfo: {
                name: process.env.COMPANY_NAME || 'Eazy Rsecruit',
                website: process.env.COMPANY_WEBSITE || 'https://www.eazsyrecruit.in/',
                email: process.env.COMPANY_EMAIL || 'info@eazyrecruist.in',
                address_line_1: process.env.COMPANY_ADRESS || '1st fsloor, malwa tower',
                phone: process.env.COMPANY_PHONE || '9876543210'
            }
        }
    }
}
;

