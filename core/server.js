// call the packages we need
var https = require("https");
var http = require("http");
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
var partials = require('express-partials');
var config = require('./config').config(); // get our config file
var companyService = require('./services/company.service');
// // Add headers
app.use(function (req, res, next) {
  if (config.allowedOrigins.indexOf(req.headers.origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  }
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  // Header security
  res.setHeader('Strict-Transport-Security', 'max-age=157680000')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  // Pass to next layer of middleware
  console.log('req', req.originalUrl, 'method', req.method);
  res.locals.protocol = req.protocol;
  res.locals.baseURL = `${config.website}${req.originalUrl}`;
  // Go to next module
  next();
});
// Initial Passport
var passport = require("passport");
app.use(passport.initialize());
require("./services/passport-google.service").setup();
require("./services/passport-local.service").setup();
// Initial Express Validator
var expressValidator = require('express-validator');
app.use(expressValidator());
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
// Register models
require('./models').setup();
require('./models').initialize()

// setting base url for job portal page

// Register views
app.set('view engine', 'ejs');
app.use(partials());
app.use(express.static('public'));
app.use(express.static('images'));
app.use(expressValidator());

app.locals.headerDescription = '';
app.locals.logo = '';
companyService.getCompany().then(company => {
  if (company && company.length) {
    app.locals.headerDescription = company[0].header_description
    app.locals.logo = company[0].logo
    app.locals.company = company[0];
  }
}).catch(error => {
  console.log('error getting company details ', error);
});

// Register routes
require('./routes').setup(app);
// START THE SERVER
// =============================================================================
var port = process.env.PORT || 8082;        // set our port
var options = {
  ciphers: config.server.ciphers,
  honorCipherOrder: config.server.honorCipherOrder,
  secureProtocol: config.server.secureProtocol
};
//var server = https.createServer(options, app).listen(port);
var server = http.createServer(app).listen(port);
console.log("server has been started at " + port);
server.timeout = 10 * 60 * 1000;
// Handle uncaught exceptions
process.on('uncaughtException', function (err) {
  console.log("Something went wrong: ", err);
});

