# Cleaver

30-second Slideshows for Hackers

## Intro

Cleaver turns this:

    title: Basic Example
    author:
      name: "Jordan Scales"
      twitter: "@jdan"
      url: "http://jordanscales.com"
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

![output](https://i.cloudup.com/hHBVUtbREK.gif)

## Quick Start

Get it [on NPM](https://npmjs.org/package/cleaver):

```
npm install -g cleaver
```

And run it like so:

```
cleaver path/to/something.md
```

## More Info

**Cleaver** is a one-stop shop for generating HTML presentations in
record time. Using some spiced up markdown, you can produce
good-looking, interactive presentations without writing any code
or placing a measly textbox.

All you need to do is write some blocks of markdown, separated by `--`
on its own line and include metadata at the top.

Let's walk through the above example piece by piece.

### Metadata

    title: Basic Example
    author:
      name: "Jordan Scales"
      twitter: "@jdan"
      url: "http://jordanscales.com"
    output: basic.html
    controls: true

The first section of any cleaver document is the metadata. Currently cleaver supports
the following fields.

* **title**: The title of the slideshow
* **author**
    * **name**: Your full name
    * **url**: A url to your website
    * **twitter**: Your twitter handle
* **style**: An optional stylesheet to load
* **output**: A location to save the rendered document (default: *FILENAME-cleaver.html*)
* **controls**: Option whether or not arrow buttons should be included (default: *true*)
* **agenda**: Option whether or not to insert an agenda slide (similar to a table of contents) after the title (default: *false*)

If author is included, the following slide will be automatically inserted
at the end of your presentation:

![author slide](https://i.cloudup.com/YxgwvqVZNg-1200x1200.png)

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

### Navigation

To navigate the slideshow:

* **reverse**: H, J, LEFT, DOWN, and Backspace
* **forward**: K, L, ENTER, UP, RIGHT, and Space

Or click the buttons

### Contributing

* Fork it
* Clone it
* Install dependencies (`npm install`)
* Checkout a release branch (`git checkout -b feature/cool-wordart`)
* Make changes, commit, and push
* Open a pull request!

With <3,

[@jdan](http://jordanscales.com)

[MIT Licensed](https://github.com/jdan/cleaver/blob/master/LICENSE)
