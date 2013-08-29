var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

// Start listening on port 8080
server.listen(10141);

// Serve the index.html file
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.get('/mainboard', function (req, res) {
    res.sendfile(__dirname + '/mainboard.html');
});
app.get('/settings.js', function (req, res) {
    res.sendfile(__dirname + '/settings.js');
});


var colors = ["#ff0000", "#00ff00", "#0000ff", "#cccccc", "#ffccff"];

app.get('/play', function (req, res) {
    res.sendfile(__dirname + '/play.html');
});


// Called when client connects
var Players = new Array();
io.sockets.on('connection', function (client) {
  // Called when receving 'message' from the client
  client.on('connectPlayer', function (data) {
    // Log data to the console
    //players.push(data.playername);
    Players.push({ id: data.id , name: colors[Players.length]+"", color: colors[Players.length]+"", alive: true  });
    console.log(data.id);
    
    // Sends a message to all connected clients

    io.sockets.emit('playerStatus', {Players : Players});
    });
});
