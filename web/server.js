var express = require('express');
var app = express();

app.use(express.static('./dist'));

// a middleware with no mount path; gets executed for every request to the app
app.use(function(req, res, next) {
  res.setHeader('Strict-Transport-Security', 'max-age=157680000')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next();
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.sendFile('/dist/index.html', { root: '.' });
});

process.on('uncaughtException', function (err) {
  console.log("Something went wrong: ", err);
});

app.listen(8082);