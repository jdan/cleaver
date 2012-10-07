var fs = require('fs'),
    mustache = require('mustache'),
    md = require('node-markdown').Markdown;

exports.render = function(json, options) {
  var renders = [];

  if (json.author) {
    json.slides.push({
      "type": "author",
      "name": json.author.name,
      "twitter": json.author.twitter,
      "url": json.author.url
    });
  }

  json.slides.forEach(function(v, i) {
    fs.readFile('templates/_' + v.type + '.mustache', 'utf8', function(err, data) {
      if (err) throw err;
      if (v.type == 'text')
        v.content = md(v.content.replace(/>>/g,'</p><p>'));

      renders[i] = mustache.render(data, v);
    });
  });

  fs.readFile('templates/layout.mustache', 'utf8', function(err, data) {
    if (err) throw err;
    var output = mustache.render(data, { slides: renders, title: json.name });
    if (options.debug) {
      console.log(output);
    } else {
      fs.writeFile('output.html', output);
    }
  });
};
