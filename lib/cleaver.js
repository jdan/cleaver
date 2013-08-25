var fs   = require('fs')
var Q    = require('q');
var path = require('path');
var md   = require('node-markdown').Markdown;
var mustache = require('mustache');

function Cleaver(options) {
  if (!options.file) throw "!! Please specify a file with the --file option";

  // filenames which will be used to read in data
  this.stylesheetFile = Cleaver.ROOT_DIR + 'styles/default.css';
  this.templateFile = Cleaver.ROOT_DIR + 'templates/layout.mustache';
  this.jqueryFile = Cleaver.ROOT_DIR + 'resources/jquery.min.js';

  // user-specified files
  this.documentFile = options.file;
  this.userStylesheetFile = options.style;

  // data, empty for now
  this.document = null;
  this.slides = [];
  this.stylesheets = [];
  this.template = null;
  this.jquery = null;
}

Cleaver.ROOT_DIR = path.normalize(__dirname + '/../');

/**
 * Renders the document
 */
Cleaver.prototype._parseDocument = function () {
  var self = this;

  return this._loadSingleAsset(this.documentFile)
    .then(function (document) {
      self.document = document; // side-effect
      var slices = self._slice();

      for (var i = 1; i < slices.length; i++) {
        self.slides.push(md(slices[i]));
      }
    });
}

/**
 * Loads the template, default stylesheet, and any external stylesheets
 * as defined by the user.
 */
Cleaver.prototype._loadAssets = function () {
  var promises = [
    this._loadSingleAsset(this.templateFile),
    this._loadSingleAsset(this.jqueryFile),
    this._loadSingleAsset(this.stylesheetFile)
  ];

  if (this.userStylesheetFile) {
    promises.push(this._loadSingleAsset(this.userStylesheetFile));
  }

  var self = this;
  return Q.all(promises)
    .then(function (data) {
      self.template = data[0];
      self.jquery = data[1];

      for (var i = 2; i < data.length; i++) {
        self.stylesheets.push(data[i]);
      }
    })
    .fail(function (err) {
      throw err
    });
}

/**
 * Loads a single static asset. Returns a promise.
 */
Cleaver.prototype._loadSingleAsset = function (filename) {
  return Q.nfcall(fs.readFile, filename, 'utf-8');
}

/**
 * Slices the file by portion dividers
 *
 * @return {Array.<string>} The sliced document
 */
Cleaver.prototype._slice = function () {
  var cuts = this.document.split('\n--\n');
  var slices = [];

  for (var i = 0; i < cuts.length; i++) {
    slices.push(cuts[i].trim());
  }

  return slices;
}

/**
 * Renders the slideshow
 */
Cleaver.prototype._renderSlideshow = function () {
  var slideData = {
    slides: this.slides,
    title: 'Hello, world',
    controls: true,
    styles: this.stylesheets,
    jquery: this.jquery
  }

  console.log(mustache.render(this.template, slideData));
}

Cleaver.prototype.run = function () {
  var self = this;
  return Q.all([this._parseDocument(), this._loadAssets()])
    .then(self._renderSlideshow.bind(self))
    .fail(function (err) {
      throw err;
    })
    .done();
}


module.exports = Cleaver;
