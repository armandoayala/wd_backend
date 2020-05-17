'use strict'

//modulos
const bcrypt = require('bcrypt-nodejs');
const User = require('../models/user');
const fs = require('fs');

const pathfileTRPassword = "./data/templateRecoveryPassword.txt";
const pathfileTRPasswordRandomCode = "./data/templateRecoveryPasswordRandomCode.txt";
const pathfileTPasswordChanged = "./data/templatePasswordChanged.txt";
const cache = require('./cache');
const moment = require('moment-timezone');
const randomInt = require('random-int');
const localeService = require('./localeservice');

const appdata = require('../appdata');
var templatePasswordChanged;

function getTemplateRecoveryPassword() {
  return new Promise((resolve, reject) => {
    let template = cache.get(this.getAppData().Cache.keyTemplateRecoveryPassword);

    if (template) {
      resolve(template);
    }
    else {
      var pathFileTemplate = (this.getAppData().AppConfig.recoveryPasswordRandomCode == "1") ? pathfileTRPasswordRandomCode : pathfileTRPassword;

      fs.readFile(pathFileTemplate, (err, data) => {
        if (err) {
          reject(err);
        }
        else {
          try {
            template = data.toString();
            cache.put(this.getAppData().Cache.keyTemplateRecoveryPassword, template);
            resolve(template);
          }
          catch (error) {
            reject(error);
          }
        }
      });
    }

  });
}

function getTemplatePasswordChanged() {
  return new Promise((resolve, reject) => {
    let template = cache.get(this.getAppData().Cache.keyTemplatePasswordChanged);

    if (template) {
      resolve(template);
    }
    else {
      fs.readFile(pathfileTPasswordChanged, (err, data) => {
        if (err) {
          reject(err);
        }
        else {
          try {
            template = data.toString();
            cache.put(this.getAppData().Cache.keyTemplatePasswordChanged, template);
            resolve(template);
          }
          catch (error) {
            reject(error);
          }
        }
      });
    }

  });
}

function getAppData() {
  return appdata;
}

function getResponse(code, message, data, locale) {
  var response = {};

  response.code = code;
  response.message = (locale ? localeService.translate(message, locale) : message);

  response.data = {};
  if (data) { response.data = data; }

  return response;
}

function getResponseOk(message, data, locale) {
  var response = {};

  response.code = this.getAppData().AppConfig.codeOk;
  response.message = (locale ? localeService.translate(message, locale) : message);
  response.data = {};
  if (data) { response.data = data; }

  return response;
}

function getResponseError(message, data, locale) {
  var response = {};

  response.code = this.getAppData().AppConfig.codeError;
  response.message = (locale ? localeService.translate(message, locale) : message);
  response.data = {};
  if (data) { response.data = data; }

  return response;
}

function createUserAdmin() {
  var admin_user = this.getAppData().AppConfig.admin_user;

  return new Promise((resolve, reject) => {
    try {

      if (!admin_user.create) {
        resolve({
          create: admin_user.create,
          user: null,
          message: "Parametro creacion Admin deshabilitado"
        });
      }
      else {
        var user = new User();
        user.name = admin_user.name;
        user.surname = admin_user.surname;
        user.email = admin_user.email;
        user.role = admin_user.role;
        user.image = admin_user.image;

        User.findOne({ email: user.email.toLowerCase() }, (err, userFound) => {
          if (err) {
            reject({
              create: admin_user.create,
              user: null,
              message: "Error al intentar buscar usuario admin: " + err
            });
          }
          else {
            if (userFound) {
              resolve({
                create: admin_user.create,
                user: userFound,
                message: "Usuario Admin ya existe en BD"
              });
            }
            else {
              bcrypt.hash(admin_user.password, null, null, function (err, hash) {
                user.password = hash;
                user.save((err, userStore) => {
                  if (err) {
                    reject({
                      create: admin_user.create,
                      user: null,
                      message: "Error al guardar el usuario admin: " + err
                    });
                  }
                  else {
                    if (!userStore) {
                      reject({
                        create: admin_user.create,
                        user: null,
                        message: "No se ha registrado el usuario Admin"
                      });
                    }
                    else {
                      resolve({
                        create: admin_user.create,
                        user: userStore,
                        message: "Usuario Admin creado con exito en BD"
                      });
                    }
                  }
                });
              });
            }
          }
        });

      }

    }
    catch (error) {
      reject({
        create: null,
        user: null,
        message: "Error en creacion de usuario Admin: " + error
      });
    }
  });
}

