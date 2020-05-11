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
  website: 'http://localhost:8082',
  emailConfig: {
    // host: 'email-smtp.eu-west-1.amazonaws.com',
    // port: 587,
    // user: 'AKIAIY6YZ475BD7DAERQ',
    // pass: 'ArkJvRnnlKOXWtWJDg/tfKLax97/PvLeZLAWdGd7/Z4V',
    // fromEmail: 'Akeo India<noreply@akeo.in>',
    // fromDisplayname: 'Akeo India<noreply@akeo.in>',
    test: true,
    testRecepient: 'vicky@akeo.no'
  },
  jwt: {
    secret: 'SHDJHDSDSD&(**DSUDSY^D&^USDHSODISOIY&D*SYDDH',
    expireTime: 60 * 60 * 24, // for admin we will use 24hr
    audience: 'EazyRecruitUsers', 
    issuer: 'https://dev-api.eazyrecruit.in'
  },
  googleAuth: {
    'clientID': '760504546841-0plne4g72ekra4847vvb22tilolj8oc8.apps.googleusercontent.com',
    'clientSecret': 'HgU2-NmRMW6Q77fh2KJeSYg2',
    'callbackURL': '/admin/assets/auth-callback.html'
  },
  mongo: {
    host: 'mongodb://eazyrecruit:klkjhgbvfcf@192.168.1.168:27019/admin'
    // host: 'mongodb://localhost:27017/eazyrecruit'
  },
  redis: {
    host: "redis://localhost:6379"
  },
  elasticSearch: {
    // host: "http://192.168.1.157:9200",
    host: "http://192.168.1.168:9400"
  },
  encrypt: {
    iv: 'cattmbworqqehaoq',
    key: 'axiwhdscmzundjrlxwmjxoofvpquspku'
  },
  pyUrl: "api/engine/resume"
};
