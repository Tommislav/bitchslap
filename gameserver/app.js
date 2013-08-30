var Game = 
{
  Colors: [{colorName: "Purple", hex: "#FF37C9"}, {colorName: "Yellow", hex: "#FFFF00"}, {colorName: "Green", hex: "#12FF4F"}, {colorName: "Blue", hex: "#37E5FF"}],
  InitiateColor: {colorName: "White" , hex: "#fff"},
  DeadColor: {colorName: "Dead" , hex: "#333333"},
  Players: [],
  TargetColor: {},
  IntervalId: 0,
  Tick:0,
  
  ReadyForNewGame: function() // after end game
  {
    console.log("---------> Ready for new round!!!");
    //Clear data
    clearInterval(Game.IntervalId);
    Game.Players = new Array();
    Game.TargetColor = {};
    io.sockets.emit('readyForNewGame', "");   
    
  },
  NewRound: function(client) // all players has connected
  {
    Game.Tick = 0;
    Game.ChangePlayerColors();
    Game.Update();
  },
  Update: function()
  {
      Game.Tick++;
      
      
      var nextTime = 10000 - (500 * Game.Tick);
      if (nextTime < 4000) {
        nextTime = 4000;
      }
      
      console.log("==== update ("+Game.Tick+") =====, timeToNext: " + nextTime);
      
      clearInterval(Game.IntervalId);
      Game.IntervalId = setInterval(function() { Game.Update(); }, nextTime);
      
      if (Game.Tick % 2 == 0) {
          Game.ChangePlayerColors();
      }
      Game.UpdateTarget();
      
  },
  
  ChangePlayerColors: function()
  {
    for(var i = 0; i < Game.Players.length; i++)
    {
        console.log(Game.Players[i].alive)
        if(Game.Players[i].alive)
        {
           var index = Math.floor(Math.random() * Game.Colors.length);
           var newColor = Game.Colors[index].hex;
           console.log("Player["+i+"].color = " + newColor);
           Game.Players[i].color = newColor;
        }
    }
  },
  
  UpdateTarget: function()
  {
    var aliveColors = new Array();
    var winner = null;
    for(var i = 0; i < Game.Players.length; i++)
    {
        console.log(Game.Players[i].alive)
        if(Game.Players[i].alive)
        {
           var hex = Game.Players[i].color;
           aliveColors.push(Game.GetColorByHex(hex));
           winner = Game.Players[i];
        }
        
    }
    if(aliveColors.length <= 1)
    {
      //WINNER IS'
      clearInterval(Game.IntervalId);
      Game.IntervalId = setInterval(function() { Game.ReadyForNewGame(); }, 10000);
      console.log("==== Winner is: " + winner.name);
      Game.EmitPlayerStatus(); 
      io.sockets.emit('gameEnd', winner);
    }
    else
    {
       var targetColorIndex = Math.floor(Math.random() * aliveColors.length);
       //console.log("ALIVE COLORS: INDEX "+targetColorIndex + " AND LENGTH "+aliveColors.length);
       Game.TargetColor = aliveColors[targetColorIndex];
       
       //console.log("TARGET COLOR: "+aliveColors[targetColorIndex]);
       //console.log("TARGET COLOR HEX: "+aliveColors[targetColorIndex].hex);
       //console.log("GAME TARGET COLOR HEX: "+Game.TargetColor.hex+"");
       
       console.log("====New target color: " + Game.TargetColor.colorName);
       io.sockets.emit('updateMission', {text: "Hunt for color: "+Game.TargetColor.colorName , color: Game.TargetColor.hex});
       Game.EmitPlayerStatus();
    }
    //Endscreen
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
    console.log("Click");
    for(var i = 0; i < Game.Players.length; i++)
    {
        if(Game.Players[i].id == id)
        {
           if(Game.Players[i].color == Game.TargetColor.hex)
           {
              console.log("Player died: " + Game.Players[i].name);
              //console.log("correct color");
              Game.Players[i].alive = false;
              Game.Players[i].color = Game.DeadColor.hex;
              //console.log("Alive? "+Game.Players[i].alive);
              //Game.EmitPlayerStatus();
              //console.log("clear interval");
              //Game.NewRound();
              Game.Update();
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
    //console.log(Game.InitiateColor);
    Game.Players.push({ id: data.id , name: data.name, color: Game.InitiateColor.hex, alive: true  });
    console.log("Join new player " + data.name + ", with id: " + data.id);
    
    // Sends a message to all connected clients
    Game.EmitPlayerStatus();
    });
    
    client.on('startGame', function (data) {
      Game.NewRound(client);
    });
    
    client.on('onClick', function (id) {
      console.log("onClick id: "+id);
      Game.CheckTargetColor(id);
    });
});