'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var WDKnowledgeSchema = new Schema({
    name: String,
    url: String,
    description: String,
    status: String,
    createdDate: Date,
    updatedDate: Date,
    deletedDate: Date,
    createdUnix: Number,
    updatedUnix: Number,
    deletedUnix: Number,
    user: { type: Schema.ObjectId, ref: 'User' },
    tags:[
        {
            type: Schema.ObjectId, 
            ref: 'WDTag'
        }
    ]
});

module.exports = mongoose.model('WDKnowledge', WDKnowledgeSchema);
