## Options

Cleaver supports several basic options for adding a bit of customization to
your presentations. These options are placed at the top of your document, in
YAML format. A typical option setup resembles the following.

    title: Basic Example
    author:
      name: Jordan Scales
      twitter: jdan
      url: http://jordanscales.com
    style: basic-styles.css
    output: basic.html

### title

The title of the slidshow.

**Default**: Untitled

### author

Several fields which, if included, populate a basic author "credits" slide at
the end of your presentation.

![author slide](https://i.cloudup.com/f0zVsUwqF0-3000x3000.png)

These fields include:

* **name**: Your full name
* **url**: A url to your website
* **twitter**: Your twitter handle
* **email**: Your email address

Please note that some characters must be escaped. For example, "@username"
would need to be wrapped in quotes. You can leave out the "@" when specifying
a twitter handle.

### theme

An optional theme to load. A theme is a directory, URL, or a github repo in
the form of *username/repo* that may contain stylesheets, javascript, or
rewritten templates. Themes group together many of the other options listed
in this article.

For example, check out the [retro theme](http://github.com/jdan/cleaver-retro).

For more information on themes, check out
[the documentation]([options](https://github.com/jdan/cleaver/blob/master/docs/themes.md).

### style

An optional stylesheet to load. This can be either a URL, or an
absolute/relative path to a file. *Relative to the markdown document you are
sending to cleaver*.

These styles will be **appended** to Cleaver's default style. For more
fine-grained control, check out the docs on Theming.

### output

The filename (or absolute/relative path to a file) you wish to save your
output to.

**Default**: FILENAME-cleaver.html

### controls

An option determining whether or not you want to render simple navigation
buttons on your presentation.

**Default**: true

### progress

Displays a small progress bar at the top of your document.

**Default**: true

### encoding

Content encoding to use on the rendered document.

**Default**: utf-8

### template

URL or absolute/relative path to a mustache template used to render the slides.
See [default.mustache](https://github.com/jdan/cleaver/blob/master/templates/default.mustache)
for inspiration.

### layout

URL or absolute/relative path to a mustache template used to render the entire
slideshow. See
[layout.mustache](https://github.com/jdan/cleaver/blob/master/templates/layout.mustache)
for inspiration.
