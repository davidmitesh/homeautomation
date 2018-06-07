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

const {MongoClient, ObjectID} = require('mongodb');


const url = 'mongodb://localhost:27017/automation';

var app=express();
app.use(bodyParser.json());
var lightstatus=0;
var fanstatus=1;

app.use((req,res,next)=>{
  MongoClient.connect(url, (err, db)=>{
    var dbase=db.db("homeautomation");
    dbase.collection('automation').findOne({
      name:"mitesh"
    },(err,data)=>{
      lightstatus=data.light;
      fanstatus=data.fan;
    });
});
next();
});
app.get('/adddetail',(req,res)=>{
  MongoClient.connect(url, (err, db)=>{
    var dbase=db.db("homeautomation");
        dbase.collection('automation').insertOne({
          name:"mitesh",
          light:0,
          fan:0
        },(err,result)=>{
        if (err){
         return  console.log('cannot be saved');
        }
          res.send("hey soul sister");
        });
db.close();
});
});

  app.get('/getstatus',(req,res)=>{
    MongoClient.connect(url, (err, db)=>{
      var dbase=db.db("homeautomation");
    dbase.collection("automation").findOne({
     name:"mitesh"
   },(err,data)=>{
     res.send(data);
   });
   db.close();
 }) ;
});

  app.get('/togglelightstatus',(req,res)=>{
    MongoClient.connect(url, (err, db)=>{
      var dbase=db.db("homeautomation");
    dbase.collection("automation").findOneAndUpdate({
      name:"mitesh"
    },{$set:{light:!lightstatus}},(err,data)=>{
      console.log("toggled light");
      res.send('data');
    });
    db.close();
  });
});

  app.get('/togglefanstatus',(req,res)=>{
    MongoClient.connect(url, (err, db)=>{
      var dbase=db.db("homeautomation");
    dbase.collection("automation").findOneAndUpdate({
      name:"mitesh"
    },{$set:{fan:!fanstatus}},(err,data)=>{
      console.log("toggled fan");
    });
    db.close();
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

io.sockets.on('connection', function (socket) {// WebSocket Connection
   lightstatus = 0; //static variable for current status
  pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    lightstatus = value;
MongoClient.connect(url, (err, db)=>{
  var dbase=db.db("homeautomation");
  dbase.collection('automation').findOneAndUpdate({
    name:"mitesh"
  },{$set:{light:lightstatus}},(err,data)=>{
    console.log("succesfully updated");
  });
});
    socket.emit('light', lightstatus); //send button status to client
  });
  socket.on('light', function(data) { //get light switch status from client
    lightstatus = data;
    if (lightstatus != LED.readSync()) { //only change LED if status has changed
      LED.writeSync(lightstatus); //turn LED on or off
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
