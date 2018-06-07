const express=require('express');
const _=require('lodash');
var bodyParser=require('body-parser');
var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
//var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
//var LED = new Gpio(4, 'out'); //use GPIO pin 4 as output
//var pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled


var {mongoose}=require('./db/mongoose.js');
var {automation}=require('./model/model.js');


var app=express();
app.use(bodyParser.json());// use of middleware
var presentAutoStatus=new automation({
  fan:'false',
  light:'true'
})
// app.use(express.static('public'));
app.use(function(req,res,next){  // use of middleware
    automation.findOne({name:'mitesh'},(err,data)=>{
       presentAutoStatus.fan=data.fan;
       presentAutoStatus.light=data.light;
    });

  next();
});

app.post('/newdata',(req,res)=>{  //new user request
  var body=_.pick(req.body,['fan','light','name']);

  var newautomation=new automation(body);

  newautomation.saveRecord().then((result)=>{
    res.send(result);
  });
});
app.post('/getstatus',(req,res)=>{//pledge request

   automation.findOne({name:'mitesh'},function(err,data){
     res.send(data);
     console.log(data);
   });

  });
app.post('/togglestatusfan',(req,res)=>{
  var status=!presentAutoStatus.fan;
  automation.findOneAndUpdate({name:"mitesh"},{$set:{fan:status}},(err,data)=>{
    console.log(!presentAutoStatus.fan);
    console.log(data);
    res.send("toggled data");
  });
});
app.post('/togglestatuslight',(req,res)=>{
  var status=!presentAutoStatus.light;
  automation.findOneAndUpdate({name:"mitesh"},{$set:{light:status}},(err,data)=>{
    console.log(!presentAutoStatus.light);
    console.log(data);
    res.send("toggled data");
  });
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

// io.sockets.on('connection', function (socket) {// WebSocket Connection
//   var lightvalue = 0; //static variable for current status
//   pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton
//     if (err) { //if an error
//       console.error('There was an error', err); //output error message to console
//       return;
//     }
//     lightvalue = value;
//     socket.emit('light', lightvalue); //send button status to client
//   });
//   socket.on('light', function(data) { //get light switch status from client
//     lightvalue = data;
//     if (lightvalue != LED.readSync()) { //only change LED if status has changed
//       LED.writeSync(lightvalue); //turn LED on or off
//     }
//   });
// });

process.on('SIGINT', function () { //on ctrl+c
  LED.writeSync(0); // Turn LED off
  LED.unexport(); // Unexport LED GPIO to free resources
  pushButton.unexport(); // Unexport Button GPIO to free resources
  process.exit(); //exit completely
});




http.listen(3000);
