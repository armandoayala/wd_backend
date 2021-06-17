'use strict'

var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  image: String,
  role: String,
  locale: String,
  codeAuth: String,
  status: String
});

module.exports=mongoose.model('User',UserSchema);
