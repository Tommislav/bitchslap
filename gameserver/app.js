var Game = 
{
  Colors: [{colorName: "Purple", hex: "#FF37C9"}, {colorName: "Yellow", hex: "#FFFF00"}, {colorName: "Green", hex: "#12FF4F"}, {colorName: "Blue", hex: "#37E5FF"}],
  InitiateColor: {colorName: "Brown" , hex: "#96753D"},
  DeadColor: {colorName: "Dead" , hex: "#333333"},
  Players: [],
  TargetColor: "",
  NewRound: function()
  {
    var aliveColors = new Array();
    for(var i = 0; i < Game.Players.length; i++)
    {
        if(Game.Players[i].alive)
        {
           var index = Math.floor(Math.random() * Game.COlors.length);
           aliveColors.push(Game.Colors[index]);
           Game.Players[i].color = Game.Colors[index].hex
        }
    }
    
    var targetColorIndex = Math.floor(Math.random() * aliveColors.length);
    Game.TargetColor = aliveColors[targetColorIndex].hex;
    console.log(Game.TargetColor.colorName);
    io.sockets.emit('updateMission', "Hunt color: "+Game.TargetColor.colorName);
    io.sockets.emit('playerStatus', {Players : Game.Players});
  }
  
};

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

app.get('/play', function (req, res) {
    res.sendfile(__dirname + '/play.html');
});


// Called when client connects
//var Players = new Array();
io.sockets.on('connection', function (client) {
  // Called when receving 'message' from the client
  client.on('connectPlayer', function (data) {
    // Log data to the console
    //players.push(data.playername);
    console.log(Game.InitiateColor);
    Game.Players.push({ id: data.id , name: Game.InitiateColor.colorName, color: Game.InitiateColor.hex, alive: true  });
    console.log(data.id);
    
    // Sends a message to all connected clients
    io.sockets.emit('playerStatus', {Players : Game.Players});
    });
    
    client.on('startGame', function (data) {
      Game.NewRound();
    });
});