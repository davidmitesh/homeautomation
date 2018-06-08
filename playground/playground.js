console.log('Starting notes.js');
const fs = require('fs');
var addAutomation = (name,fan, light) => {
var notes=[];
  var note = {
    name,
    fan,
    light
  };
  notes.push(note);
    fs.writeFileSync('notes-data.json', JSON.stringify(notes));
};
var updateFan=()=>{
  var notes=JSON.parse(fs.readFileSync('notes-data.json'));//fetches array
  var currentnote={
    name:notes[0].name,
    light:notes[0].light,
    fan:notes[0].fan
  };
  var currentstatus=currentnote.fan;
   notes.pop();
   currentnote.fan=!currentstatus;
  notes.push(currentnote);
  console.log(notes);
  fs.writeFileSync('notes-data.json', JSON.stringify(notes));
}
var updateLight=()=>{
  var notes=JSON.parse(fs.readFileSync('notes-data.json'));//fetches array
  var currentnote={
    name:notes[0].name,
    light:notes[0].light,
    fan:notes[0].fan
  };
  var currentstatus=currentnote.light;
   notes.pop();
   currentnote.light=!currentstatus;
  notes.push(currentnote);
  console.log(notes);
  fs.writeFileSync('notes-data.json', JSON.stringify(notes));
}
var getstatus=()=>{
var notes=JSON.parse(fs.readFileSync('notes-data.json'));
  console.log(notes);
return notes;
}

var updateLightParameter=(val)=>{
  var notes=JSON.parse(fs.readFileSync('notes-data.json'));//fetches array
  var currentnote={
    name:notes[0].name,
    light:notes[0].light,
    fan:notes[0].fan
  };
  var currentstatus=currentnote.light;
   notes.pop();
   currentnote.light=val;
  notes.push(currentnote);
  console.log(notes);
  fs.writeFileSync('notes-data.json', JSON.stringify(notes));
}
// getstatus();

module.exports={getstatus,addAutomation,updateLight,updateFan,updateLightParameter};
