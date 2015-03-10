var _s = require('underscore.string');
var fs = require('fs');
var Q = require('q');
var prompt = require('prompt');
var merge = require('merge');
module.exports = {
  init: function (options, shouldDoOverrides) {
    options.y = !!shouldDoOverrides;
    prompt.message = '>>';
    prompt.delimiter = ':'.green;
    console.log("This utility will walk you through creating your very own presentation file.");
    console.log("Press ^C at any time to quit.");
    getPrompt(options).then(checkForFile).then(writeToFile).catch(console.log);
  }
};

function getPrompt(options) {
  var deferred = Q.defer();
  var probableTitle = options.title || _s.capitalize(process.cwd().split('/').slice(-1)[0]);
  var titlePrompt = [{
      name: 'title',
      description: 'Presentation title',
      type: 'string',
      default: probableTitle,
      required: true
    }];

  prompt.start();
  // skip the stuff!
  if (options.y) {
    prompt.override = {
      title: probableTitle,
      input: _s.slugify(probableTitle) + '.md',
      output: 'index.html',
      style: '   '
    };
  }
  prompt.get(titlePrompt, function (err, res) {
    var title = res.title;
    if (err) { return deferred.reject(err); }
    var promptSeries = [
      {
        name: 'input',
        description: 'Input markdown file',
        type: 'string',
        default: _s.slugify(title) + '.md',
        required: true
      },
      {
        name: 'output',
        description: "Presentation output filename",
        type: 'string',
        default: 'index.html',
        required: true
      },
      {
        name: 'style',
        description: 'Presentation style. Write theme name of path/to/file.css',
        type: 'string',
        default: options.style || '',
        required: false
      }
    ];
    prompt.get(promptSeries,function (err, result) {
      if (err) {return deferred.reject(err); }
      if (result.style.match(/\.css$/)) {
        result.style = result.style || options.style;
      } else {
        result.theme = result.style || options.theme;
      }
      result = merge(options, result);
      deferred.resolve(result);
    });
  });
  return deferred.promise;
}

function checkForFile(result) {
  var deferred = Q.defer();
  var inc = result.input;
  var confirmation = {
      name: 'confirm',
      pattern: /^(y|yes|no|n)$/i,                  // Regular expression that input must be valid against.
      message: 'Y/Yes/No/N only',
      description: 'File '+inc.green+' already exist. Overwrite?'.grey,
      default: 'Yes',
      required: true
    };
  if (!fs.existsSync(process.cwd() + '/' + inc)) {
    deferred.resolve(result);
  } else {
    prompt.start();
    prompt.get(confirmation, function (err, confirmation) {
      if (confirmation.confirm.match(/(no|n)/i)) {
        deferred.reject('Aborting like right now!');
      } else {
        deferred.resolve(result);
      }
    });
  }
  return deferred.promise;
}

function writeToFile(result) {
  var presentation = _s.trim(result.input);
  var message = "author:\n  name: Your Name\n  email: you@example.com\n  twitter: @username\n  url: http:\/\/yourwebsite.com\n";
  message += ['title', 'theme', 'style', 'output', 'controls', 'progress', 'encoding',
    'template', 'layout'].filter(function (key) {
      return _s.trim(result[key]);
    }).map(function (key) {
      return key + ": " + result[key];
    }).join('\n');
  console.log('Inited empty presentation at '+ presentation.green +' containing:');
  console.log(message);
  fs.writeFile(presentation, message, function (err) {
    if (err) { return console.log('Oh no, sorry, there was an ',err.message,' error'); }
    console.log('Rise and shine! Be sure to run ' + ('cleaver watch ' + presentation).green + ' to start hacking rihgt away');
  });
}