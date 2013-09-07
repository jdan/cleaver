title: Cleaver
author:
  name: "Jordan Scales"
  twitter: "@jdan"
  url: "http://jordanscales.com"
output: gh-pages.html
style: intro.css

--

# Cleaver
## 30-second slideshows for hackers

<div class="help">Use the buttons or arrow keys to switch slides</div>

--

### What is Cleaver?

Cleaver turns this:

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

Cleaver comes with a stylesheet that looks good by default, but that you
can extend at your heart's desire.

--

### Quick Start

Get cleaver from NPM

    npm install -g cleaver

And run it against your shiny new presentation

    cleaver path/to/presentation.md

Next we'll talk about setting up a presentation (it's super quick!)

--

### Metadata

Each presentation contains metadata, for example:

    title: My Presentation
    author:
        name: "Jordan Scales"
        url: "http://jordanscales.com"
        twitter: "@jdan"
    style: /absolute/path/to/style.css
    output: something.html

Let's break this chunk down on the next slide.

--

### Metadata Fields

* **title**: The title of your presentation
* **author**: Some fields to populate an optional author slide at the end
* **style**: An optional external stylesheet to load
* **output**: Where to save your file (*default: FILENAME-cleaver.html*)

--

### Metadata Fields
* **controls**: Option to render navigation buttons (*default: true*)
* **agenda**: Option whether or not to insert an agenda slide (similar to a table of contents) after the title (*default: false*)
* **encoding**: A specified content encoding (*default: utf-8*)

--

### Other Slides

Slides are separated by `--` and are written in markdown.

h1's and h2's (denoted **#** and **##** respectively) contain styling to
center and vertically align themselves for intro slides.

h3's (denoted **###**) contain a bottom border for use as a slide header.

--

### Author Slide

If your metadata contains author information (name, url, twitter), an author
slide will be inserted at the end of your presentation.

--

### That's all, folks!

Seriously, that's it. Cleaver is perfect for quick slideshows that you can
create using a comfortable format. No extra software or text boxes required.

Check us out [on GitHub](http://github.com/jdan/cleaver).

With <3,

Jordan
