module.exports = {
  secret: 'bettertohavedeepknowledge',
  // website: 'https://portalapi.eazyrecruit.in',
  // website: 'http://192.168.1.157:9072',    //backend end 
  // website: 'https://app.eazyrecruit.in',    //backend end
  allowedOrigins: ['http://192.168.1.157:9073', 'https://web.eazyrecruit.in'],  //front end
  // allowedOrigins: ['https://portal.eazyrecruit.in'],
  server: {
    cert: './cer.pem',
    key: './key.pem',
    ciphers: 'DASDJHASJHSGASAKSAJSKAJSAKSJ',
    honorCipherOrder: true,
    secureProtocol: 'TLSv1_2_method'
  },
  // website: 'http://192.168.1.157:9073',
  website: 'https://web.eazyrecruit.in',
  emailConfig: {
    // host: 'email-smtp.eu-west-1.amazonaws.com',
    // port: 587,
    // user: 'AKIAIY6YZ475BD7DAERQ',
    // pass: 'ArkJvRnnlKOXWtWJDg/tfKLax97/PvLeZLAWdGd7/Z4V',
    // fromEmail: 'Akeo India<noreply@akeo.in>',
    // fromDisplayname: 'Akeo India<noreply@akeo.in>',
    test: true,
    testRecepient: 'ashish@akeo.no'
  },
  jwt: {
    secret: 'SHDJHDSDSD&(**DSUDSY^D&^USDHSODISOIY&D*SYDDH',
    expireTime: 60 * 60 * 24, // for admin we will use 24hr
    audience: 'eazyRecruitUsers',
    // issuer: 'http://192.168.1.157:9073'
    issuer: 'https://web.eazyrecruit.in'
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
  mongo: {
    host: 'mongodb://eazyrecruit:8EjqJAidtp@192.168.1.46/eazyrecruitprod'
  },
  redis: {
    host: "redis://eazyrecruit-redis:6379"
  },
  elasticSearch: {
    host: "http://eazyrecruit-elasticsearch:9200"
  },
  encrypt: {
    iv: 'cattmbworqqehaoq',
    key: 'axiwhdscmzundjrlxwmjxoofvpquspku'
  },
  pyUrl: "/api/engine/resume",
  admin: {
    username: "admin@eazyrecruit.in"
  }
};
