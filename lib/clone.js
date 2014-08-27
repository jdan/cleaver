/**
 * Clones an object
 */
function clone(obj) {
  var key, copy = {};
  if (!obj) {
    return;
  }

  for (key in obj) {
    copy[key] = obj[key];
  }

  return copy;
}

module.exports = clone;
