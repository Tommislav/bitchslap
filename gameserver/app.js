var Game = 
{
  Colors: [{colorName: "Purple", hex: "#FF37C9"}, {colorName: "Yellow", hex: "#FFFF00"}, {colorName: "Green", hex: "#12FF4F"}, {colorName: "Blue", hex: "#37E5FF"}],
  InitiateColor: {colorName: "Brown" , hex: "#96753D"},
  DeadColor: {colorName: "Dead" , hex: "#333333"},
  Players: [],
  TargetColor: {},
  IntervalId: 0,
  UpdateTarget: function()
  {
    var aliveColors = new Array();
    for(var i = 0; i < Game.Players.length; i++)
    {
        console.log(Game.Players[i].alive)
        if(Game.Players[i].alive)
        {
           var hex = Game.Players[i].color;
           aliveColors.push(Game.GetColorByHex(hex));
        }
    }
    if(aliveColors.length > 0)
    {
       var targetColorIndex = Math.floor(Math.random() * aliveColors.length);
       console.log("ALIVE COLORS: INDEX "+targetColorIndex + " AND LENGTH "+aliveColors.length);
       Game.TargetColor = aliveColors[targetColorIndex];
       
       console.log("TARGET COLOR: "+aliveColors[targetColorIndex]);
       console.log("TARGET COLOR HEX: "+aliveColors[targetColorIndex].hex);
       console.log("GAME TARGET COLOR HEX: "+Game.TargetColor.hex+"");
       
       io.sockets.emit('updateMission', "Hunt color: "+Game.TargetColor.colorName);
       Game.EmitPlayerStatus();
       setInterval(function() { Game.UpdateTarget(); }, 10000);
       console.log("set interval: 10 000");
    }
    //Endscreen
  },
  NewRound: function(client)
  {
    for(var i = 0; i < Game.Players.length; i++)
    {
        console.log(Game.Players[i].alive)
        if(Game.Players[i].alive)
        {
           var index = Math.floor(Math.random() * Game.Colors.length);
           console.log("GAME.COLORS["+index+"]: "+Game.Colors[index].hex)
           Game.Players[i].color = Game.Colors[index].hex;
        }
    }
    Game.UpdateTarget();
  },
  GetColorByHex: function(hex)
  {
    for(var i = 0; i < Game.Colors.length; i++)
    {
      if(Game.Colors[i].hex == hex)
      {
        return Game.Colors[i];
      }
    }
  },
  CheckTargetColor: function(id)
  {
    for(var i = 0; i < Game.Players.length; i++)
    {
        if(Game.Players[i].id == id)
        {
           console.log("correct id");
           if(Game.Players[i].color == Game.TargetColor.hex)
           {
              console.log("correct color");
              Game.Players[i].alive = false;
              Game.Players[i].color = Game.DeadColor.hex;
              console.log("Alive? "+Game.Players[i].alive);
              //Game.EmitPlayerStatus();
              clearInterval();
              console.log("clear interval");
              Game.NewRound();
           }
        }
    }
    
  },
  EmitPlayerStatus: function()
  {
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
    Game.EmitPlayerStatus();
    });
    
    client.on('startGame', function (data) {
      Game.NewRound(client);
    });
    
    client.on('onClick', function (id) {
      console.log("runs onClick: "+id);
      Game.CheckTargetColor(id);
    });
});