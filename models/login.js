'use strict'

var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var LoginSchema = Schema({
  token: String,
  loggedAtDate: Date,
  logoutedAtDate: Date,
  loggedAtUnix: Number,
  logoutedAtUnix: Number,
  user: {type:Schema.ObjectId,ref:'User'}
});

module.exports=mongoose.model('Login',LoginSchema);
