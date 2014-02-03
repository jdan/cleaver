/**
 * Returns the current page number of the presentation.
 */
function currentPosition() {
  return parseInt(document.querySelector('.slide:not(.hidden)').id.slice(6));
}


/**
 * Navigates forward n pages
 * If n is negative, we will navigate in reverse
 */
function navigate(n) {
  var position = currentPosition();
  var numSlides = document.getElementsByClassName('slide').length;

  /* Positions are 1-indexed, so we need to add and subtract 1 */
  var nextPosition = (position - 1 + n) % numSlides + 1;

  /* Normalize nextPosition in-case of a negative modulo result */
  nextPosition = (nextPosition - 1 + numSlides) % numSlides + 1;

  document.getElementById('slide-' + position).classList.add('hidden');
  document.getElementById('slide-' + nextPosition).classList.remove('hidden');

  updateProgress();
  updateURL();
  updateTabIndex();
}


/**
 * Updates the current URL to include a hashtag of the current page number.
 */
function updateURL() {
  window.history.replaceState({} , null, '#' + currentPosition());
}


/**
 * Sets the progress indicator.
 */
function updateProgress() {
  var progressBar = document.querySelector('.progress-bar');

  if (progressBar !== null) {
    var numSlides = document.getElementsByClassName('slide').length;
    var position = currentPosition() - 1;
    var percent = (numSlides === 1) ? 100 : 100 * position / (numSlides - 1);
    progressBar.style.width = percent.toString() + '%';
  }
}


/**
 * Removes tabindex property from all links on the current slide, sets
 * tabindex = -1 for all links on other slides. Prevents slides from appearing
 * out of control.
 */
function updateTabIndex() {
  var allLinks = document.querySelectorAll('.slide a');
  var position = currentPosition();
  var currentPageLinks = document.getElementById('slide-' + position).querySelectorAll('a');
  var i;

  for (i = 0; i < allLinks.length; i++) {
    allLinks[i].setAttribute('tabindex', -1);
  }

  for (i = 0; i < currentPageLinks.length; i++) {
    currentPageLinks[i].removeAttribute('tabindex');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // Update the tabindex to prevent weird slide transitioning
  updateTabIndex();

  // If the location hash specifies a page number, go to it.
  var page = window.location.hash.slice(1);
  if (page) {
    navigate(parseInt(page) - 1);
  }

  document.onkeydown = function (e) {
    var kc = e.keyCode;

    // left, down, H, J, backspace, PgUp - BACK
    // up, right, K, L, space, enter, PgDn - FORWARD
    if (kc === 37 || kc === 40 || kc === 8 || kc === 72 || kc === 74 || kc === 33) {
      navigate(-1);
    } else if (kc === 38 || kc === 39 || kc === 13 || kc === 32 || kc === 75 || kc === 76 || kc === 34) {
      navigate(1);
    }
  };

  if (document.querySelector('.next') && document.querySelector('.prev')) {
    document.querySelector('.next').onclick = function (e) {
      e.preventDefault();
      navigate(1);
    };

    document.querySelector('.prev').onclick = function (e) {
      e.preventDefault();
      navigate(-1);
    };
  }
});
