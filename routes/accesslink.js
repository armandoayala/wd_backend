'use strict'

var express = require('express');
var AccesslinkController=require('../controllers/accesslink');

var api = express.Router();
var mdAuth=require('../middelwares/authenticated');
var mdAdmin=require('../middelwares/md_admin');
var mdAppSettings=require('../middelwares/md_settings');

var multipart=require('connect-multiparty');
var md_upload=multipart({uploadDir:'./uploads/users'});

api.post('/create',[mdAuth.ensureAuth,mdAppSettings.settings],AccesslinkController.save);
api.put('/update/:id',[mdAuth.ensureAuth,mdAppSettings.settings],AccesslinkController.update);
api.delete('/delete/:id',[mdAuth.ensureAuth,mdAppSettings.settings],AccesslinkController.deleteOperation);
api.post('/find',[mdAuth.ensureAuth,mdAppSettings.settings],AccesslinkController.findAll);
api.get('/find/:id',[mdAuth.ensureAuth,mdAppSettings.settings],AccesslinkController.findById);

module.exports = api;
