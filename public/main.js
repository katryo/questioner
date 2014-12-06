$(function() {
  var socket = io();
  var $window = $(window);
  var $message_input = $('#message__input');

  var vm = new Vue({ el: 'body', data: {
    currentUser: '???',
    messages: [],
    methods: {
      appendMessageUpToLimit: function(msg) {
        console.log(msg);
      }
    }
  }});

  $('form#chat').submit(function() {
    socket.emit('chat message', $message_input.val());
    $message_input.val('');
    return false;
  });

  socket.on('chat message', function(msg) {
    vm.$data.messages.push({ user: vm.currentUser, content: msg});
    console.log(vm.$data.messages);
//    $('#messages').append($('<li>').text(msg));
  });

});