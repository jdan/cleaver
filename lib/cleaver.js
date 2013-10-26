var fs = require('fs');
var Q = require('q');
var path = require('path');
var marked = require('marked');
var hljs = require('highlight.js');
var yaml = require('js-yaml');
var mustache = require('mustache');
var helper;

function Cleaver(file) {
  if (!file) throw "!! Please specify a file to parse";
  this.file = path.normalize(process.cwd() + '/' + file);

  helper = require('./helper')(this.file);

  // TODO: make these constants?
  this.templates = {
    layout: 'templates/layout.mustache',
    author: 'templates/author.mustache',
    agenda: 'templates/agenda.mustache',
    slides: 'templates/default.mustache'
  };

  this.resources = {
    style: 'resources/default.css',
    githubStyle: 'resources/github.css',
    script: 'resources/script.js'
  };

  this.external = {
    document: this.file
  };

  this.metadata = null;
  this.slides = [];

  marked.setOptions({
    gfm: true,
    highlight: function (code) {
      return hljs.highlightAuto(code).value;
    }
  });
}


/**
 * Loads the document and required templates.
 *
 * @return {Promise}
 */
Cleaver.prototype.loadDocument = function () {
  var self = this;

  return Q.all([
      helper.load(this.external, true),
      helper.load(this.templates)
    ]);
}


/**
 * Parses the metadata and renders the slides.
 *
 * @return {Promise}
 */
Cleaver.prototype.renderSlides = function () {
  var self = this;
  var slices = this.slice(self.external.loaded.document);
  this.metadata = yaml.safeLoad(slices[0]) || {};

  for (var i = 1; i < slices.length; i++)
    this.slides.push(this.renderSlide(slices[i]));

  // insert an author slide (if necessary) at the end
  if (this.metadata.author) {
    if (this.metadata.author.twitter &&
        !this.metadata.author.twitter.match(/^@/)) {
      this.metadata.author.twitter = '@' + this.metadata.author.twitter;
    }
    this.slides.push(this.renderAuthorSlide(this.metadata.author));
  }

  // insert an agenda slide (if necessary) as our second slide
  if (this.metadata.agenda)
    this.slides.splice(1, 0, this.renderAgendaSlide(slices));

  return Q.resolve(true);
}


/**
 * Populates `slides` and some extra loaded content, based on the metadata
 * listed in the document.
 *
 * @return {Promise}
 */
Cleaver.prototype.populateResources = function () {
  var promises = [];

  // maybe load an external stylesheet
  if (this.metadata.style) {
    promises.push(helper.populateSingle(this.metadata.style, this.external, 'style'));
  }

  // maybe load an external template
  if (this.metadata.template) {
    promises.push(helper.populateSingle(this.metadata.template, this.templates, 'slides'));
  }

  // maybe load an external layout
  if (this.metadata.layout) {
    promises.push(helper.populateSingle(this.metadata.layout, this.templates, 'layout'));
  }

  return Q.all(promises);
}


/**
 * Populates a given theme's resources. Occurs _after_ populateResources.
 *
 * @return {Promise}
 */
Cleaver.prototype.populateThemeResources = function () {
  // maybe load a theme
  if (this.metadata.theme) {
    return helper.loadTheme(this.metadata.theme, this);
  }
}


/**
 * Loads the templates, default stylesheet, and any external stylesheets
 * as defined by the user.
 *
 * @return {Promise.<Array.<Object>>}
 */
Cleaver.prototype.loadStaticAssets = function () {
  return Q.all([
    helper.load(this.resources)
  ]);
}


/**
 * Renders the slideshow.
 *
 * @return {Promise}
 */
Cleaver.prototype.renderSlideshow = function () {
  var putControls = this.metadata.controls || (this.metadata.controls === undefined);
  var putProgress = this.metadata.progress || (this.metadata.progress === undefined);

  // Render the slides in a template (maybe as specified by the user)
  var slideshow = mustache.render(this.templates.loaded.slides, {
    slides: this.slides,
    controls: putControls,
    progress: putProgress
  });

  // TODO: handle defaults gracefully
  var title = this.metadata.title || 'Untitled';
  var encoding = this.metadata.encoding || 'utf-8';
  
  // styles from custom theme should not be mixed with default styles
  var style = !this.external.loaded.style ?
              [ this.resources.loaded.style, this.resources.loaded.githubStyle]
              : [ this.external.loaded.style ];
  style = style.join('\n');

  // the same story with JavaScript
  var script = !this.external.loaded.script ? this.resources.loaded.script : this.external.loaded.script;

  var author = this.metadata.author;
  var custom = this.metadata.custom;

  var layoutData = {
    slideshow: slideshow,
    title: title,
    encoding: encoding,
    style: style,
    author: author,
    custom: custom,
    script: script
  };

  // Render the main layout
  var outputLocation = this.metadata.output || path.basename(this.file, '.md') + '-cleaver.html';
  return helper.save(outputLocation, mustache.render(this.templates.loaded.layout, layoutData));
}


/**
 * Renders a slide.
 *
 * @param {string} content Markdown content to be rendered as a slide
 * @return {string} The formatted slide
 */
Cleaver.prototype.renderSlide = function (content) {
  return marked(content);
}


/**
 * Renders the author slide.
 *
 * @param {string} content The author field of the slideshow metadata
 * @return {string} The formatted author slide
 */
Cleaver.prototype.renderAuthorSlide = function (content) {
  return mustache.render(this.templates.loaded.author, content);
}


/**
 * Renders the agenda slide.
 *
 * @param {string} slices The set of slices that had been loaded from the input file
 * @return {string} The formatted agenda slide
 */
Cleaver.prototype.renderAgendaSlide = function (slices) {
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
Cleaver.prototype.slice = function(document) {
  var cuts = document.split(/\r?\n--\r?\n/);
  var slices = [];

  for (var i = 0; i < cuts.length; i++) {

    /**
     * EDGE CASE
     * If the slideshow begins with `--`, that is, the metadata is empty and
     * the user did *not* include a blank line at the top, we will insert an
     * empty slide at the beginning (to represent empty metadata), followed
     * by the first slice (with the -- chopped off).
     */
    if (i == 0 && cuts[i].match(/^--/)) {
      slices.push("");
      cuts[i] = cuts[i].slice(2);
    }

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
  var documentChain = this.loadDocument()
    .then(self.renderSlides.bind(self))
    .then(self.populateResources.bind(self))
    .then(self.populateThemeResources.bind(self));

  // Load static assets
  var assetChain = this.loadStaticAssets();

  return Q.all([documentChain, assetChain])
    .then(self.renderSlideshow.bind(self))
    .fail(function (err) {
      console.log('!!', err.message);
    });
}


module.exports = Cleaver;
