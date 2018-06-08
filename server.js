const express=require('express');
const _=require('lodash');
var bodyParser=require('body-parser');
var http=require('http');
var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output
var pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
var {addAutomation,updateFan,updateLight,getstatus,updateLightParameter}=require("./playground/playground.js");

var app=express();
app.use(bodyParser.json());



app.get('/adddetail',(req,res)=>{
  addAutomation("mitesh",0,0);
});

  app.get('/getstatus',(req,res)=>{
    res.send(getstatus()[0]);
});

  app.get('/togglelightstatus',(req,res)=>{
  updateLight();
  res.send("done");
});

  app.get('/togglefanstatus',(req,res)=>{
  updateFan();
  res.send("done");

});

function handler (req, res) { //create server
  fs.readFile(__dirname + '/public/index.html', function(err, data) { //read file index.html in public folder
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      return res.end("404 Not Found");
    }
    res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    res.write(data); //write data from index.html
    return res.end();
  });
}
  updateLightParameter(0);

io.sockets.on('connection', function (socket) {// WebSocket Connection
  var lightvalue = 0; //static variable for current status
  pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    lightvalue = value;
    updateLightParameter(lightvalue);
    socket.emit('light', lightvalue); //send button status to client
  });
  socket.on('light', function(data) { //get light switch status from client
    lightvalue = data;
      updateLightParameter(lightvalue);
    if (lightvalue != LED.readSync()) { //only change LED if status has changed
      LED.writeSync(lightvalue); //turn LED on or off
    }
  });
});

process.on('SIGINT', function () { //on ctrl+c
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport LED GPIO to free resources
  pushButton.unexport(); // Unexport Button GPIO to free resources
  process.exit(); //exit completely
});



http.listen(3000);
