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


// Called when client connects
//var players = new Array();
io.sockets.on('connection', function (client) {
  // Called when receving 'message' from the client
  client.on('message', function (data) {
    // Log data to the console
    //players.push(data.playername);
    console.log(data);
    // Sends a message to all connected clients
    io.sockets.emit('message', data);


  });
});
