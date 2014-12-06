var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/public'));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
  console.log(req.query);
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/answer', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/set_timer_to_10min', function (req, res) {
  if(req.query.a === 'kat') {
  };
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });

});

http.listen(port, function() {
  console.log('Server listening on port ' + port);
});
