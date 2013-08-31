/**
 * Takes the last slide and places it at the front.
 */
function goBack() {
  var wrapper = document.querySelector('#wrapper');
  var lastSlide = wrapper.lastChild;
  while (lastSlide != null && lastSlide.nodeType !== 1) {
    lastSlide = lastSlide.previousSibling;
  }

  wrapper.removeChild(lastSlide);
  wrapper.insertBefore(lastSlide, wrapper.firstChild);
}

/**
 * Takes the first slide and places it at the end.
 */
function goForward() {
  var wrapper = document.querySelector('#wrapper');
  var firstSlide = wrapper.firstChild;
  while (firstSlide != null && firstSlide.nodeType !== 1) {
    firstSlide = firstSlide.nextSibling;
  }

  wrapper.removeChild(firstSlide);
  wrapper.appendChild(firstSlide);
}

window.onload = function () {

  document.onkeydown = function (e) {
    var kc = e.keyCode;

    // left, down, H, J, backspace - BACK
    // up, right, K, L, space, enter - FORWARD
    if (kc == 37 || kc == 40 || kc == 8 || kc == 72 || kc == 74) {
      goBack();
    } else if (kc == 38 || kc == 39 || kc == 13 || kc == 32 || kc == 75 || kc == 76) {
      goForward();
    }
  }

  if (document.querySelector('#next') && document.querySelector('#prev')) {
    document.querySelector('#next').onclick = function (e) {
      e.preventDefault();
      goForward();
    }

    document.querySelector('#prev').onclick = function (e) {
      e.preventDefault();
      goBack();
    }
  }

}
