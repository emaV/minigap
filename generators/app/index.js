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
  this.mkdir('app');
  this.mkdir('app/css');
  this.mkdir('app/templates');
  this.copy('app.css', "app/css/app.css");
  this.copy('layout.html', "app/layout.html");
  this.write('.minigap', '');
  if (this.options['coffee']) {
    this.directory('coffee', './');  
  } else {
    this.directory('js', './');
  }

  this.copy('../../../dist/minigap.js', 'lib/minigap.js');
};