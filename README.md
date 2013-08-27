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

See it in action [here](http://prezjordan.github.io/cleaver).

**Cleaver** is a one-stop shop for generating HTML presentations in
record time. Using only an intuitive JSON format, you can produce
good-looking, interactive presentations without writing any code
or placing a measly textbox.

## Development

**Cleaver** uses [node](http://nodejs.org) for development. Once you are
  all set up and have cloned your fork, you can begin making
  changes to the code base. The outline is described below.

##

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
