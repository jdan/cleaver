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

![cleaver-ribbon](https://i.cloudup.com/GECEx5BmxI-1200x1200.png)

* [sudodoki/reveal-cleaver-theme](http://github.com/sudodoki/reveal-cleaver-theme)

![reveal-cleaver-theme](https://i.cloudup.com/wlzisDLe32-1200x1200.png)

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

Template files will automatically override the default templates.

### Theme Behavior

Themes group together many options such as style, template, and layout. Please
note that the individual options will be loaded *after* the theme, allowing you
to override a theme's properties. This is not recommended, however, as the
theme author may construct his or her styles in such a way that they are not
meant to be overridden.
