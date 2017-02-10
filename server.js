/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();
var config = require('./config');
// all environments
app.set('port', process.env.PORT || 7777);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// app.use(express.favicon());
// app.use(express.json());
// app.use(express.urlencoded());
// app.use(express.methodOverride());
// app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);

//Route for index
app.get('/', routes.index);

//Start that mutha
server = http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

//set up socketio
var io = require('socket.io').listen(server);

//Track active users
var activeUsers = 0;
var currentSlide = 1;

//Socket stuff
io.sockets.on('connection', function(socket) {
  //Keep track of active users on the site
  activeUsers++;
  io.sockets.emit('userUpdate', { userCount: activeUsers });

  socket.emit('init', { currentSlide: currentSlide, totalSlides: config.totalSlides });

  //After a button has been pressed in a row, send that message to all users
  socket.on('slideChanged', function(data) {
    //Persist Data in DB
    currentSlide = data.slide;
    io.sockets.emit('slideChanged', { slide: currentSlide });
  });

  //set all button 2s on all clients to active and send a message to display
  socket.on('setDefault', function(data) {
    io.sockets.emit('setDefault', { msg: 'I love you', button: 'button2' });
  });

  //Clear all current button selections
  socket.on('clear', function(data) {
    io.sockets.emit('clear', {});
  });

  //Update active users when someone disconnects and emit
  socket.on('disconnect', function() {
    activeUsers--;
    io.sockets.emit('userUpdate', { userCount: activeUsers });
  });
});