$(function() {
  var socket = io();
  var $window = $(window);
  var $message_input = $('#message__input');

  var vm = new Vue({
    el: 'body',
    data: {
      currentUser: '???',
      messages: [],
      secondsLeft: 0
    },
    methods: {
      appendMessageUpToLimit: function(msg) {
        if (this.messages.length > 20) {
          this.messages.shift();
        }
        this.messages.push({ user: this.currentUser, content: msg});
      },
      startTimer: function() {
        var that = this;
        window.setInterval(function() {
          that.secondsLeft = that.secondsLeft - 1;
        }, 1000);
      },
      fetchDeadline: function() {
        var that = this;
        $.ajax({
          type: 'GET',
          datatype: 'json',
          url: '/deadline',
          success: function(data) {
            var now = Date.now();
            var deadline = new Date(2014, parseInt(data.mon) - 1, parseInt(data.date), parseInt(data.hour) + 1, parseInt(data.min));
            var deadlineMinSec = deadline.getTime();
            var minSecLeft = deadlineMinSec - now;
            that.secondsLeft = Math.floor(minSecLeft / 1000);
            that.startTimer();
          },
          error: function(err) {
            console.log(err);
          }
        });
      },
      fetchLatestUserId: function() {
        var that = this;
        console.log('latest');
        $.ajax({
          type: 'GET',
          datatype: 'json',
          url: '/latest_user_id',
          success: function(data) {
            that.$data.currentUser = 'ハッカドール' + data.latest_user_id + '号';
          },
          error: function(err) {
            console.log(err);
          }
        });
      },
    },
    ready: function() {
      console.log('ready');
      this.fetchDeadline();
      this.fetchLatestUserId();
    }
  });

  $('form#chat').submit(function() {
    socket.emit('chat message', $message_input.val());
    $message_input.val('');
    return false;
  });

  socket.on('chat message', function(msg) {
    vm.appendMessageUpToLimit(msg);
  });

});