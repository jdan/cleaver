title: Cleaver
author:
  name: Jordan Scales
  twitter: jdan
  url: http://jordanscales.com
output: index.html
style: help.css
layout: layout.mustache

--

# Cleaver
## 30-second slideshows for hackers

--

### What is Cleaver?

Cleaver turns the following:

    title: My Slideshow
    output: slideshow.html

    --

    # Hello, world!
    ## This is my slideshow

    --

    ### How many widgets can we sell?

    Based on our factors, we can sell **20 million** widgets.

--

### What is Cleaver?

**Into a slideshow like this**.

Cleaver uses a simple [Markdown](http://daringfireball.net/projects/markdown/)
format.

* Simply write your slides in Markdown
* ... and separate them with `--`

Cleaver comes with a stylesheet that looks good by default, but you can extend
it at your heart's desire.

--

### Quick Start

Get cleaver from NPM

    npm install -g cleaver

And run it against your shiny new presentation

    cleaver path/to/presentation.md

Next we'll talk about setting up a cleaver document.

--

### Options

Each presentation contains options, for example:

    title: My Presentation
    author:
        name: Jordan Scales
        twitter: jdan
        url: http://jordanscales.com
    style: /absolute/path/to/style.css
    output: something.html

These allow you to change the look and feel of your presentation. They are all
*optional*.

--

### Options

So what sort of things can you change with options?

* Add your own styles with a `style` attribute
* Change the document's name with `output`
* Add your information with `author`

And many others. Check out the full documentation [here](https://github.com/jdan/cleaver/blob/master/docs/options.md).

--

### Themes

Themes are prepackaged options you can invoke from a directory, URL, or
even a GitHub repository.

<center>
    <a href="https://i.cloudup.com/HLtcPJWJJl-3000x3000.png">
        <img src="https://i.cloudup.com/HLtcPJWJJl-600x600.png" height="350">
    </a>
</center>

--

### Themes

A theme is simply a directory containing an optional stylesheet, templates,
and javascript.

Theme styles and scripts can either be loaded
alongside the defaults or overridden with a simple option.

For more information on themes, check out [our documentation](https://github.com/jdan/cleaver/blob/master/docs/themes.md).

--

### Slide Properties

Slides are separated by `--` and are written in markdown.

h1's and h2's (denoted **#** and **##** respectively) contain styling to
center and vertically align themselves for intro slides.

h3's (denoted **###**) contain a bottom border for use as a slide header.

--

### Author Slide

If your options contain any author information (name, url, twitter, email),
an author slide will be inserted at the end of your presentation.

<center>
    <a href="https://i.cloudup.com/Ya9g4x3QDR-3000x3000.png">
        <img src="https://i.cloudup.com/Ya9g4x3QDR-600x600.png" height="300">
    </a>
</center>

--

### That's all, folks!

Seriously, that's it. Cleaver aims for ease of use: quick presentations with
no extra software or text boxes required.

Check us out [on GitHub](http://github.com/jdan/cleaver).

With &lt;3,<br/>Jordan
