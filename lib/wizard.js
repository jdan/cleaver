/* global program */
var fs = require('fs');
var Q = require('q');
var exec = require('child_process').exec;
var prompt = require('prompt');
module.exports = {
  init: function (program) {
    global.program = program;
    prompt.message = '>>';
    prompt.delimiter = ':'.green;
    console.log("This utility will walk you through creating your very own presentation file.");
    console.log("Press ^C at any time to quit.");
    getUsername().then(getPrompt).then(checkForFile).then(writeToFile).catch(console.log);
  }
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getUsername() {
  var deferred = Q.defer();
  try {
    exec('git config -l | grep user.name', function (err, str) {
      // we get back 'user.name=%username%'
      var args = str.replace(/\n/, '').split('=');
      deferred.resolve(args[1]);
    });
  } catch (e) {
    // fallback to getting username based on home directory name
    var path = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    deferred.resolve(path.split(/\/\\/).slice(-1)[0]);
  }
  return deferred.promise;
}

function getPrompt(username) {
  var deferred = Q.defer();
  var probableTitle = (program.args[0].constructor.name !== 'Command') ? program.args[0] : process.cwd().split('/').slice(-1)[0];
  var promptSeries = [
    {
      name: 'input',
      description: 'Input markdown file',
      type: 'string',
      default: probableTitle + '.md',
      required: true
    },
    {
      name: 'title',
      description: 'Presentation title',
      type: 'string',
      default: capitalize(probableTitle),
      required: true
    },
    {
      name: 'author.name',
      description: 'Your name',
      type: 'string',
      default: username,
      required: false
    },
    {
      name: 'author.twitter',
      description: 'Your twitter handler',
      type: 'string',
      default: username,
      required: false
    },
    {
      name: 'output',
      description: 'Presentation output filename',
      type: 'string',
      default: probableTitle + '.html',
      required: true
    }
  ];
  prompt.start();
  prompt.get(promptSeries, function (err, result) {
    if (err) {return deferred.reject(err); }
    deferred.resolve(result);
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
  console.log('writeFile result ', result);
  var presentation = result.input;
  var message = "title: {title}\nauthor:\n  name: {name}\n  twitter: {twitter}\noutput: {output}"
    .replace('{title}', result.title)
    .replace('{name}', result['author.name'])
    .replace('{twitter}', result['author.twitter'])
    .replace('{output}', result.output);
  fs.writeFile(presentation, message, function (err) {
    if (err) { return console.log('Oh no, sorry, there was an ',err.message,' error'); }
    console.log('Rise and shine! Be sure to run cleaver watch ', presentation,' to start hacking rihgt away');
  });
  console.log('Inited empty presentation at '+ presentation.green +' containing:');
  console.log(message);
}