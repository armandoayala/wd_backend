'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WDTagSchema = new Schema({
    value: String,
    user: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('WDTag', WDTagSchema);
