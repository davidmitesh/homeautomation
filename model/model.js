const mongoose=require('mongoose');

const _=require('lodash');

var automation=new mongoose.Schema({
  name:{
    type:String
  },
  fan:{
    type: Boolean
    },
      light:{
        type:Boolean


      },
      led:{
        type: Boolean
      }

});


automation.methods.saveRecord=function(){
  var user=this;
return   user.save().then((doc)=>{
    return doc;
  },(err)=>{
    return err;
  });
};

var automation=mongoose.model('automation',automation);

module.exports={automation};
