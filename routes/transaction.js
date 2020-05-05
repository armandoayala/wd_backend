'use strict'

var express = require('express');
var TransactionController=require('../controllers/transaction');

var api = express.Router();
var mdAuth=require('../middelwares/authenticated');
var mdAdmin=require('../middelwares/md_admin');
var mdAppSettings=require('../middelwares/md_settings');

var multipart=require('connect-multiparty');
var md_upload=multipart({uploadDir:'./uploads/transactions'});

api.get('/test',TransactionController.test);
api.post('/',[mdAuth.ensureAuth,mdAppSettings.settings],TransactionController.save);
api.get('/',[mdAuth.ensureAuth,mdAppSettings.settings],TransactionController.findAll);
api.get('/:id',[mdAuth.ensureAuth,mdAppSettings.settings],TransactionController.findById);
api.put('/:id',[mdAuth.ensureAuth,mdAppSettings.settings],TransactionController.update);
api.post('/upload-image/:id',[mdAuth.ensureAuth,mdAppSettings.settings,md_upload],TransactionController.uploadImage);
api.get('/get-image/:imageFile',[mdAuth.ensureAuth,mdAppSettings.settings],TransactionController.getImageFile);
api.delete('/:id',[mdAuth.ensureAuth,mdAdmin.isAdmin,mdAppSettings.settings],TransactionController.deleteEntity);

module.exports = api;
