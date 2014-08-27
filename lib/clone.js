/**
 * Clones an object
 */
function clone(obj) {
  var key, clone = {};
  if (!obj) return;

  for (key in obj) {
    clone[key] = obj[key];
  }

  return clone;
};

module.exports = clone;
