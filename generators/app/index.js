'use strict';
var util = require('util');
var path = require('path');
var coffee = require('coffee-script');
var yeoman = require('yeoman-generator');


var MinigapGenerator = module.exports = function MinigapGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  // this.on('end', function () {
  //   this.installDependencies({ skipInstall: options['skip-install'] });
  // });

  // this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(MinigapGenerator, yeoman.generators.Base);

MinigapGenerator.prototype.app = function app() {
  this.mkdir('www');
  this.mkdir('www/css');
  this.copy('app.css', "www/css/app.css");
  this.copy('index.html', "www/index.html");
  this.write('.minigap', '');
  if (this.options['coffee']) {
    this.directory('coffee', './');  
  } else {
    this.directory('js', './');
  }

  this.copy('../../../dist/minigap.js', 'lib/minigap.js');
};

// MinigapGenerator.prototype.projectfiles = function projectfiles() {
//   this.copy('jshintrc', '.jshintrc');
// };
