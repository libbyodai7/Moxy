require('dotenv').config();

var express = require('express');
//var app = require('http').createServer(handler),

var app = express();

var path = require('path');

app.set('port', (process.env.PORT || 8080));


app.use(express.static(path.join(__dirname, '')));
app.use(express.static(path.join(__dirname, '/assets/images')));
app.use(express.static('assets'));



var server = app.listen(app.get('port'), function() {
  console.log('app running on', app.get('port)'));
});

var io = require('socket.io')(server);


var fs = require('fs'),
   five = require('johnny-five');
   var Particle = require("particle-io");

/*

app.configure(function(){
  app.use('/assets', express.static(__dirname + '/assets'));
  app.use(express.static(__dirname + '/public'));
});

*/

//var port = process.env.PORT || 8080;
//app.listen(port);


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});


app.get('/', function(req,res){
    res.sendfile('index.html');
    console.log('Sent index.html');
});

/*

io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});
*/

/*
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

*/

/*
var board = new five.Board({
  io: new Particle({
    token: process.env.PARTICLE_TOKEN,
    deviceId: process.env.PARTICLE_DEVICE_ID
  }) 
});
*/

var board = new five.Board({
  repl: false,
  io: new Particle({
    token: process.env.PARTICLE_TOKEN,
    deviceId: process.env.PARTICLE_DEVICE_ID
  }) 
});

var step = 0;
var up = false;
var down = false;
var pressed = false;


board.on("ready", function() {

   var accelerometer = new five.Accelerometer({
    controller: "MPU6050"
  });

  io.sockets.on('connection', function (socket) {
    socket.on('click', function (data) {
     
        console.log('button pressed');
       
     
        accelerometer.on("change", function() {
         // console.log(this.x);
        var sum = this.x + this.y + this.z;


        if (sum > 0.50){
         up = true;
        };

       if (sum < 0.50){
        down = true;
         };

        if( up == true && down == true){
          step = step + 1;
          up = false;
          down = false;

          //console.log(step);
 
          socket.emit('step-count', step);
        };

       });

   }); 

});
});