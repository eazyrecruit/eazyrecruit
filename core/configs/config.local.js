module.exports = {
  secret: 'ilovescotchyscotch',
  website: 'https://dev.eazyrecruit.in',
  allowedOrigins: ['https://dev.eazyrecruit.in','http://localhost:4200'],
  server: {
    cert: './cer.pem',
    key: './key.pem',
    ciphers: 'DASDJHASJHSGASAKSAJSKAJSAKSJ',
    honorCipherOrder: true,
    secureProtocol: 'TLSv1_2_method'

  },
  website: 'http://localhost:4200',
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
  googleAuth: {
    'clientID': '69938045268-m33a1kasl2peiqj9117kd2osr63en7qf.apps.googleusercontent.com',
    'clientSecret': 'r7vAl-nI-dOX8J2ABUHAl51V',
    'callbackURL': '/assets/auth-callback.html'
  },
  mongo: {
    host: 'mongodb://eazyrecruit:klkjhgbvfcf@192.168.1.190:27019/admin'
    // host: 'mongodb://192.168.1.154:27017/eazyrecruit'
  },
  redis: {
    host: "redis://localhost:6379"
  },
  elasticSearch: {
    // host: "http://192.168.1.157:9200",
    host: "http://192.168.1.190:9200"
  }
};
