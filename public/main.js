$(function() {
  var socket = io();
  var $window = $(window);
  var $message_input = $('#message__input');

  var vm = new Vue({
    el: 'body',
    data: {
      currentUser: '???',
      messages: [],
      secondsLeft: 0,
      isSurprizing: false,
      surprizingWords: ['1号', '１号', 'ハッカドール'],
      angryWords: ['つまらない', 'ひどい'],
      tereWords: [],
      excellentWords: ['かわいい'],
      emotion: 'normal'
    },
    methods: {
      appendMessageUpToLimit: function(msgObj) {
        if (this.messages.length > 20) {
          this.messages.pop();
        }
        this.messages.unshift({ user: msgObj.user, content: msgObj.content});
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
      surprizeIfSurprizingWord: function(content) {
        that = this;
        if(this.findSurprizingWord(content)) {
          this.isSurprizing = true;
          var timerId = setInterval(function() {
            that.isSurprizing = false;
            clearInterval(timerId);
          }, 800);
        }
      },
      findSurprizingWord: function(content) {
        return this.surprizingWords.some( function(word) {
          return content.indexOf(word) !== -1;
        });
      },
      findSpecialWord: function(content, words) {
        return words.some( function(word) {
          return content.indexOf(word) !== -1;
        });
      },
      changePersonImg: function(imgFileName, cb) {
        var backgroundImage = 'url("/public/' + imgFileName + '")';
        var $lower = $('.person-lower');
        var $upper = $('.person-upper');
        $lower.css('background-image', backgroundImage);
        $upper.fadeOut(0.4, function() {
          $upper.css('background-image', backgroundImage);
          $upper.fadeIn(0.1, cb);
        });
      },
      ifFoundChangeEmotion: function(content) {
        this.changeEmotion(this.findSpecialWord(content, this.angryWords), this.toAngry);
        this.changeEmotion(this.findSpecialWord(content, this.tereWords), this.toTere);
        this.changeEmotion(this.findSpecialWord(content, this.excellentWords), this.toExcellent);
      },
      changeEmotion: function(found, toFunc) {
        if(found) {
          toFunc();
        }
      },
      toTere: function() {
        this.changeMultiPersonImg(['03_tere_1.png', '03_tere_2.png', '03_tere_3.png']);
      },
      toExcellent: function() {
        this.changeMultiPersonImg(['07_best_1.png', '07_best_2.png', '07_best_3.png', '07_excellent.png']);
      },
      toAngry: function() {
        this.changeMultiPersonImg(['05_angry_1.png', '05_angry_2.png', '05_angry_3.png']);
      },
      changeMultiPersonImg: function(images) {
        var that = this;
        this.changePersonImg(images[0], function() {
          that.changePersonImg(images[1], function() {
            if (images.length > 3) {
              that.changePersonImg(images[2], function() {
                that.changePersonImg(images[3]);
              });
            }
            else {
              that.changePersonImg(images[2]);
            }
          });
        });
      }
    },
    ready: function() {
      console.log('ready');
      this.fetchDeadline();
      this.fetchLatestUserId();
    }
  });

  $('form#chat').submit(function() {
    socket.emit('chat message', { content: $message_input.val(), user: vm.currentUser});
    $message_input.val('');
    return false;
  });

  socket.on('chat message', function(msgObj) {
    vm.appendMessageUpToLimit(msgObj);
    vm.surprizeIfSurprizingWord(msgObj.content);
    vm.ifFoundChangeEmotion(msgObj.content);
  });

});