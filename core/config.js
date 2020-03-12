var devConfig = require('./configs/config.dev');
var prodConfig = require('./configs/config.prod');
var localConfig = require('./configs/config.local');

var config = {
  dev: devConfig,
  prod: prodConfig,
  local: localConfig
}

module.exports = {
  config: function () { return config[process.env.NODE_ENV] || config.local; }
}
