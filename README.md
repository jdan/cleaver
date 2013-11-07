# Cleaver

30-second Slideshows for Hackers. http://jdan.github.io/cleaver/

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
cleaver path/to/something-changing.md

# Watching for changes on presentation.md. Ctrl-C to abort.
# Rebuilding: Thu Nov 07 2013 00:15:03 GMT-0500 (EST)
# Rebuilding: Thu Nov 07 2013 00:15:21 GMT-0500 (EST)
# Rebuilding: Thu Nov 07 2013 00:16:01 GMT-0500 (EST)
# Rebuilding: Thu Nov 07 2013 00:16:09 GMT-0500 (EST)
```

## More Info

**Cleaver** is a one-stop shop for generating HTML presentations in
record time. Using some spiced up markdown, you can produce
good-looking, interactive presentations without writing any code
or placing a measly textbox.

All you need to do is write some blocks of markdown, separated by `--`
on its own line and include options at the top.

Cleaver also looks great on mobile.

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
[options](https://github.com/jdan/cleaver/blob/master/doc/options.md) for more
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

### Specifying Themes

Themes may be specified by one of the following options:

* An absolute or relative path to a directory
* A URL to a directory
* A github repostitory in the form of *username/reponame*

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

### Examples

* [jdan/cleaver-retro](http://github.com/jdan/cleaver-retro)
* [jdan/cleaver-github](http://github.com/)

Template files will automatically override the default templates.

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

* **reverse**: H, J, LEFT, DOWN, and Backspace
* **forward**: K, L, ENTER, UP, RIGHT, and Space

Alternatively, click the control buttons located below the presentation.

## Contributing

* Fork it
* Clone it
* Install dependencies (`npm install`)
* Checkout a release branch (`git checkout -b feature/cool-wordart`)
* Make changes, commit, and push
* Open a pull request!

With &lt;3,<br/>[@jdan](http://jordanscales.com)

--

[MIT Licensed](https://github.com/jdan/cleaver/blob/master/LICENSE)
