'use strict'

var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var AccessLinkSchema = Schema({
  title: String,
  url: String,
  description: String,
  enabled: Boolean,
  image: String,
  createdDate: Date,
  updatedDate: Date,
  createdUnix: Number,
  updatedUnix: Number,
  user: {type:Schema.ObjectId,ref:'User'}
});

module.exports=mongoose.model('Accesslink',AccessLinkSchema);
