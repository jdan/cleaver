var fs = require('fs'),
    mustache = require('mustache'),
    md = require('node-markdown').Markdown;

exports.render = function(json) {
  var slides = [];
  json.slides.forEach(function(v, i) {
    fs.readFile('templates/_' + v.type + '.mustache', 'utf8', function(err, data) {
      if (err) throw err;
      if (v.type == 'text')
        v.content = md(v.content.replace(/>>/g,'</p><p>'));

      slides[i] = mustache.render(data, v);
    });
  });

  fs.readFile('templates/layout.mustache', 'utf8', function(err, data) {
    if (err) throw err;
    fs.writeFile('output.html', mustache.render(data, { slides: slides }));
  });
};
