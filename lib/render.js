var fs = require('fs'),
    mustache = require('mustache'),
    Q = require('q'),
    path = require('path'),
    md = require('node-markdown').Markdown;

function Cleaver(data, options) {
  this.data = data;
  this.options = options;

  this.styleSheets = [];
  this.renderedSlides = [];
}

Cleaver.ROOT_DIR = path.normalize(__dirname + '/../');

Cleaver.prototype.maybeLoadStyle = function (filename) {
  var deferred = Q.defer();
  var self = this;

  fs.readFile(filename, 'utf8', function (err, data) {
    if (err) deferred.reject(err);
    self.styleSheets.push(data);
    deferred.resolve('ok');
  });

  return deferred.promise
}

Cleaver.prototype.maybeRenderSlides = function () {
  var deferred = Q.defer();
  var promises = [];
  var self = this;

  for (var i = 0, slide; slide = self.data.slides[i]; i++) {
    promises.push(this.maybeRenderSlide(slide));
  }

  return Q.all(promises)
    .then(function (renderedSlides) {
      self.renderedSlides = renderedSlides
    });
}

Cleaver.prototype.maybeRenderSlide = function (slideData) {
  var deferred = Q.defer();

  fs.readFile(Cleaver.ROOT_DIR + 'templates/_' + slideData.type + '.mustache', 'utf8', function (err, template) {
    if (err) deferred.reject(err);
    if (slideData.type == 'text') {
      // replace >> with </p><p>
      // jank.
      slideData.content = md(slideData.content.replace(/>>/g, '</p><p>'));
    }

    deferred.resolve(mustache.render(template, slideData));
  });

  return deferred.promise;
}

Cleaver.prototype.maybeRenderLayout = function () {
  var deferred = Q.defer();
  var self = this;

  fs.readFile(Cleaver.ROOT_DIR + 'templates/layout.mustache', 'utf8', function(err, template) {
    if (err) deferred.reject(err);

    var output = mustache.render(template, {
      slides: self.renderedSlides,
      title: self.data.name,
      styles: self.styleSheets,
      controls: !(self.options.nocontrols)
    });

    if (self.options.debug) {
      console.log(output);
      deferred.resolve('debug');
    } else {
      if (self.options.output) {
        fs.writeFile(self.options.output, output, deferred.makeNodeResolver());
      } else {
        fs.writeFile('output.html', output, deferred.makeNodeResolver());
      }
    }
  });

  return deferred.promise;
}

Cleaver.prototype.run = function () {
  var self = this;

  return self.maybeLoadStyle(Cleaver.ROOT_DIR + 'styles/default.css')
    .then(function () {
      if (self.options.style) return self.maybeLoadStyle(self.options.style);
      else return Q.resolve('ok');
    })
    .then(self.maybeRenderSlides.bind(self))
    .then(self.maybeRenderLayout.bind(self))
    .done()
}

module.exports = Cleaver
