var fs   = require('fs');
var Q    = require('q');
var path = require('path');
var md   = require('node-markdown').Markdown;
var yaml = require('js-yaml');
var mustache = require('mustache');
var helper = require('./helper');

function Cleaver(options) {
  // TODO: move options into the document metadata
  if (!options.file) throw "!! Please specify a file with the --file option";

  // TODO: make these constants?
  this.templates = {
    main: 'layout.mustache',
    author: 'author.mustache'
  };

  this.resources = {
    style: 'default.css',
    jquery: 'jquery.min.js',
    navigation: 'navigation.js'
  };

  this.external = {
    document: options.file,
    style: options.style
  };

  this.metadata = null;
  this.document = null;
  this.slides = [];
  this.controls = options.controls !== undefined

  if (options.style) this.external.style = options.style;
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
      helper.load(this.templates, 'templates'),
      helper.load(this.external)
    ])
    .then(function (data) {
      var slices = self._slice(self.external.loaded.document);
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
 * @return {Promise.<Array.<Object>>}
 */
Cleaver.prototype._loadAssets = function () {
  return Q.all([
    helper.load(this.resources, 'resources')
  ]);
}


/**
 * Renders the slideshow
 */
Cleaver.prototype._renderSlideshow = function () {
  var slideData = {
    slides: this.slides,
    title: this.metadata.title,
    controls: this.controls,
    style: this.resources.loaded.style,
    externalStyle: this.external.loaded.style,
    jquery: this.resources.loaded.jquery,
    navigation: this.resources.loaded.navigation
  };

  // TODO: output to --output=????? (default, output.html)
  console.log(mustache.render(this.templates.loaded.main, slideData));
}


/**
 * Renders the author slide
 * @param {string} authorData The author field of the slideshow metadata
 * @return {string} The formatted author slide
 */
Cleaver.prototype._renderAuthorSlide = function (authorData) {
  return mustache.render(this.templates.loaded.author, authorData);
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
