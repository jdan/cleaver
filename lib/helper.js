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
 * Loads files from a given map and places them in that map's `loaded` field
 * @param {Object} map The map of labels to filenames
 * @param {?string} opt_prefix The prefix to search in for files
 * @return {Promise.<Array.<Object>>} The same map with a `loaded` field populated with file contents
 */
function load(map, opt_prefix) {
  var promises = [];
  map.loaded = {};

  for (var key in map) {
    if (key == 'loaded') continue;

    var filename;
    if (opt_prefix) filename = ROOT_DIR + opt_prefix + '/' + map[key];
    else            filename = ROOT_DIR + opt_prefix + map[key];

    promises.push(loadSingle(filename)
      .then((function (_key) {
        return function (data) {
          map.loaded[_key] = data;
        }
      })(key)));
  }

  return Q.all(promises);
}

exports.loadSingle = loadSingle;
exports.load = load;
