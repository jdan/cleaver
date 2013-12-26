var Q = require('q');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var normalizePath;


/**
 * Root directory so that asset loaders know where to look
 * @constant {string}
 */
var ROOT_DIR = path.resolve(__dirname, '..');


/**
 * Loads a single static asset from either a filename or URL. Returns a promise.
 * @param {string} source The source document to load
 * @param {!Boolean} failsafe Option to fail gracefully, without raising errors
 * @return {Promise.<string>} The file contents
 */
function loadSingle(source, failsafe) {
  var promise;

  if (source.match(/^https?:\/\//)) {
    promise = httpGetPromise(source, failsafe);
  } else {
    promise = readFilePromise(normalizePath(source), failsafe);
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
 * @param {!Boolean} failsafe Option to fail gracefully, without raising errors
 * @return {Promise}
 */
function populateSingle(filename, destination, key, failsafe) {
  return loadSingle(filename, failsafe)
    .then(function (data) {
      if (data) {
        destination.loaded[key] = data;
      }
    });
}


/**
 * Loads files from a given map and places them in that map's `loaded` field
 * @param {Object} map The map of labels to filenames
 * @param {!Boolean} external Whether or not the file is external to the project
 * @return {Promise.<Array.<Object>>} The same map with a `loaded` field populated with file contents
 */
function load(map, external) {
  var promises = [];
  var loaded = {};
  var filename;

  for (var key in map) {
    if (!map[key]) {
      continue;
    }

    filename = map[key];
    if (!external) {
      filename = path.resolve(ROOT_DIR, filename);
    }

    promises.push(loadSingle(filename)
      .then((function (_key) {
        return function (data) {
          loaded[_key] = data;
        };
      })(key)));
  }

  map.loaded = loaded;

  return Q.all(promises);
}


/**
 * Loads a theme from either a path, github path (username/repo), or URL.
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
    source = 'https://raw.github.com/' + source + '/master/';
  }

  if (!source.match(/\/$/)) {
    source += '/';
  }

  promises = [
    loadSettings(source + 'settings.json', ctx),
    populateSingle(source + 'style.css', ctx.external, 'style', true),
    populateSingle(source + 'template.mustache', ctx.templates, 'slides', true),
    populateSingle(source + 'layout.mustache', ctx.templates, 'layout', true),
    populateSingle(source + 'script.js', ctx.external, 'script', true)
  ];

  return Q.all(promises);
}


/**
 * Loads a settings file and sets appropriate options. Used to determine
 * whether or not we should completely override a style in a theme.
 * @param {string} source The source of the settings file to load
 * @param {Object} ctx The given context to set our options
 * @return {Promise}
 */
function loadSettings(source, ctx) {
  return loadSingle(source, true).then(function (data) {
    if (data) {
      data = JSON.parse(data);
      ctx.override = data.override;
    }
  });
}


/**
 * Saves contents to a specified location
 * @param {string} filename The destination
 * @param {string} contents The contents of the file
 * @return {Promise}
 */
function save(filename, contents) {
  var deferred = Q.defer();

  fs.writeFile(filename, contents, function (err, contents) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(path.resolve(filename));
    }
  });

  return deferred.promise;
}


/**
 * Promise to load a files contents
 * @param {string} filename The file to load
 * @param {!Boolean} failsafe Option to fail gracefully, without raising errors
 * @return {Promise.<string>} The file's contents
 */
function readFilePromise(filename, failsafe) {
  var deferred;

  if (!failsafe) {
    return Q.nfcall(fs.readFile, filename, 'utf-8');
  } else {
    deferred = Q.defer();

    fs.readFile(filename, 'utf-8', function (err, contents) {
      deferred.resolve(contents);
    });

    return deferred.promise;
  }
}


/**
 * Promise to perform a get request and return the result
 * @param {string} url The url to request
 * @param {!Boolean} failsafe Option to fail gracefully, without raising errors
 * @return {Promise.<string>} The body of the response
 */
function httpGetPromise(url, failsafe) {
  var deferred = Q.defer(), get;

  var cb = function (res) {
    var data = '';

    if (res.statusCode !== 200) {
      if (failsafe) {
        deferred.resolve();
      } else {
        deferred.reject(new Error(
          'The url (' + url + ') returned with status ' + res.statusCode));
      }
    }

    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end', function () {
      deferred.resolve(data);
    });
  };

  if (url.match(/^https/)) {
    get = https.get(url, cb);
  } else {
    get = http.get(url, cb);
  }

  get.on('error', function (err) {
    if (failsafe) {
      deferred.resolve();
    } else {
      deferred.reject(new Error(
        'The url (' + url + ') caused an error'));
    }
  });

  return deferred.promise;
}


/**
 * Returns the home directory of the current user
 * @return {string} The path to the current user's home directory
 */
function getUserHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}


module.exports = function (inputPath) {
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

    return path.resolve(path.dirname(inputPath), pathname);
  };

  return {
    loadSingle: loadSingle,
    populateSingle: populateSingle,
    load: load,
    loadTheme: loadTheme,
    save: save
  };
};
