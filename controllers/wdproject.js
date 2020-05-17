'use strict'

//modelos
var ObjectId = require('mongoose').Types.ObjectId;
var User = require('../models/user');
var WDProject = require('../models/wdproject');

//servicios
var helper = require('../services/helper');
var applogger = require('../services/applogger');

//Mensajes
const MSG_ERROR_ENTITY_EXISTS = "ERROR_WDPROJECT_EXISTS";

async function save(req, res) {
  var params = req.body;
  var wdProject = new WDProject();

  try {
    wdProject.name = params.name.toUpperCase();
    wdProject.note = "";
    wdProject.href = "";
    wdProject.data = [];
    wdProject.enabled = true;
    wdProject.user = helper.getUserWithIdFromRequest(req);
    wdProject = helper.setAuditDateInEntity(wdProject, false);

    const entityFound = await WDProject.findOne({ name: wdProject.name, user: wdProject.user });

    if (entityFound) {
      return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError(MSG_ERROR_ENTITY_EXISTS, null, req.locale));
    }

    const entitySaved = await wdProject.save();

    if (!entitySaved) {
      res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_SAVE", null, req.locale));
    }
    else {
      res.status(helper.getAppData().HttpStatus.success)
        .send(helper.getResponseOk("MENSAJE_SUCCESS",
          {
            id: entitySaved._id,
            name: entitySaved.name
          },
          req.locale));
    }
  }
  catch (err) {
    applogger.error(applogger.errorMessage(err, "Error al comprobar en BD"));
    return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_CHECK_DB", null, req.locale));
  }
}

async function update(req, res) {
  var entityToUpdate = req.body;

  try {
    const entFound = await WDProject.findOne({ $and: [{ name: { $eq: entityToUpdate.name } }, { _id: { $ne: req.params.id } }] });
    if (entFound) {
      return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError(MSG_ERROR_ENTITY_EXISTS, null, req.locale));
    }

    entityToUpdate = helper.setAuditDateInEntity(entityToUpdate, true);
    const resUpd = await WDProject.findByIdAndUpdate(req.params.id, entityToUpdate, { new: true });

    if (resUpd) {
      return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS", resUpd, req.locale));
    }
    else {
      return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_ENTITY_NOT_FOUND", null, req.locale));
    }

  }
  catch (err) {
    applogger.error(applogger.errorMessage(err, "Error al comprobar en BD"));
    return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_CHECK_DB", null, req.locale));
  }
}

async function addWDData(req, res) {
  var entityToAdd = req.body;
  var dateAudit = helper.getCurrentMomentWithFeatures();

  try {
    const resUpd = await WDProject.findByIdAndUpdate({ _id: req.params.id }, { updatedDate: dateAudit.moment, updatedUnix: dateAudit.unix, $push: { data: entityToAdd } }, { new: true });

    if (resUpd) {
      return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS", resUpd.data, req.locale));
    }
    else {
      return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_ENTITY_NOT_FOUND", null, req.locale));
    }
  }
  catch (err) {
    applogger.error(applogger.errorMessage(err, "Error al actualizar"));
    return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_UPDATE", null, req.locale));
  }

}

async function removeWDData(req, res) {

  var entityToRemove = req.body;
  var dateAudit = helper.getCurrentMomentWithFeatures();

  try {
    const resUpd = await WDProject.findByIdAndUpdate({ _id: req.params.id }, { updatedDate: dateAudit.moment, updatedUnix: dateAudit.unix, $pull: { data: { _id: entityToRemove.id } } }, { new: true });
    if (resUpd) {
      return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS", resUpd.data, req.locale));
    }
    else {
      return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_ENTITY_NOT_FOUND", null, req.locale));
    }
  }
  catch (err) {
    applogger.error(applogger.errorMessage(err, "Error al actualizar"));
    return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_UPDATE", null, req.locale));
  }
}

async function deleteOperation(req, res) {
  var entityId = req.params.id;

  try {
    const entityRemoved = await WDProject.findByIdAndRemove(entityId);

    if (entityRemoved) {
      return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS", entityRemoved, req.locale));
    }
    else {
      return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_ENTITY_NOT_FOUND", null, req.locale));
    }
  }
  catch (err) {
    applogger.error(applogger.errorMessage(err, "Error al eliminar"));
    return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_DELETE", null, req.locale));
  }
}

async function findByFilter(req, res) {

  try {

    var objConfigToFind = helper.getConfigToFindByFilter(req,
                                                        {
                                                          operator:"OR",
                                                          fnBuild:(queryRegex)=>{
                                                            return [
                                                              { name: queryRegex },
                                                              { note: queryRegex }
                                                            ];
                                                          }
                                                        });


    WDProject.find(objConfigToFind.filter)
      .sort((objConfigToFind.sort == null ? { name: 'asc' } : objConfigToFind.sort))
      .skip(objConfigToFind.pageOptions.page * objConfigToFind.pageOptions.limit)
      .limit(objConfigToFind.pageOptions.limit)
      .exec(function (errFind, docs) {

        if (errFind) {
          applogger.error(applogger.errorMessage(errFind, "Error al buscar"));
          return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_FIND", null, req.locale));
        }

        if (docs) {
          return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS", docs, req.locale));
        }
        else {
          return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("MENSAJE_NOT_FOUND_RESULTS", null, req.locale));
        }
      });
  }
  catch (err) {
    applogger.error(applogger.errorMessage(err, "Error al buscar"));
    return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_FIND", null, req.locale));
  }

}

async function findById(req, res) {
  try {
    var entityId = req.params.id;

    const entityFound = await WDProject.findById(entityId);
    if (entityFound) {
      return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS", entityFound, req.locale));
    }
    else {
      return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("MENSAJE_NOT_FOUND_RESULTS", null, req.locale));
    }

  }
  catch (err) {
    applogger.error(applogger.errorMessage(err, "Error al buscar"));
    return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_FIND", null, req.locale));
  }
}

module.exports =
{
  save,
  update,
  addWDData,
  removeWDData,
  deleteOperation,
  findByFilter,
  findById
};