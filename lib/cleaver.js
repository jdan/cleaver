var fs   = require('fs');
var Q    = require('q');
var path = require('path');
var md   = require('node-markdown').Markdown;
var yaml = require('js-yaml');
var mustache = require('mustache');
var helper = require('./helper');

function Cleaver(file) {
  this.file = file

  if (!file) throw "!! Please specify a file to parse";

  var CURRENT_PATH = this._getCurrentPath();

  // TODO: make these constants?
  this.templates = {
    layout: 'layout.mustache',
    author: 'author.mustache',
    agenda: 'agenda.mustache',
    slides: 'default.mustache'
  };

  this.resources = {
    style: 'default.css',
    navigation: 'navigation.js'
  };

  this.external = {
    document: file
  };

  this.metadata = null;
  this.slides = [];
}


/**
 * Loads the document and required templates.
 *
 * @return {Promise}
 */
Cleaver.prototype._loadDocument = function () {
  var self = this;

  return Q.all([
      helper.load(this.external),
      helper.load(this.templates, 'templates')
    ])
}


/**
 * Parses the metadata and renders the slides.
 *
 * @return {Promise}
 */
Cleaver.prototype._renderSlides = function () {
  var self = this;
  var slices = this._slice(self.external.loaded.document);
  this.metadata = yaml.safeLoad(slices[0]);

  for (var i = 1; i < slices.length; i++)
    this.slides.push(md(slices[i]));

  // insert an author slide (if necessary) at the end
  if (this.metadata.author)
    this.slides.push(this._renderAuthorSlide(this.metadata.author));

  // insert an agenda slide (if necessary) as our second slide
  if (this.metadata.agenda)
    this.slides.splice(1, 0, this._renderAgendaSlide(slices));

  return Q.resolve(true);
}


/**
 * Get file current path by slicing last element of markdown path
 *
 * @return {string} markdown file relative path
 */
Cleaver.prototype._getCurrentPath = function () {
  return this.file.split('/').slice(0, -1).join('/');
}


/**
 * Set file relative path by adding markdown file path
 *
 * @param {string} fileName The name of extra content file
 * @return {string} file relative path
 */
Cleaver.prototype._setFullPath = function (fileName) {
  var notUndefined = function(v) { return v; };
  return [this.CURRENT_PATH, fileName].filter(notUndefined).join('/');
}


/**
 * Populates `slides` and some extra loaded content, based on the metadata
 * listed in the document.
 *
 * @return {Promise}
 */
Cleaver.prototype._populateResources = function () {
  var promises = [];

  // maybe load an external stylesheet
  if (this.metadata.style)
    promises.push(helper.populateSingle(this._setFullPath(this.metadata.style), this.external, 'style'));

  // maybe load an external template
  if (this.metadata.template)
    promises.push(helper.populateSingle(this._setFullPath(this.metadata.template), this.templates, 'slides'));

  // maybe load an external layout
  if (this.metadata.layout)
    promises.push(helper.populateSingle(this._setFullPath(this.metadata.layout), this.templates, 'layout'));

  return Q.all(promises);
}


/**
 * Loads the templates, default stylesheet, and any external stylesheets
 * as defined by the user.
 *
 * @return {Promise.<Array.<Object>>}
 */
Cleaver.prototype._loadStaticAssets = function () {
  return Q.all([
    helper.load(this.resources, 'resources')
  ]);
}


/**
 * Renders the slideshow.
 *
 * @return {Promise}
 */
Cleaver.prototype._renderSlideshow = function () {
  var putControls = this.metadata.controls || (this.metadata.controls === undefined);
  var putProgress = this.metadata.progress || (this.metadata.progress === undefined);

  // Render the slides in a template (maybe as specified by the user)
  var slideshow = mustache.render(this.templates.loaded.slides, {
    slides: this.slides,
    controls: putControls,
    progress: putProgress,
    // TODO: uglify navigation.js?
    navigation: this.resources.loaded.navigation
  });

  // TODO: handle defaults gracefully
  var title = this.metadata.title || 'Untitled';
  var encoding = this.metadata.encoding || 'utf-8';

  var layoutData = {
    slideshow: slideshow,
    title: title,
    encoding: encoding,
    style: this.resources.loaded.style,
    externalStyle: this.external.loaded.style
  };

  // Render the main layout
  var outputLocation = this.metadata.output || path.basename(this.file, '.md') + '-cleaver.html';
  return helper.save(outputLocation, mustache.render(this.templates.loaded.layout, layoutData));
}


/**
 * Renders the author slide.
 *
 * @param {string} authorData The author field of the slideshow metadata
 * @return {string} The formatted author slide
 */
Cleaver.prototype._renderAuthorSlide = function (authorData) {
  return mustache.render(this.templates.loaded.author, authorData);
}

/*
 * Renders the agenda slide.
 *
 * @param {string} slices The set of slices that had been loaded from the input file
 * @return {string} The formatted agenda slide
 */
Cleaver.prototype._renderAgendaSlide = function (slices) {
  var titles = [];
  var firstLine, lastTitle, matches;

  for (var i = 1; i < slices.length; i++) {
    firstLine = slices[i].split(/(\n|\r)+/)[0];
    matches = /^(#{3,})\s+(.+)$/.exec(firstLine);

    // Only index non-title slides (begins with 3 ###)
    if (!matches) continue;

    if (lastTitle != matches[2]) {
      lastTitle = matches[2];
      titles.push(lastTitle);
    }
  }

  return mustache.render(this.templates.loaded.agenda, titles);
}

/**
 * Returns a chopped up document that's easy to parse.
 *
 * @param {string} The full document
 * @return {Array.<string>} A list of all slides
 */
Cleaver.prototype._slice = function(document) {
  var cuts = document.split(/\r?\n--\r?\n/);
  var slices = [];

  for (var i = 0; i < cuts.length; i++) {
    slices.push(cuts[i].trim());
  }

  return slices;
}


/**
 * Method to run the whole show.
 *
 * @return {Promise}
 */
Cleaver.prototype.run = function () {
  var self = this;

  // Load document -> Parse Metadata / Render Slides -> Populate Resources
  var documentChain = this._loadDocument()
    .then(self._renderSlides.bind(self))
    .then(self._populateResources.bind(self));

  // Load static assets
  var assetChain = this._loadStaticAssets();

  return Q.all([documentChain, assetChain])
    .then(self._renderSlideshow.bind(self))
    .fail(function (err) {
      throw err;
    })
    .done();
}

/* exports */
module.exports = Cleaver;
