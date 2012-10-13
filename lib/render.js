var fs = require('fs'),
    mustache = require('mustache'),
    md = require('node-markdown').Markdown;

exports.render = function(json, options) {
  var renders = [];
  var styles  = [];

  // push the author slide
  if (json.author) {
    json.slides.push({
      "type": "author",
      "name": json.author.name,
      "twitter": json.author.twitter,
      "url": json.author.url
    });
  }

  // load default style
  fs.readFile('styles/default.css', 'utf8', function(err, data) {
    if (err) throw err;
    styles.push(data);
  });

  // load user-defined styles
  if (options.style) {
    fs.readFile(options.style, 'utf8', function(err, data) {
      if (err) throw err;
      styles.push(data);
    });
  }

  json.slides.forEach(function(v, i) {
    fs.readFile('templates/_' + v.type + '.mustache', 'utf8', function(err, data) {
      if (err) throw err;
      if (v.type == 'text')
        v.content = md(v.content.replace(/>>/g,'</p><p>'));
      if(v.type == 'video')
        options.video_required = true;

      renders[i] = mustache.render(data, v);
    });
  });

  fs.readFile('templates/layout.mustache', 'utf8', function(err, data) {
    if (err) throw err;

    var output = mustache.render(data, { slides: renders, title: json.name, styles: styles, 
                                         controls: !(options.nocontrols), video_required: options.video_required});
    if (options.debug) {
      console.log(output);
    } else {
      if (options.output) {
        fs.writeFile(options.output, output);
      } else {
        fs.writeFile('output.html', output);
      }
    }
  });
};
