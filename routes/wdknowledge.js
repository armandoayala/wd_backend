'use strict'

var express = require('express');
var WDKnowledgeController = require('../controllers/wdknowledge');

var api = express.Router();
var mdAuth = require('../middelwares/authenticated');
var mdAppSettings = require('../middelwares/md_settings');

api.post('/create', [mdAuth.ensureAuth, mdAppSettings.settings], WDKnowledgeController.save);
api.put('/update/:id', [mdAuth.ensureAuth, mdAppSettings.settings], WDKnowledgeController.update);
api.post('/wdtag/:id', [mdAuth.ensureAuth, mdAppSettings.settings], WDKnowledgeController.addWDTag);
api.delete('/delete-wdtag/:id/:tag_id', [mdAuth.ensureAuth, mdAppSettings.settings], WDKnowledgeController.removeWDTag);
api.delete('/delete/:id/:type', [mdAuth.ensureAuth, mdAppSettings.settings], WDKnowledgeController.deleteOperation);
api.post('/find', [mdAuth.ensureAuth, mdAppSettings.settings], WDKnowledgeController.findByFilter);
api.get('/find/:id', [mdAuth.ensureAuth, mdAppSettings.settings], WDKnowledgeController.findById);
api.put('/activate/:id', [mdAuth.ensureAuth, mdAppSettings.settings], WDKnowledgeController.activate);
api.put('/inactivate/:id', [mdAuth.ensureAuth, mdAppSettings.settings], WDKnowledgeController.inactivate);

module.exports = api;
