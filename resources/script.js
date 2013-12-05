/**
 * Takes the last slide and places it at the front.
 */
function goBack() {
  var wrapper = document.querySelector('#wrapper');
  var lastSlide = wrapper.lastChild;
  while (lastSlide !== null && lastSlide.nodeType !== 1) {
    lastSlide = lastSlide.previousSibling;
  }

  wrapper.removeChild(lastSlide);
  wrapper.insertBefore(lastSlide, wrapper.firstChild);

  setCurrentProgress();
  updateURL();
  updateTabIndex();
}

/**
 * Takes the first slide and places it at the end.
 */
function goForward() {
  var wrapper = document.querySelector('#wrapper');
  var firstSlide = wrapper.firstChild;
  while (firstSlide !== null && firstSlide.nodeType !== 1) {
    firstSlide = firstSlide.nextSibling;
  }

  wrapper.removeChild(firstSlide);
  wrapper.appendChild(firstSlide);

  setCurrentProgress();
  updateURL();
  updateTabIndex();
}

/**
 * Updates the current URL to include a hashtag of the current page number.
 */
function updateURL() {
  window.history.replaceState({} , null, '#' + currentPage());
}

/**
 * Returns the current page number of the presentation.
 */
function currentPage() {
  return document.querySelector('#wrapper .slide').dataset.page;
}

/**
 * Returns a NodeList of each .slide element.
 */
function allSlides() {
  return document.querySelectorAll('#wrapper .slide');
}

/**
 * Give each slide a "page" data attribute.
 */
function setPageNumbers() {
  var wrapper = document.querySelector('#wrapper');
  var pages   = wrapper.querySelectorAll('section');
  var page;

  for (var i = 0; i < pages.length; ++i) {
    page = pages[i];
    page.dataset.page = i;
  }
}

/**
 * Set the current progress indicator.
 */
function setCurrentProgress() {
  var wrapper = document.querySelector('#wrapper');
  var progressBar = document.querySelector('.progress-bar');

  if (progressBar !== null) {
    var pagesNumber    = wrapper.querySelectorAll('section').length;
    var currentNumber  = parseInt(currentPage(), 10);
    var currentPercent = pagesNumber === 1 ? 100 : 100 * currentNumber / (pagesNumber - 1);
    progressBar.style.width = currentPercent.toString() + '%';
  }
}

/**
 * Go to the specified page of content.
 */
function goToPage(page) {
  // Try to find the target slide.
  var targetSlide = document.querySelector('#wrapper .slide[data-page="' + page + '"]');

  // If it actually exists, go forward until we find it.
  if (targetSlide) {
    var numSlides = allSlides().length;

    for (var i = 0; currentPage() !== page && i < numSlides; i++) {
      goForward();
    }
  }
}

/**
 * Removes tabindex property from all links on the current slide, sets
 * tabindex = -1 for all links on other slides. Prevents slides from appearing
 * out of control.
 */
function updateTabIndex() {
  var allLinks = document.querySelectorAll('.slide a');
  var currentPageLinks = document.querySelector('.slide').querySelectorAll('a');
  var i;

  for (i = 0; i < allLinks.length; i++) {
    allLinks[i].setAttribute('tabindex', -1);
  }

  for (i = 0; i < currentPageLinks.length; i++) {
    allLinks[i].removeAttribute('tabindex');
  }
}

window.onload = function () {

  // Give each slide a "page" data attribute.
  setPageNumbers();

  // Update the tabindex to prevent weird slide transitioning
  updateTabIndex();

  // If the location hash specifies a page number, go to it.
  var page = window.location.hash.slice(1);
  if (page) {
    goToPage(page);
  }

  document.onkeydown = function (e) {
    var kc = e.keyCode;

    // left, down, H, J, backspace, PgUp - BACK
    // up, right, K, L, space, enter, PgDn - FORWARD
    if (kc === 37 || kc === 40 || kc === 8 || kc === 72 || kc === 74 || kc === 33) {
      goBack();
    } else if (kc === 38 || kc === 39 || kc === 13 || kc === 32 || kc === 75 || kc === 76 || kc === 34) {
      goForward();
    }
  };

  if (document.querySelector('.next') && document.querySelector('.prev')) {
    document.querySelector('.next').onclick = function (e) {
      e.preventDefault();
      goForward();
    };

    document.querySelector('.prev').onclick = function (e) {
      e.preventDefault();
      goBack();
    };
  }

};
