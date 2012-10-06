var fs = require('fs'),
    mustache = require('mustache');

exports.render = function(json) {
  json.slides.forEach(function(v, i) {
    fs.readFile('templates/_' + v.type + '.mustache', 'utf8', function(err, data) {
      if (err) throw err;
      console.log(mustache.render(data, v));
    });
  });
}
