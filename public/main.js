$(function() {
  var socket = io();
  var $window = $(window);
  var $message_input = $('#message__input');
  var surprizingImages = ['06_surprise_1.png', '06_surprise_2.png', '06_surprise_3.png'];
  var terImages = ['03_tere_1.png', '03_tere_2.png', '03_tere_3.png'];
  var excellentImages = ['07_best_1.png', '07_best_2.png', '07_best_3.png', '07_excellent.png', '07_best_2.png', '07_best_1.png'];
  var angryImages = ['05_angry_1.png', '05_angry_2.png', '05_angry_3.png', '05_angry_2.png', '05_angry_1.png'];
  var bgImages = ['park.jpg', 'room.jpg', 'school.jpg', 'seashore.jpg', 'stairs.jpg', 'station-square.jpg', 'town.jpg', 'train.jpg'];
  var sdFigureImages = ['01_standing_0.png', '01_standing_1.png', '02_thinking_1.png', '02_thinking_2.png', '02_thinking_3.png'];
  var allImages = Array.prototype.concat.apply([], [surprizingImages, terImages, excellentImages, angryImages, bgImages, sdFigureImages]);
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
      surprizingWords: ['Door', 'door', 'DOOR'],
      angryWords: ['かわいくない', 'だめ'],
      tereWords: [],
      excellentWords: ['かわいい', 'すてき', 'すごい'],
      emotion: 'normal',
      currentMessage: '「いつから全チームが同じ問題yを解いていると錯覚していた？」ですっ！',
      currentPhoneMessage: '「いつから全チームが同じ問題yを解いていると錯覚していた？」ですっ！'
    },
    methods: {
      postNicoComment: function(comment) {
        var nico = document.getElementById('js-messages-nico');
        if (nico) {
          if (this.isCensored(comment)) { comment = '<censored>'; }
          var el = document.createElement('div');
          el.innerHTML = comment;
          var randomNum = Math.random();
          el.style.top = Math.floor(randomNum * 100) + "%";
          el.style.right = '-600px';
          el.style.zIndex = 2;
          el.style.minWidth = '600px';
          el.style.position = 'absolute';
          nico.appendChild(el);
          $(el).animate(
            {
              right: '120%'
            },
            6000,
            'linear',
            function() {
              nico.removeChild(el);
            });
        }
      },
      isCensored: function(word) {
          if (word.match(/door/i)) { return true; }
          if (word.match(/vampire/i)) { return true; }
          if (word.match(/rood/i)) { return true; }
          return false;
      },
      appendMessageUpToLimit: function(msgObj) {
        if (this.messages.length > 5) {
          this.messages.pop();
        }
        if (this.isCensored(msgObj.content)) { 
          this.messages.unshift({ user: msgObj.user, content: '<censored>'});
        } else {
          this.messages.unshift({ user: msgObj.user, content: msgObj.content});
        }
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
      changeSdFigureImg: function(imgFileName, cb) {
        var src = '/public/' + imgFileName;
        var $upper = $('.js-sd-figure-upper');
        $upper.attr('src', src);
      },
      changeBg: function(imgFileName) {
        var backgroundImage = 'url("/public/' + imgFileName + '")';
        var $lower = $('#js-bg-lower');
        var $upper = $('#js-bg-upper');
        $lower.css('background-image', backgroundImage);
        $upper.fadeOut(800, function() {
          $upper.css('background-image', backgroundImage);
          $upper.fadeIn(200);
        });
      },
      changeBgRandomly: function() {
        var item = bgImages[Math.floor(Math.random() * bgImages.length)];
        this.changeBg(item);
      },
      ifFoundChangeEmotion: function(content) {
        this.changeEmotion(this.findSpecialWord(content, this.angryWords), this.toAngry);
        this.changeEmotion(this.findSpecialWord(content, this.surprizingWords), this.toSurprizing);
        this.changeEmotion(this.findSpecialWord(content, this.tereWords), this.toTere);
        this.changeEmotion(this.findSpecialWord(content, this.excellentWords), this.toExcellent);
      },
      ifFoundChangeMessage: function(msgObj) {
        if(this.findSpecialWord(msgObj.content, this.angryWords)) {
          this.currentMessage = 'むっ、怒りますよ！？';
        }
        else if(this.findSpecialWord(msgObj.content, this.excellentWords)) {
          this.currentMessage = 'わたしのこと褒めました？　ありがとうですっ！';
        }
        else if(this.findSpecialWord(msgObj.content, this.surprizingWords)) {
          this.currentMessage = 'わっ、おどろきましたっ！';
          if(msgObj.user === this.currentUser) {
            this.currentPhoneMessage = 'わっ、おどろきましたっ！　そうです、その単語を、さかさまにして入力してくださいっ！';
            var el = $('.js-sd-exclamation');
            el.css('z-index', '3');
            el.css('opacity', '1');
            var timerId = setInterval(function() {
              that.isSurprizing = false;
              clearInterval(timerId);
              el.css('z-index', '-1');
              el.css('opacity', '0');
            }, 800);
          }
        }
        this.changeMessagesIfMatchWord(msgObj, 'rose', 'バラといえばベルサイユですよねっ！');
        this.changeMessagesIfMatchWord(msgObj, 'taxi', 'タクシーといえば、ヤクザやニンジャと戦うやつが好きですっ！　２でしたっけ？');
        this.changeMessagesIfMatchWord(msgObj, 'post', '郵便局公式の年賀状テンプレート、すっごくかわいいイラストが使えたりするんですよね……');
        this.changeMessagesIfMatchWord(msgObj, 'east', '極東って言葉、ものすごくかっこいいと思うのはわたしだけでしょうかっ？');
        this.changeMessagesIfMatchWord(msgObj, 'road', 'ロードローラーだッ！　無駄無駄無駄無駄ァー！');
        this.changeMessagesIfMatchWord(msgObj, 'dead', 'なんとかオブザデッドって全部でいくつあるんでしょうねっ？');
        this.changeMessagesIfMatchWord(msgObj, 'trip', '聖地巡礼の旅に出ます。探さないでくださいっ！');
        this.changeMessagesIfMatchWord(msgObj, 'year', 'コミケが終わらないと今年も終わりませんよねっ！');
        this.changeMessagesIfMatchWord(msgObj, 'ヒント', 'ヒント？　うーん、どうしましょうねっ！');
      },
      changeMessagesIfMatchWord: function(msgObj, word, message) {
        var re = new RegExp(word, 'i');
        if(msgObj.content.match(re)) {
          this.currentMessage = message;
          this.toExcellent();
          if(msgObj.user === this.currentUser) {
            this.currentPhoneMessage = message;
          }
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
      },
      changeSdFigureImgRandoly: function() {
        var item = sdFigureImages[Math.floor(Math.random() * sdFigureImages.length)];
        this.changeSdFigureImg(item);
      }
    },
    ready: function() {
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
    vm.changeBgRandomly();
    vm.changeSdFigureImgRandoly();
    vm.postNicoComment(msgObj.content);
    vm.surprizeIfSurprizingWord(msgObj.content);
    vm.ifFoundChangeEmotion(msgObj.content);
    vm.ifFoundChangeMessage(msgObj);
  });

});