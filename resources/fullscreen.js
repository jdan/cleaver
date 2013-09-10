window.onresize = function(event) {
    setTimeout(update, 50);
}
/*
* does needed update checks, and calls udate functions
*/
function update(bypass) {
    var div = document.getElementById('wrapper');
    var slides = document.getElementsByClassName('slide');
    if(document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen || bypass) {
        setTimeout(function() {
            width = document.width;
            height = document.height;
            updateContainer(div, Math.round(height*1.3)+"px", height+"px");
            updateSlide(slides, Math.round((height*1.3)-60), height);
            updateFonts(1.4)
        }, 50);
    } else {
        updateContainer(div, "850px", "600px");
        updateSlide(slides, "790px", "540px");
        updateFonts(1);
    }
}
/**
* updates fonts, to match screen dimension change.
*/
function updateFonts(multiplier) {
    var elements = ['h1', 'h2', 'h3', 'p', 'h1.name', 'h3.twitter', 'h3.url'];
    var defaults = {
        'h1': 100,
        'h2': 30,
        'h3': 45,
        'p': 32,
        'h1.name': 55,
        'h3.twitter': 30,
        'h3.url': 30
    }
    for (var e in elements) {
        elem = document.querySelectorAll(elements[e]);
        for (var i in elem) {
            console.log(elem[i]);
            if(elem[i] && typeof elem[i].style != 'undefined') {
                elem[i].style.fontSize = parseFloat(defaults[elements[e]]*multiplier)+"px";
            }
        }
    }
}
/**
* updates whole container to screen dimensions
*/

function updateContainer(container, width, height) {
    container.style.height = height;
    container.style.width = width;
}
/**
* updates each slide, to screen dimensions, keeping aspect ratio
*/
function updateSlide(slides, width, height) {
    for (var i in slides) {
        if(slides[i].style && typeof slides[i].style !== 'undefined') {
            slides[i].style.height = height;
            slides[i].style.width = width;
        }
    }
}
/**
* handles cross-browser compability
*/
function RunPrefixMethod(obj, method) {
    var p = 0, m, t;
    var pfx = ["webkit", "moz", "ms", "o", ""];
    while (p < pfx.length && !obj[m]) {
        m = method;
        if (pfx[p] == "") {
            m = m.substr(0,1).toLowerCase() + m.substr(1);
        }
        m = pfx[p] + m;
        t = typeof obj[m];
        if (t != "undefined") {
            pfx = [pfx[p]];
            return (t == "function" ? obj[m]() : obj[m]);
        }
        p++;
    }

}