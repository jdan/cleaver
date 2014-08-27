/**
 * Plucks a few fields from an object
 */
function pluck(obj, fields) {
  var plucked = {};
  if (!obj) {
    return;
  }

  fields.forEach(function (field) {
    plucked[field] = obj[field];
  });

  return plucked;
}

module.exports = pluck;
