$(function() {
  var socket = io();
  var $window = $(window);
  var $message_input = $('#message__input');
  var surprizingImages = ['06_surprise_1.png', '06_surprise_2.png', '06_surprise_3.png'];
  var terImages = ['03_tere_1.png', '03_tere_2.png', '03_tere_3.png'];
  var excellentImages = ['07_best_1.png', '07_best_2.png', '07_best_3.png', '07_excellent.png', '07_best_2.png', '07_best_1.png'];
  var angryImages = ['05_angry_1.png', '05_angry_2.png', '05_angry_3.png', '05_angry_2.png', '05_angry_1.png'];
  var allImages = Array.prototype.concat.apply([], [surprizingImages, terImages, excellentImages, angryImages]);
  allImages.forEach(
    function(fileName) {
      var img = document.createElement('img');
      img.src = '/public/' + fileName;
    }
  );

  var vm = new Vue({
    el: 'body',
    data: {
      currentUser: '???',
      messages: [],
      secondsLeft: 0,
      isSurprizing: false,
      surprizingWords: ['ダーク'],
      angryWords: ['かわいくない'],
      tereWords: [],
      excellentWords: ['かわいい'],
      emotion: 'normal',
      currentMessage: '前から思ってたんですけど、アンジェラ・バルザックさんにわたしに似てますよねっ'
    },
    methods: {
      postNicoComment: function(comment) {
        var el = document.createElement('div');
        el.innerHTML = comment;
        var randomNum = Math.random();
        el.style.top = Math.floor(randomNum * 100) + "%";
        el.style.right = 0;
        el.style.zIndex = 2;
        el.style.minWidth = '600px';
        el.style.position = 'absolute';
        var nico = document.getElementById('js-messages-nico');
        nico.appendChild(el)
        $(el).animate(
          {
            right: '120%'
          },
          5000,
          'linear',
          function() {
            nico.removeChild(el);
          });
      },
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
        $upper.fadeOut(400, function() {
          $upper.css('background-image', backgroundImage);
          $upper.fadeIn(200, cb);
        });
      },
      ifFoundChangeEmotion: function(content) {
        this.changeEmotion(this.findSpecialWord(content, this.angryWords), this.toAngry);
        this.changeEmotion(this.findSpecialWord(content, this.surprizingWords), this.toSurprizing);
        this.changeEmotion(this.findSpecialWord(content, this.tereWords), this.toTere);
        this.changeEmotion(this.findSpecialWord(content, this.excellentWords), this.toExcellent);
      },
      ifFoundChangeMessage: function(content) {
        if(this.findSpecialWord(content, this.angryWords)) {
          this.currentMessage = 'むっ、怒りますよ！？';
        }
        if(this.findSpecialWord(content, this.excellentWords)) {
          this.currentMessage = 'わたしのこと褒めました？　ありがとうですっ！';
        }
        if(this.findSpecialWord(content, this.surprizingWords)) {
          this.currentMessage = 'あれ、呼びました？';
        }
      },
      changeEmotion: function(found, toFunc) {
        if(found) {
          toFunc();
        }
      },
      toTere: function() {
        this.changeMultiPersonImg(terImages);
      },
      toExcellent: function() {
        this.changeMultiPersonImg(excellentImages);
      },
      toAngry: function() {
        this.changeMultiPersonImg(angryImages);
      },
      toSurprizing: function() {
        this.changeMultiPersonImg(surprizingImages);
      },
      changeMultiPersonImg: function(images) {
        if (images.length === 0 ){
          return;
        }
        var imagesCopied = images.concat();
        var firstImage = imagesCopied.shift();
        this.changePersonImg(firstImage, this.changeMultiPersonImg(imagesCopied));
      }
    },
    ready: function() {
      console.log('ready');
      this.fetchDeadline();
      this.fetchLatestUserId();
    }
  });

  $('form#chat').submit(function() {
    if($message_input.val()) {
      socket.emit('chat message', { content: $message_input.val(), user: vm.currentUser});
      $message_input.val('');
    }
    return false;
  });

  socket.on('chat message', function(msgObj) {
    vm.appendMessageUpToLimit(msgObj);
    vm.postNicoComment(msgObj.content);
    vm.surprizeIfSurprizingWord(msgObj.content);
    vm.ifFoundChangeEmotion(msgObj.content);
    vm.ifFoundChangeMessage(msgObj.content);
  });

});