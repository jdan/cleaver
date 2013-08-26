var fs   = require('fs');
var Q    = require('q');
var path = require('path');
var md   = require('node-markdown').Markdown;
var yaml = require('js-yaml');
var mustache = require('mustache');

function Cleaver(options) {
  if (!options.file) throw "!! Please specify a file with the --file option";

  // filenames which will be used to read in data
  // TODO: refactor templating and static files into its own thing
  this.stylesheetFile = Cleaver.ROOT_DIR + 'styles/default.css';
  this.mainTemplateFile = Cleaver.ROOT_DIR + 'templates/layout.mustache';
  this.authorTemplateFile = Cleaver.ROOT_DIR + 'templates/_author.mustache';
  this.jqueryFile = Cleaver.ROOT_DIR + 'resources/jquery.min.js';
  this.navigationFile = Cleaver.ROOT_DIR + 'resources/navigation.js';

  // user-specified files
  this.documentFile = options.file;
  this.userStylesheetFile = options.style;

  // data, empty for now
  this.document = null;
  this.slides = [];
  this.stylesheets = [];
  this.mainTemplate = null;
  this.jquery = null;
  this.navigation = null;
  this.metadata = null;
}


/**
 * Root directory so that asset loaders know where to look
 * @constant {string}
 */
Cleaver.ROOT_DIR = path.normalize(__dirname + '/../');


/**
 * Renders the document
 */
Cleaver.prototype._parseDocument = function () {
  var self = this;

  return Q.all([
      this._loadSingleAsset(this.documentFile),
      this._loadSingleAsset(this.authorTemplateFile)
    ])
    .then(function (data) {
      self.document = data[0];
      self.authorTemplate = data[1];
      var slices = self._slice(self.document);
      self.metadata = yaml.safeLoad(slices[0]);

      for (var i = 1; i < slices.length; i++) {
        self.slides.push(md(slices[i]));
      }

      self.slides.push(self._renderAuthorSlide(self.metadata.author));
    });
}


/**
 * Loads the templates, default stylesheet, and any external stylesheets
 * as defined by the user.
 */
Cleaver.prototype._loadAssets = function () {
  var promises = [
    this._loadSingleAsset(this.mainTemplateFile),
    this._loadSingleAsset(this.jqueryFile),
    this._loadSingleAsset(this.navigationFile),
    this._loadSingleAsset(this.stylesheetFile)
  ];

  if (this.userStylesheetFile) {
    promises.push(this._loadSingleAsset(this.userStylesheetFile));
  }

  var self = this;
  return Q.all(promises)
    .then(function (data) {
      // TODO: refactor this into its own helper method?
      self.mainTemplate = data[0];
      self.jquery = data[1];
      self.navigation = data[2];

      for (var i = 3; i < data.length; i++) {
        self.stylesheets.push(data[i]);
      }
    })
    .fail(function (err) {
      throw err
    });
}


/**
 * Loads a single static asset. Returns a promise.
 * @param {string} filename The name and location of the file to load
 * @return {Promise.<string>} The file contents
 */
Cleaver.prototype._loadSingleAsset = function (filename) {
  return Q.nfcall(fs.readFile, filename, 'utf-8');
}


/**
 * Renders the slideshow
 */
Cleaver.prototype._renderSlideshow = function () {
  var slideData = {
    slides: this.slides,
    title: this.metadata.title,
    // TODO: read --nocontrols from argv
    controls: true,
    styles: this.stylesheets,
    jquery: this.jquery,
    navigation: this.navigation
  };

  // TODO: output to --output=????? (default, output.html)
  console.log(mustache.render(this.mainTemplate, slideData));
}


/**
 * Renders the author slide
 * @param {string} authorData The author field of the slideshow metadata
 * @return {string} The formatted author slide
 */
Cleaver.prototype._renderAuthorSlide = function (authorData) {
  return mustache.render(this.authorTemplate, authorData);
}


/**
 * Returns a chopped up document that's easy to parse
 * @param {string} The full document
 * @return {Array.<string>} A list of all slides
 */
Cleaver.prototype._slice = function(document) {
  var cuts = document.split('\n--\n');
  var slices = [];

  for (var i = 0; i < cuts.length; i++) {
    slices.push(cuts[i].trim());
  }

  return slices;
}


/**
 * Method to run the whole show
 */
Cleaver.prototype.run = function () {
  var self = this;
  Q.all([this._parseDocument(), this._loadAssets()])
    .then(self._renderSlideshow.bind(self))
    .fail(function (err) {
      throw err;
    })
    .done();
}


module.exports = Cleaver;
