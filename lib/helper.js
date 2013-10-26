var Q = require('q');
var http = require('http');
var fs = require('fs');
var path = require('path');
var normalizePath;


/**
 * Root directory so that asset loaders know where to look
 * @constant {string}
 */
var ROOT_DIR = path.normalize(__dirname + '/../');


/**
 * Loads a single static asset from either a filename or URL. Returns a promise.
 * @param {string} source The source document to load
 * @return {Promise.<string>} The file contents
 */
function loadSingle(source) {
  var promise;

  if (source.match(/^https?:\/\//)) {
    promise = httpGetPromise(source);
  } else {
    promise = readFilePromise(normalizePath(source));
  }

  return promise;
}


/**
 * Loads a single asset and sets the returned data to the `loaded` subobject
 * of a given resource map.
 *
 * Usage: helper.populateSingle(this.metadata.template, this.templates, 'slides')
 *        helper.populateSingle(this.metadata.layout, this.templates, 'layout')
 *
 * @param {string} filename The name and location of the file to load
 * @param {Object} destination The destination map to store the loaded data
 * @param {string} key The key to use for storing the loaded data in destination
 * @return {Promise}
 */
function populateSingle(filename, destination, key) {
  return loadSingle(filename)
    .then(function (data) {
      destination.loaded[key] = data;
    });
}


/**
 * Loads files from a given map and places them in that map's `loaded` field
 * @param {Object} map The map of labels to filenames
 * @return {Promise.<Array.<Object>>} The same map with a `loaded` field populated with file contents
 */
function load(map) {
  var promises = [];
  var loaded = {};

  for (var key in map) {
    if (!map[key]) continue;
    var filename = ROOT_DIR + '/' + map[key];

    promises.push(loadSingle(filename)
      .then((function (_key) {
        return function (data) {
          loaded[_key] = data;
        }
      })(key)));
  }

  map.loaded = loaded;

  return Q.all(promises);
}


/**
 * Saves contents to a specified location
 * @param {string} filename The destination
 * @param {string} contents The contents of the file
 * @return {Promise}
 */
function save(filename, contents) {
  return Q.nfcall(fs.writeFile, filename, contents);
}


/**
 * Promise to load a files contents
 * @param {string} filename The file to load
 * @return {Promise.<string>} The file's contents
 */
function readFilePromise(filename) {
  return Q.nfcall(fs.readFile, filename, 'utf-8');
}


/**
 * Promise to perform a get request and return the result
 * @param {string} url The url to request
 * @return {Promise.<string>} The body of the response
 */
function httpGetPromise(url) {
  var deferred = Q.defer();

  http.get(url, function (res) {
    var data = '';

    if (res.statusCode != 200) {
      deferred.reject(new Error(
          'The url (' + url + ') returned a status other than 200 "OK"'));
    }

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end', function () {
      deferred.resolve(data);
    });

  }).on('error', function (err) {
    deferred.reject(new Error(
        'The url (' + url + ') caused an error'));
  });

  return deferred.promise;
}


module.exports = function (inputPath) {
  normalizePath = function (pathname) {
    if (pathname[0] == '/') return pathname;
    return path.dirname(inputPath) + '/' + pathname;
  }

  return {
    loadSingle: loadSingle,
    populateSingle: populateSingle,
    load: load,
    save: save
  };
}
