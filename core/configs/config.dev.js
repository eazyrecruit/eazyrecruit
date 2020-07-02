module.exports = {
  secret: 'ilovescotchyscotch',
  // website: 'https://dev.eazyrecruit.in',
  allowedOrigins: ['https://dev.eazyrecruit.in','http://localhost:8082', 'http://localhost:8081/api', '*'],
  server: {
    cert: './cer.pem',
    key: './key.pem',
    ciphers: 'DASDJHASJHSGASAKSAJSKAJSAKSJ',
    honorCipherOrder: true,
    secureProtocol: 'TLSv1_2_method'
  },
  website: 'https://dev.eazyrecruit.in',
  emailConfig: {
    // host: 'email-smtp.eu-west-1.amazonaws.com',
    // port: 587,
    // user: 'AKIAIY6YZ475BD7DAERQ',
    // pass: 'ArkJvRnnlKOXWtWJDg/tfKLax97/PvLeZLAWdGd7/Z4V',
    // fromEmail: 'Akeo India<noreply@akeo.in>',
    // fromDisplayname: 'Akeo India<noreply@akeo.in>',
    stop: true,
    test: true,
    testRecepient: 'deveazyrecruit@gmail.com'
  },
  jwt: {
    secret: 'SHDJHDSDSD&(**DSUDSY^D&^USDHSODISOIY&D*SYDDH',
    expireTime: 60 * 60 * 24, // for admin we will use 24hr
    audience: 'EazyRecruitUsers', 
    issuer: 'https://dev.eazyrecruit.in'
  },
  mongo: {
    host:'mongodb://eazyrecruit:klkjhgbvfcf@ez_mongodb/admin'
  },
  chipmunc: {
    url: 'http://192.168.1.157:9031/api/'
  },
  // googleAuth: {
  //   'clientID': '69938045268-m33a1kasl2peiqj9117kd2osr63en7qf.apps.googleusercontent.com',
  //   'clientSecret': 'r7vAl-nI-dOX8J2ABUHAl51V',
  //   'callbackURL': '/admin/assets/auth-callback.html'
  // },
  googleAuth: {
    'clientID': '760504546841-0plne4g72ekra4847vvb22tilolj8oc8.apps.googleusercontent.com',
    'clientSecret': 'HgU2-NmRMW6Q77fh2KJeSYg2',
    'callbackURL': '/admin/assets/auth-callback.html'
  },
  redis: {
    host: "redis://:klkjhgbvfcf@ez_redis:6379/0"
  },
  elasticSearch: {
    host:"ez_elastic:9200"
  },
  encrypt: {
    iv: 'cattmbworqqehaoq',
    key: 'axiwhdscmzundjrlxwmjxoofvpquspku'
  },
  pyUrl: "/api/engine/resume",
  admin: {
    username: "admin@eazyrecruit.in"
  },
  roles: ['admin', 'hr', 'interviewer'],
  companyInfo: {
    name: 'Eazy Recruit',
    website: 'eazyrecruit.in',
    email: 'info@eazyrecruit.in',
    address_line_1: '1st floor, malwa tower',
    phone: '9876543210'
  }
};
