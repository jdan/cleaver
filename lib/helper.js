var Q  = require('q');
var fs = require('fs');
var path = require('path');


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
  return Q.nfcall(fs.readFile, filename, 'utf-8');
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
 * @param {?string} opt_prefix The prefix to search in for files
 * @return {Promise.<Array.<Object>>} The same map with a `loaded` field populated with file contents
 */
function load(map, opt_prefix) {
  var promises = [];
  var loaded = {};

  for (var key in map) {
    if (!map[key]) continue;
    var filename = opt_prefix ? ROOT_DIR + opt_prefix + '/' + map[key] : map[key];

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

/* exports */
exports.loadSingle = loadSingle;
exports.populateSingle = populateSingle;
exports.load = load;
exports.save = save;
