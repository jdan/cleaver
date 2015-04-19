var Q = require('q');
var debug = require('debug');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var normalizePath;
var debugInited = false;


/**
 * Root directory so that asset loaders know where to look
 *
 * @constant {string}
 */
var ROOT_DIR = path.resolve(__dirname, '..');


/**
 * Loads a single static asset from either a filename or URL
 *
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
 * of a given resource map
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
      if (data) {
        /**
         * If the key points to an array in the destination map, then
         * we should also append to an array in the `loaded` section
         * of the map.
         *
         * This is useful for style resources, where `external.style` may
         * refer to a list of resources to be loaded.
         */
        if (Object.prototype.toString.call(destination[key]) === '[object Array]') {
          destination.loaded[key] = destination.loaded[key] || [];
          destination.loaded[key].push(data);
        } else {
          destination.loaded[key] = data;
        }
      }
    });
}


/**
 * Loads files from a given map and places them in that map's `loaded` field
 *
 * @param {Object} map The map of labels to filenames
 * @param {!Object} options Load options
 * @return {Promise.<Array.<Object>>} The same map with a `loaded` field
 *     populated with file contents
 */
function load(map, options) {
  var promises = [];
  var loaded = {};
  var filename;

  options = options || {};

  for (var key in map) {
    if (map.hasOwnProperty(key)) {
      if (!map[key] || map[key].length === 0) {
        continue;
      }

      filename = map[key];
      if (!options.external) {
        filename = path.resolve(ROOT_DIR, filename);
      }

      promises.push(loadSingle(filename)
        .then((function (_key) {
          return function (data) {
            loaded[_key] = data;
          };
        })(key)));
    }
  }

  map.loaded = loaded;

  return Q.all(promises);
}


/**
 * Loads a theme from either a path, github path (username/repo), or URL
 *
 * A theme consists of the following (optional) files:
 * - style.css
 * - template.mustache
 * - layout.mustache
 * - script.js
 *
 * If the source matches a URL, the function will assume the URL points to a
 * directory, in which it will look for the above files.
 *
 * Otherwise, if the source matches a path that exists, the function will look
 * in that path for the files. If the source matches the form username/repo,
 * it will assume the source to be a GitHub repository.
 *
 * @param {string} source The source to look for the theme
 * @param {Object} ctx The context to access fields such as templates and
 *     and layouts
 * @return {Promise}
 */
function loadTheme(source, ctx) {
  var promises = [];

  if (!fs.existsSync(source) && source.match(/^[\w-]+\/[\w-]+$/)) {
    source = 'https://raw.githubusercontent.com/' + source + '/master/';
  }

  if (!source.match(/\/$/)) {
    source += '/';
  }

  promises = [
    loadSettings(source + 'settings.json', ctx),
    populateSingle(source + 'style.css', ctx.external, 'style'),
    populateSingle(source + 'template.mustache', ctx.templates, 'slides'),
    populateSingle(source + 'layout.mustache', ctx.templates, 'layout'),
    populateSingle(source + 'script.js', ctx.external, 'script')
  ];

  return Q.all(promises);
}


/**
 * Loads a settings file and sets appropriate options. Used to determine
 * whether or not we should completely override a style in a theme
 *
 * @param {string} source The source of the settings file to load
 * @param {Object} ctx The given context to set our options
 * @return {Promise}
 */
function loadSettings(source, ctx) {
  return loadSingle(source).then(function (data) {
    if (data) {
      data = JSON.parse(data);
      ctx.override = data.override;
    }
  });
}


/**
 * Promise to load a files contents
 *
 * @param {string} filename The file to load
 * @return {Promise.<string>} The file's contents
 */
function readFilePromise(filename) {
  var deferred;

  deferred = Q.defer();

  fs.readFile(filename, 'utf-8', function (err, contents) {
    if (err) {
      debug(err + ' ' + filename);
      // TODO: better error handling
      deferred.reject(err);
    } else {
      debug('read ' + filename);
      deferred.resolve(contents);
    }
  });

  return deferred.promise;
}


/**
 * Promise to perform a get request and return the result
 *
 * @param {string} url The url to request
 * @return {Promise.<string>} The body of the response
 */
function httpGetPromise(url) {
  var deferred = Q.defer(), get;

  var cb = function (res) {
    var data = '';

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('err', function (err) {
      debug(err + ' ' + url);
      deferred.reject(err);
    });

    res.on('end', function () {
      if (res.statusCode !== 200) {
        debug(res.statusCode + ': ' + url);
        deferred.resolve();
      } else {
        debug('fetched ' + url);
        deferred.resolve(data);
      }
    });
  };

  if (url.match(/^https/)) {
    get = https.get(url, cb);
  } else {
    get = http.get(url, cb);
  }

  get.on('error', function (err) {
    deferred.resolve();
    debug(err + ': ' + url);
  });

  return deferred.promise;
}


/**
 * Returns the home directory of the current user
 *
 * @return {string} The path to the current user's home directory
 */
function getUserHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}


module.exports = function (inputPath, shouldDebug) {
  // We can't rely on process.env anymore, so we use a passed-in `shouldDebug`
  // variable, and manually invoke `debug.enable()`.
  // This is messy because typically debug would be called with `helper` in
  // the require line, but after that point we lose access to `.enable()`.
  if (!debugInited) {
    if (shouldDebug) {
      debug.enable('*');
    }
    debug = debug('helper');
    debugInited = true;
  }

  // TODO: I bet we can simply all this nonsense with a chdir()
  normalizePath = function (pathname) {
    if (pathname[0] === '~') {
      pathname = pathname.replace('~', getUserHome());
    }

    if (pathname[0] === '/') {
      return pathname;
    }

    if (path.resolve(pathname) === pathname) {
      return pathname;
    }

    return path.resolve(inputPath, pathname);
  };

  return {
    loadSingle: loadSingle,
    populateSingle: populateSingle,
    load: load,
    loadTheme: loadTheme
  };
};
