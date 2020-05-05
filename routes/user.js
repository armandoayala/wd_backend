'use strict'

var express = require('express');
var UserController=require('../controllers/user');

var api = express.Router();
var mdAuth=require('../middelwares/authenticated');
var mdAdmin=require('../middelwares/md_admin');
var mdAppSettings=require('../middelwares/md_settings');

var multipart=require('connect-multiparty');
var md_upload=multipart({uploadDir:'./uploads/users'});

api.get('/test',mdAppSettings.settings,UserController.test);
//api.post('/save',[mdAuth.ensureAuth,mdAdmin.isAdmin],UserController.saveUser);
api.post('/create',mdAppSettings.settings,UserController.saveUser);
api.put('/update/:id',[mdAuth.ensureAuth,mdAdmin.isAdmin,mdAppSettings.settings],UserController.updateUser);
api.post('/upload-image/:id',[mdAuth.ensureAuth,mdAppSettings.settings,md_upload],UserController.uploadImage);
api.get('/get-image/:imageFile',[mdAuth.ensureAuth,mdAppSettings.settings],UserController.getImageFile);
api.get('/filter-by-role/:role',[mdAuth.ensureAuth,mdAppSettings.settings],UserController.getUsersByRole);
api.post('/login',mdAppSettings.settings,UserController.login);
api.post('/recovery-password',mdAppSettings.settings,UserController.recoveryPassword);
api.post('/change-password',mdAppSettings.settings,UserController.changePassword);

module.exports = api;
