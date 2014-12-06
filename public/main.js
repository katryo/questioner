$(function() {
  var socket = io();
  var $window = $(window);
  var $message_input = $('#message__input');

  $('form#chat').submit(function() {
    socket.emit('chat message', $message_input.val());
    $message_input.val('');
    return false;
  });

  socket.on('chat message', function(msg) {
    $('#messages').append($('<li>').text(msg));
  });

});