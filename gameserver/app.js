var Game = 
{
  Colors: [{colorName: "Purple", hex: "#e925cb"}, {colorName: "Orange", hex: "#e9ad0a"}, {colorName: "Green", hex: "#4dba30"}, {colorName: "Blue", hex: "#414dc9"}],
  InitiateColor: {colorName: "Lightgrey" , hex: "#ABABAB"},
  ZombieColor: {colorName: "Zombie" , hex: "#00DD16"},
  DeadColor: {colorName: "Dead" , hex: "#333333"},
  DeathMatchColor: {colorName: "Red", hex: "#e23351"},
  DeathMatchTick: 0,
  Players: [],
  TargetColor: {},
  IntervalId: 0,
  Tick:0,
  
  ReadyForNewGame: function() // after end game
  {
    console.log("---------> Ready for new round!!!");
    //Clear data
    clearInterval(Game.IntervalId);
    Game.Players = [];
    Game.TargetColor = {};
    io.sockets.emit('readyForNewGame', "");   
    
  },
  NewRound: function(client) // all players has connected
  {
	if (Game.Players.length == 0) {
		// No players
		Game.ReadyForNewGame();
		return;
	}
    Game.Tick = 0;
	Game.DeathMatchTick = 0;
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
      
      if(Game.IsDeathMatchMode())
      {
          //Add Zombie color to Players
          if(Game.Tick - Game.DeathMatchTick > 1)
          {
              Game.ChanageToZombieColor();
          }
      }
      
      console.log("==== update ("+Game.Tick+") =====, timeToNext: " + nextTime);
      
      clearInterval(Game.IntervalId);
      Game.IntervalId = setInterval(function() { Game.Update(); }, nextTime);
      
      if (Game.Tick % 2 == 0) {
          Game.ChangePlayerColors();
      }
      Game.UpdateTarget();
      
  },
  ChangePlayerColors: function(color)
  {
    for(var i = 0; i < Game.Players.length; i++)
    {
        console.log(Game.Players[i].alive)
        if(Game.Players[i].alive)
        {
           var index = Math.floor(Math.random() * Game.Colors.length);
           var newColor = Game.Colors[index].hex;
           
           if(Game.IsDeathMatchMode())//IsDeathMatchMode
           {
              newColor = Game.DeathMatchColor.hex;
           }
           
           console.log("Player["+i+"].color = " + newColor);
           Game.Players[i].color = newColor;
        }
    }
  },
  ChanageToZombieColor: function()
  {
      for(var i = 0; i < Game.Players.length; i++)
      {
          console.log("ChanageToZombieColor() -> Game.Players["+i+"].alive: "+!Game.Players[i].alive)
          if(!Game.Players[i].alive)
          {
             if(Game.IsDeathMatchMode()) //DeathMatchMode
             {
                if(Game.Players[i].color != Game.ZombieColor.hex)
                {
                  newColor = Game.ZombieColor.hex;                
                  console.log("ChanageToZombieColor() -> IF: Game.IsDeathMatchMode() -> IF: PlayerDontHaveZombieColor -> Player["+i+"].color = " + newColor)
                  Game.Players[i].color = newColor;
                  return;
                }                
             }
          }
      }
  },
  IsDeathMatchMode: function()
  {
    return Game.NumberOfPlayersAlive() == 2;
  },
  NumberOfPlayersAlive: function()
  {
    var numberOfAlivePlayers = 0;
    for(var i = 0; i < Game.Players.length; i++)
    {
        if(Game.Players[i].alive)
        {
           numberOfAlivePlayers++;
        }        
    }
    return numberOfAlivePlayers;
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
       
       if(Game.IsDeathMatchMode())//DeathMatchMode
       {
          console.log(" === UpdateTarget() -> If(IsDeathMatchMode) -> Change TargetColor to Red.")
          Game.TargetColor = Game.DeathMatchColor;
          Game.ChangePlayerColors();
          
       }
       
       //console.log("TARGET COLOR: "+aliveColors[targetColorIndex]);
       //console.log("TARGET COLOR HEX: "+aliveColors[targetColorIndex].hex);
       //console.log("GAME TARGET COLOR HEX: "+Game.TargetColor.hex+"");
       
       console.log("====New target color: " + Game.TargetColor.colorName);
       io.sockets.emit('updateMission', { text: "Hunt for color: "+Game.TargetColor.colorName , color: Game.TargetColor.hex });
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
              if(Game.IsDeathMatchMode())
              {
                Game.DeathMatchTick = Game.Tick;
              }
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
app.get('/test', function (req, res) {
    res.sendfile(__dirname + '/test.html');
});
//Serve Sounds (snd)
app.get('/snd/snd4.wav', function (req, res) {
    res.sendfile(__dirname + '/snd/snd4.wav');
});
app.get('/snd/snd3.wav', function (req, res) {
    res.sendfile(__dirname + '/snd/snd3.wav');
});
app.get('/snd/snd2.wav', function (req, res) {
    res.sendfile(__dirname + '/snd/snd2.wav');
});
app.get('/snd/snd1.wav', function (req, res) {
    res.sendfile(__dirname + '/snd/snd1.wav');
});

//Graphic
app.get('/bs_small.png', function (req, res) {
    res.sendfile(__dirname + '/bs_small.png');
});
app.get('/bs_big.png', function (req, res) {
    res.sendfile(__dirname + '/bs_big.png');
});


// Called when client connects
io.sockets.on('connection', function (client) {
  // Called when receving 'message' from the client
  client.on('connectPlayer', function (data) {
    // Log data to the console
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