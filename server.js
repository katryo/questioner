var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}

app.use('/public', express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
  redis.get('question', function(err, reply) {
    redis.set('question', 'is ...?', redis.print);
  });
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/answer', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/set_deadline', function (req, res) {
  if(req.query.admin === 'kat') {
    var deadline = req.query.deadline;
    redis.set('deadline', deadline);
    res.send('deadline set to ' + deadline);
  } else {
    res.send('you are not admin!');
  }
});

app.get('/deadline', function (req, res) {
  redis.get('deadline', function(err, reply) {
    if(err) {
      res.send({hour: '21', min: '15'});
    } else {
      if(reply) {
        var tenHourStr = reply.charAt(0);
        var oneHourStr = reply.charAt(1);
        var hour = tenHourStr + oneHourStr;
        var tenMinStr = reply.charAt(2);
        var oneMinStr = reply.charAt(3);
        var min = tenMinStr + oneMinStr;
        res.send({hour: hour, min:min});
      } else {
        res.send({hour: '21', min: '15'});
      }
    }
  });
});

io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });
});

http.listen(port, function() {
  console.log('Server listening on port ' + port);
});
