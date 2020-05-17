'use strict'

var express = require('express');
var WDProjectController=require('../controllers/wdproject');

var api = express.Router();
var mdAuth=require('../middelwares/authenticated');
var mdAppSettings=require('../middelwares/md_settings');

api.post('/create',[mdAuth.ensureAuth,mdAppSettings.settings],WDProjectController.save);
api.put('/update/:id',[mdAuth.ensureAuth,mdAppSettings.settings],WDProjectController.update);
api.post('/wddata/:id',[mdAuth.ensureAuth,mdAppSettings.settings],WDProjectController.addWDData);
api.delete('/wddata/:id',[mdAuth.ensureAuth,mdAppSettings.settings],WDProjectController.removeWDData);
api.delete('/delete/:id',[mdAuth.ensureAuth,mdAppSettings.settings],WDProjectController.deleteOperation);
api.post('/find',[mdAuth.ensureAuth,mdAppSettings.settings],WDProjectController.findByFilter);
api.get('/find/:id',[mdAuth.ensureAuth,mdAppSettings.settings],WDProjectController.findById);

module.exports = api;
