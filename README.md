# Cleaver

30-second Slideshows for Hackers. http://jdan.github.io/cleaver/

[![Travis Build](https://travis-ci.org/jdan/cleaver.png)](https://travis-ci.org/jdan/cleaver)
[![NPM version](https://badge.fury.io/js/cleaver.png)](http://badge.fury.io/js/cleaver)

## Intro

Cleaver turns this:

    title: Basic Example
    author:
      name: Jordan Scales
      twitter: jdan
      url: http://jordanscales.com
    output: basic.html
    controls: true

    --

    # Cleaver 101
    ## A first look at quick HTML presentations

    --

    ### A textual example

    Content can be written in **Markdown!** New lines no longer need two angle brackets.

    This will be in a separate paragraph

    --

    ### A list of things

    * Item 1
    * Item B
    * Item gamma

    No need for multiple templates!

Into this:

![output](https://i.cloudup.com/cIssKFjcB6.gif)

## Quick Start

Get it [on NPM](https://npmjs.org/package/cleaver):

```
npm install -g cleaver
```

And run it like so:

```bash
cleaver path/to/something.md
```

You can also watch for changes on a file and automatically recompile with:

```bash
cleaver watch path/to/something-changing.md

# Watching for changes on presentation.md. Ctrl-C to abort.
# Rebuilding: Thu Nov 07 2013 00:15:03 GMT-0500 (EST)
# Rebuilding: Thu Nov 07 2013 00:15:21 GMT-0500 (EST)
# Rebuilding: Thu Nov 07 2013 00:16:01 GMT-0500 (EST)
# Rebuilding: Thu Nov 07 2013 00:16:09 GMT-0500 (EST)
```

## More Info

**Cleaver** is a one-stop shop for generating HTML presentations in
record time. Using some spiced up markdown, you can produce
good-looking, interactive presentations with a just a few lines of text.

Slides are written in [Markdown](http://daringfireball.net/projects/markdown/),
and are separated by two dashes (`--`).

## Options

    title: Basic Example
    author:
      name: Jordan Scales
      twitter: jdan
      url: http://jordanscales.com
    style: basic-style.css
    output: basic.html

Cleaver supports several basic options that allow you to further customize the
look and feel of your presentation, including author info, stylesheets, and
custom templates.

See the documentation on
[options](https://github.com/jdan/cleaver/blob/master/docs/options.md) for more
information.

## Themes

    title: Theme Example
    output: theme.html
    theme: jdan/cleaver-retro

Cleaver has substantial theme support to give you more fine-grained control
over your presentation, similar to [options](#options). Instead of manually
specifying a stylesheet, template, layout, and others, you can specify a single
theme containing each of these assets. More specifically, a theme may contain:

* style.css - styles for your presentation
* template.mustache - a template used to render the slides in your presentation
* layout.mustache - a template used to render the entire document of your
presentation
* script.js - javascript to be included in your slideshow

A theme does not need to contain all of these files, only the ones present
will be loaded into your slideshow.

### Examples

* [jdan/cleaver-retro](http://github.com/jdan/cleaver-retro)

![cleaver-retro](https://i.cloudup.com/HLtcPJWJJl-1200x1200.png)

* [matmuchrapna/cleaver-ribbon](http://github.com/matmuchrapna/cleaver-ribbon)
– Mozilla's [shower](http://shwr.me/) implemented in cleaver.

![cleaver-ribbon](https://i.cloudup.com/GECEx5BmxI-1200x1200.png)

* [sudodoki/reveal-cleaver-theme](http://github.com/sudodoki/reveal-cleaver-theme)
– cleaver meets [reveal.js](http://lab.hakim.se/reveal-js/#/).

![reveal-cleaver-theme](https://i.cloudup.com/wlzisDLe32-1200x1200.png)

### Specifying Themes

Themes may be specified by one of the following options:

* An absolute or relative path to a directory
* A URL to a directory
* A github repository in the form of *username/reponame*

### Overriding Themes

By default, *style.css* and *script.js* will be **appended** to the default
stylesheets and javascripts included in cleaver presentations. If you wish to
completely override these defaults, you must include another file in your
theme - options.json - corresponding to the following:

```json
{
  "override": true
}
```

Template files will automatically override the default templates.

### More Info

For more information on themes, check out
[our documentation](https://github.com/jdan/cleaver/blob/master/docs/themes.md).

## Markup

Cleaver slides are rendered using the following template:

```handlebars
{{#slides}}
  <div class="slide{{#hidden}} hidden{{/hidden}}" id="slide-{{id}}">
    <section class="slide-content">{{{content}}}</section>
  </div>
{{/slides}}
```

And produce the following markup:

```
+-------------------------------+
| #slide-N                      |
|     +-------------------+     |
|     | .slide-content    |     |
|     |                   |     |
|     |                   |     |
|     |                   |     |
|     |                   |     |
|     +-------------------+     |
|                               |
|                               |
| (navigation)                  |
+-------------------------------+
```

**#slide-N** (for example, *#slide-3*) allows you to identify a particular
full-bleed slide by its position in the slideshow. It extends to the bounds of
the page.

**.slide-content** is a smaller window which holds the actual content of the
slide.

## Slide Types

### Title slide

    # Cleaver 101
    ## A first look at quick HTML presentations

**h1** and **h2** elements (prefaced with *#* and *##* respectively), will
automatically include padding to render a title slide.

### Other slides

    ### A list of things

    * Item 1
    * Item B
    * Item gamma

    No need for multiple templates!

Since slides are written in [Markdown](http://daringfireball.net/projects/markdown/),
you can include things like lists, images, and arbitrary HTML.

**h3** tags (prefaced `###`) are automatically given a bottom border to
represent a slide title.

## Navigation

Cleaver supports keyboard navigation for switching between slides.

To navigate the slideshow:

* **forward**: K, L, ENTER, UP, RIGHT, PgDn, and Space
* **reverse**: H, J, LEFT, DOWN, PgUp, and Backspace

Alternatively, click the control buttons located below the presentation.

## Contributing

* Fork it
* Clone it
* Install dependencies (`npm install`)
* Checkout a release branch (`git checkout -b feature/cool-wordart`)
* Make changes, commit, and push (`npm test` and make sure it passes)
* Open a pull request!

With &lt;3,<br/>[@jdan](http://jordanscales.com)

--

[MIT Licensed](https://github.com/jdan/cleaver/blob/master/LICENSE)
