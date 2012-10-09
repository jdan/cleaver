# Cleaver

a command-line tool for generating HTML slideshows with JSON

---

## Quick Setup

Get it on NPM.

```
npm install -g cleaver
```

And use it like so (with an optional `--debug` parameter)

```
cleaver --file=path/to/something.json
```

## About

See it in action [here](http://prezjordan.github.com/cleaver).

**Cleaver** is a one-stop shop for generating HTML presentations in
record time. Using only an intuitive JSON format, you can produce
good-looking, interactive presentations without writing any code
or placing a measly textbox.

## Development

**Cleaver** uses [node](http://nodejs.org) for development. Once you are
  all set up and have cloned your fork, you can begin making
  changes to the code base. The outline is described below.

### bin/

Contains the **cleaver** executable which groups together all of the
  logic. You can integration test by running this script.

### examples/

Basic examples of **cleaver** usage.

### lib/

**main.js**: is directly called by `./bin/cleaver` and contains logic to
  check for file input. It then passes arguments to `render()`.

**render.js**: contains a method `render()` which is the core logic of
  **cleaver**.

### styles/

**default.css**: the initial styling rules (these have low specificity
  and are easily overwritten.

**dark.css**: an example showing the capabilities of extending styles.

### templates/

**layout.mustache**: contains the overall layout of a **cleaver**
  render, including CSS and JS placement.

All other templates are denoted with a `_` to signify partial layouts.
  They are unique to their slide `type`.

## Reference

Consider a *very* basic (`examples/basic.json`) example as shown below:

```
{
  "name": "Example",
  "author": {
    "name": "Aaron Patterson",
    "twitter": "@tenderlove",
    "url": "http://tenderlovemaking.com"
  },
  "slides": [
    {
      "type": "main",
      "title": "Cleaver 101",
      "subtitle": "A first look at quick HTML presentations"
    },
    {
      "type": "text",
      "title": "A textual example",
      "content": 
        "Content can be written in **Markdown!** New lines are written
        with two angle brackets.>>

        Now this will be in a separate paragraph"
    },
    {
      "type": "list",
      "title": "A list of things",
      "items": [
        "Item 1",
        "Item B",
        "Item gamma"
      ]
    }
  ]
}
```

Render it like so:

```
cleaver --file=examples/basic.json
```

You can also specify an output file (default: `output.html`) and a
stylesheet:

```
cleaver --file=examples/basic.json --output=render.html --style=styles/dark.css
```

By default, **cleaver** will place navigation arrows in the bottom
  corners of your presentation. To omit those, append a `--nocontrols`
  flag to your command.

```
cleaver --file=examples/basic.json --nocontrols
```

## Header Information

**name**: A string representing the name of the document. Cleaver will
  populate the document's `<title>` with this string.

**author**: A hash containing a name, twitter handle, and homepage URL. This information
  is used to populate the last slide in every presentation.

**description**: An optional description of the slideshow.

## Slides

**main**: Intro slide containing a `title` and `subtitle`. (`templates/_main.mustache`)

**text**: Basic slide containing `title` and `content`, which is rendered in markdown. 
  **NOTE:** Since newlines are escaped in JSON, use `>>` to specify a new paragraph. (`templayes/_text.mustache`)

**list**: A list slide with properties `title` and `items`, an array of strings. (`templates/_list.mustache`)

**author**: Automatically-populated, this slide uses information from the `author` hash. (`templates/_author.mustache`)

## Further Information

**Cleaver** produces a *single* document, `output.html` containg CSS and JavaScript (jQuery) code. Everything is 
  rendered from `templates/layout.mustache`.

`styles/default.css` is always rendered first. If an additional
  stylesheet is specified with the `--style` flag, that will be rendered
  *after* so you can override the default style. Watch out for specificity.

To navigate the slideshow: 

* **reverse**: H, J, LEFT, DOWN, and Backspace
* **forward**: K, L, ENTER, UP, RIGHT, and Space

[MIT Licensed](https://github.com/prezjordan/cleaver/blob/master/LICENSE)
