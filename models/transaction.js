'use strict'

var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var TransactionSchema = Schema({
  name: String,
  description: String,
  codigo: Number,
  precio: Number,
  image: String,
  user: {type:Schema.ObjectId,ref:'User'}
});

module.exports=mongoose.model('Transaction',TransactionSchema);
