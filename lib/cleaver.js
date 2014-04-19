var Q = require('q');
var path = require('path');
var marked = require('marked');
var hljs = require('highlight.js');
var yaml = require('js-yaml');
var mustache = require('mustache');
var helper;


/**
 * Constructor accepts a document (as a string) and a path from which to
 * include external dependencies (stylesheets, scripts, etc)
 *
 * @param {string} document The input document
 * @param {!string} includePath Optional resource path (default: '.')
 * @param {!Boolean} cache cache http response content
 * @constructor
 */
function Cleaver(document, includePath, cache) {
  this.document = document.toString();
  this.path = path.resolve(includePath || '.');
  this.cache = !!cache;

  helper = require('./helper')(this.path);

  this.templates = {
    layout: 'templates/layout.mustache',
    author: 'templates/author.mustache',
    slides: 'templates/default.mustache'
  };

  this.resources = {
    style: 'resources/default.css',
    githubStyle: 'resources/github.css',
    script: 'resources/script.js'
  };

  this.external = {
    style: []
  };

  this.metadata = null;
  this.slides = [];
  this.override = false;

  marked.setOptions({
    gfm: true,
    highlight: function (code, lang) {
      return (lang) ? hljs.highlight(lang, code).value : code;
    }
  });
}


/**
 * Loads the document and required templates.
 *
 * @return {Promise}
 */
Cleaver.prototype.loadDocument = function () {
  return Q.all([
    helper.load(this.external, { external: true }),
    helper.load(this.templates)
  ]);
};


/**
 * Parses the metadata and renders the slides.
 *
 * @return {Promise}
 */
Cleaver.prototype.renderSlides = function () {
  var slices = this.slice(this.document);
  var i;

  this.metadata = yaml.safeLoad(slices[0].content) || {};

  for (i = 1; i < slices.length; i++) {
    this.slides.push({
      id: i,
      hidden: i !== 1,  // first slide is visible
      classList: slices[i].classList,
      content: this.renderSlide(slices[i].content)
    });
  }

  // insert an author slide (if necessary) at the end
  if (this.metadata.author) {
    if (this.metadata.author.twitter &&
        !this.metadata.author.twitter.match(/^@/)) {
      this.metadata.author.twitter = '@' + this.metadata.author.twitter;
    }

    this.slides.push({
      id: i,
      hidden: true,
      content: this.renderAuthorSlide(this.metadata.author)
    });
  }

  return Q.resolve(true);
};


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
    promises.push(helper.populateSingle(this.metadata.style,
      this.external, 'style', false, this.cache));
  }

  // maybe load an external template
  if (this.metadata.template) {
    promises.push(helper.populateSingle(this.metadata.template,
      this.templates, 'slides', false, this.cache));
  }

  // maybe load an external layout
  if (this.metadata.layout) {
    promises.push(helper.populateSingle(this.metadata.layout, this.templates,
      'layout', false, this.cache));
  }

  return Q.all(promises);
};


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
};


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
};


/**
 * Renders the slideshow.
 *
 * @return {Promise}
 */
Cleaver.prototype.renderSlideshow = function () {
  var putControls = this.metadata.controls || (this.metadata.controls === undefined);
  var putProgress = this.metadata.progress || (this.metadata.progress === undefined);
  var style, script;

  // Render the slides in a template (maybe as specified by the user)
  var slideshow = mustache.render(this.templates.loaded.slides, {
    slides: this.slides,
    controls: putControls,
    progress: putProgress
  });

  // TODO: handle defaults gracefully
  var title = this.metadata.title || 'Untitled';
  var encoding = this.metadata.encoding || 'utf-8';

  if (this.override && this.external.loaded.style) {
    style = this.external.loaded.style && this.external.loaded.style.join('\n');
  } else {
    style = [
      this.resources.loaded.style,
      this.resources.loaded.githubStyle,
      // External styles are represented with an array
      this.external.loaded.style && this.external.loaded.style.join('\n')
    ].join('\n');
  }

  if (this.override && this.external.loaded.script) {
    script = this.external.loaded.script;
  } else {
    script = [
      this.resources.loaded.script,
      this.external.loaded.script
    ].join('\n');
  }

  var layoutData = {
    slideshow: slideshow,
    title: title,
    encoding: encoding,
    style: style,
    author: this.metadata.author,
    script: script,
    metadata: this.metadata
  };
  /* Return the rendered slideshow */
  return mustache.render(this.templates.loaded.layout, layoutData);
};


/**
 * Renders a slide.
 *
 * @param {string} content Markdown content to be rendered as a slide
 * @return {string} The formatted slide
 */
Cleaver.prototype.renderSlide = function (content) {
  return marked(content);
};


/**
 * Renders the author slide.
 *
 * @param {string} content The author field of the slideshow metadata
 * @return {string} The formatted author slide
 */
Cleaver.prototype.renderAuthorSlide = function (content) {
  return mustache.render(this.templates.loaded.author, content);
};


/**
 * Returns a chopped up document that's easy to parse.
 *
 * @param {string} The full document
 * @return {Array.<string>} A list of all slides
 */
Cleaver.prototype.slice = function(document) {
  var cuts = document.split(/\n(?=\-\-)/);
  var slices = [];
  var nlIndex;

  for (var i = 0; i < cuts.length; i++) {
    /**
     * The first slide does not get the following treatment, so we just
     * add it as content.
     *
     * Otherwise, we slice off the `--` at the beginning.
     */
    if (!cuts[i].match(/^--/)) {
      slices.push({
        content: cuts[i].trim()
      });

      continue;
    } else {
      /* If we leave out metadata, add an empty slide at the beginning */
      if (i === 0) {
        slices.push({ content: '' });
      }

      cuts[i] = cuts[i].slice(2);
    }

    /**
     * Slices at this point will contain class names, followed by several
     * newlines
     */
    nlIndex = cuts[i].indexOf('\n');
    if (nlIndex === -1) {
      // Just to be safe...
      nlIndex = 0;
    }

    /* Push the classList and markdown content */
    slices.push({
      classList: cuts[i].slice(0, nlIndex),
      content: cuts[i].slice(nlIndex).trim()
    });
  }

  return slices;
};


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
    .then(self.populateThemeResources.bind(self))
    .then(self.populateResources.bind(self));

  // Load static assets
  var assetChain = this.loadStaticAssets();

  return Q.all([documentChain, assetChain])
    .then(self.renderSlideshow.bind(self));
};


module.exports = Cleaver;
