var Q  = require('q');
var fs = require('fs');
var path = require('path');
var normalizePath;


/**
 * Root directory so that asset loaders know where to look
 * @constant {string}
 */
var ROOT_DIR = path.normalize(__dirname + '/../');


/**
 * Loads a single static asset. Returns a promise.
 * @param {string} filename The name and location of the file to load
 * @return {Promise.<string>} The file contents
 */
function loadSingle(filename) {
  return Q.nfcall(fs.readFile, normalizePath(filename), 'utf-8');
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
