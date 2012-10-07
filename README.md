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

To navigate the slideshow: H, J, BACK, DOWN, and Backspace all go back a slide, while everything else goes forward.

[MIT Licensed](https://github.com/prezjordan/cleaver/blob/master/LICENSE)