function getCurrentMoment() {
  return moment().tz(this.getAppData().AppConfig.timezone);
}

function getCurrentMomentWithFeatures() {
  var objectMoment = {};
  objectMoment.moment = moment().tz(this.getAppData().AppConfig.timezone);
  objectMoment.unix = objectMoment.moment.unix();
  objectMoment.utc = objectMoment.moment.utc();

  return objectMoment;
}


function getCurrentDate() {
  return new Date(moment().tz(this.getAppData().AppConfig.timezone).format());
}

function formatDateToTimeZone(date) {
  return moment(date).tz(this.getAppData().AppConfig.timezone).format(this.getAppData().AppConfig.formatDate);
}

function setAuditDateInEntity(entityToSet, updateDatesOnly) {
  var currentMoment = this.getCurrentMomentWithFeatures();

  if (updateDatesOnly) {
    entityToSet.updatedDate = currentMoment.moment;
    entityToSet.updatedUnix = currentMoment.unix;
  }
  else {
    entityToSet.createdDate = currentMoment.moment;
    entityToSet.createdUnix = currentMoment.unix;
    entityToSet.updatedDate = null;
    entityToSet.updatedUnix = null;
  }

  return entityToSet;
}

function randomIntCode(min, max) {
  return randomInt(min, max);
}

function getRecoveryPasswordURL() {
  return this.getAppData().AppConfig.urlRecoveryPassword;
}

function getUserWithIdFromRequest(req) {
  var user = new User();
  user._id = req.user.sub;

  return user;

}

function removeItemInArray(array, fnPredicate) {
  if (array == null || array.length == 0) {
    return array;
  }

  return array.filter(function (item) {
    return fnPredicate(item);
  });
}

function getConfigToFindByFilter(req, objQueryFilter) {
  var objConfig = {
    pageOptions: {},
    filter: {},
    queryRegex: null,
    sort: null
  };

  var entityReqFilter = req.body;

  objConfig.pageOptions = {
    page: parseInt(req.query.page, 10) || 0,
    limit: parseInt(req.query.limit, 10) || parseInt(this.getAppData().AppConfig.limitDefaultFindPerPage, 10)
  };

  if (entityReqFilter && entityReqFilter.filter) {

    //Enabled
    if (typeof (entityReqFilter.filter.enabled) !== 'undefined') {
      objConfig.filter.enabled = entityReqFilter.filter.enabled;
    }

    var colExtraFiltersQuery = [];

    //Extra filters
    if (entityReqFilter.filter.extras != null) {
      colExtraFiltersQuery = entityReqFilter.filter.extras;
    }

    //Query
    if (typeof (entityReqFilter.filter.query) !== 'undefined') {
      objConfig.queryRegex = new RegExp(entityReqFilter.filter.query, 'i');

      if (objQueryFilter.operator == "AND") {
        objConfig.filter.$and = objQueryFilter.fnBuild(objConfig.queryRegex);
        objConfig.filter.$and= [...objConfig.filter.$and,...colExtraFiltersQuery];
      }
      else {
        objConfig.filter.$or = objQueryFilter.fnBuild(objConfig.queryRegex);
        objConfig.filter.$or= [...objConfig.filter.$or,...colExtraFiltersQuery];
      }
    }
  }

  if (entityReqFilter != null && entityReqFilter.sort && entityReqFilter.sort != null) {
    objConfig.sort = entityReqFilter.sort;
  }

  objConfig.filter.user = req.user.sub;
  return objConfig;

}

module.exports =
{
  getResponse,
  getResponseOk,
  getResponseError,
  createUserAdmin,
  getAppData,
  getCurrentMoment,
  getCurrentDate,
  formatDateToTimeZone,
  getCurrentMomentWithFeatures,
  setAuditDateInEntity,
  getTemplateRecoveryPassword,
  randomIntCode,
  getRecoveryPasswordURL,
  getTemplatePasswordChanged,
  getUserWithIdFromRequest,
  removeItemInArray,
  getConfigToFindByFilter
}
