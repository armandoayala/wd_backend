'use strict'

var express = require('express');
var WDProjectController = require('../controllers/wdproject');

var api = express.Router();
var mdAuth = require('../middelwares/authenticated');
var mdAppSettings = require('../middelwares/md_settings');

api.post('/create', [mdAuth.ensureAuth, mdAppSettings.settings], WDProjectController.save);
api.put('/update/:id', [mdAuth.ensureAuth, mdAppSettings.settings], WDProjectController.update);
api.post('/wddata/:id', [mdAuth.ensureAuth, mdAppSettings.settings], WDProjectController.addWDData);
api.post('/delete-wddata/:id', [mdAuth.ensureAuth, mdAppSettings.settings], WDProjectController.removeWDData);
api.put('/wddata/:id/:wddid', [mdAuth.ensureAuth, mdAppSettings.settings], WDProjectController.updateWDData);
api.delete('/delete/:id/:type', [mdAuth.ensureAuth, mdAppSettings.settings], WDProjectController.deleteOperation);
api.post('/find', [mdAuth.ensureAuth, mdAppSettings.settings], WDProjectController.findByFilter);
api.get('/find/:id', [mdAuth.ensureAuth, mdAppSettings.settings], WDProjectController.findById);
api.put('/activate/:id', [mdAuth.ensureAuth, mdAppSettings.settings], WDProjectController.activate);
api.put('/inactivate/:id', [mdAuth.ensureAuth, mdAppSettings.settings], WDProjectController.inactivate);
api.post('/decode-wddata/:id', [mdAuth.ensureAuth, mdAppSettings.settings], WDProjectController.decodeWDData);
api.post('/test-encode', WDProjectController.testEncode);
api.post('/test-decode/:vdata', WDProjectController.testDecode);

module.exports = api;
