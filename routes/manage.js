'use strict'

var express = require('express');
var ManageController=require('../controllers/manage');

var api = express.Router();
var mdAuth=require('../middelwares/authenticated');
var mdAppSettings=require('../middelwares/md_settings');

api.get('/health',mdAppSettings.settings,ManageController.health);
api.get('/translate',mdAppSettings.settings,ManageController.translate);
api.get('/auth',[mdAuth.ensureAuth,mdAppSettings.settings],ManageController.auth);

module.exports = api;
