$(function() {
  $('section').each(function(i, v) {
    if (i)
      $(v).hide();
    else
      $(v).addClass('active');
  });

  $(document).on('keydown', function(e) {
    var curr = $('section.active');
    if (!curr.next().length) {
      $('section:first').show().addClass('active');
    } else {
      curr.next().show().addClass('active');
    }

    curr.hide().removeClass('active');
  });
});
