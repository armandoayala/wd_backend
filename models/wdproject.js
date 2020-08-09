'use strict'

var mongoose=require('mongoose');
var Schema = mongoose.Schema;

var WDDataSchema = new Schema({ name: String, value: String, isHref: Boolean, encode: Boolean });

var WDProjectSchema = Schema({
  name: String,
  note: String,
  href: String,
  status: String,
  client: String,
  data:[WDDataSchema],
  createdDate: Date,
  updatedDate: Date,
  deletedDate: Date,
  createdUnix: Number,
  updatedUnix: Number,
  deletedUnix: Number,
  user: {type:Schema.ObjectId,ref:'User'}
});

module.exports=mongoose.model('WDProject',WDProjectSchema);
