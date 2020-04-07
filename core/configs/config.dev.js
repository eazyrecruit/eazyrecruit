module.exports = {
  secret: 'ilovescotchyscotch',
  website: 'https://dev.eazyrecruit.in',
  allowedOrigins: ['https://dev.eazyrecruit.in','http://localhost:4200, http://localhost:8081/api, https://dev-api.eazyrecruit.in', '*'],
  server: {
    cert: './cer.pem',
    key: './key.pem',
    ciphers: 'DASDJHASJHSGASAKSAJSKAJSAKSJ',
    honorCipherOrder: true,
    secureProtocol: 'TLSv1_2_method'
  },
  website: 'http://dev.eazyrecruit.in',
  emailConfig: {
    host: 'email-smtp.eu-west-1.amazonaws.com',
    port: 587,
    user: 'AKIAIY6YZ475BD7DAERQ',
    pass: 'ArkJvRnnlKOXWtWJDg/tfKLax97/PvLeZLAWdGd7/Z4V',
    fromEmail: 'Akeo India<noreply@akeo.in>',
    fromDisplayname: 'Akeo India<noreply@akeo.in>',
    test: true,
    testRecepient: 'ashish@akeo.no'
  },
  jwt: {
    secret: 'SHDJHDSDSD&(**DSUDSY^D&^USDHSODISOIY&D*SYDDH',
    expireTime: 60 * 60 * 24, // for admin we will use 24hr
    audience: 'EazyRecruitUsers', 
    issuer: 'https://dev-api.eazyrecruit.in'
  },
  mongo: {
    host:'mongodb://eazyrecruit:klkjhgbvfcf@ez_mongodb/admin'
  },
  chipmunc: {
    url: 'http://192.168.1.157:9031/api/'
  },
  googleAuth: {
    'clientID': '69938045268-m33a1kasl2peiqj9117kd2osr63en7qf.apps.googleusercontent.com',
    'clientSecret': 'r7vAl-nI-dOX8J2ABUHAl51V',
    'callbackURL': '/admin//assets/auth-callback.html'
  },
  redis: {
    host: "redis://:klkjhgbvfcf@ez_redis:6379/0"
  },
  elasticSearch: {
    host:"ez_elastic:9200"
  }
};
