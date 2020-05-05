'use strict'

var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var UserEventSchema = Schema({
  type: String,
  createdDate: Date,
  updatedDate: Date,
  createdUnix: Number,
  updatedUnix: Number,
  code:Number,
  expireCodeUnix:Number,
  url:String,
  dataJSON:String,
  user: {type:Schema.ObjectId,ref:'User'}
});

module.exports=mongoose.model('Userevent',UserEventSchema);
