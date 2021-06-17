'use strict'

//modelos
var ObjectId = require('mongoose').Types.ObjectId;
var User = require('../models/user');
var WDKnowledge = require('../models/wdknowledge');
var WDTag = require('../models/wdtag');

//servicios
var helper = require('../services/helper');
var applogger = require('../services/applogger');

//Mensajes
const ERROR_WDKENTITY_EXISTS = "ERROR_WDKNOWLEDGE_EXISTS";

async function save(req, res) {
  var params = req.body;
  try {

    var wdEntity = new WDKnowledge(params);

    wdEntity.name = wdEntity.name.toUpperCase();
    wdEntity.status = helper.getAppData().Status.activo.code;
    wdEntity.user = helper.getUserWithIdFromRequest(req);
    wdEntity = helper.setAuditDateInEntity(wdEntity, false);

    const entityFound = await WDKnowledge.findOne({ name: wdEntity.name, user: wdEntity.user });

    if (entityFound) {
      return res.status(helper.getAppData().HttpStatus.bad_request).send(helper.getResponseError(ERROR_WDKENTITY_EXISTS, null, req.locale));
    }

    const entitySaved = await wdEntity.save();

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

    const entFound = await WDKnowledge.findOne({ $and: [{ name: { $eq: entityToUpdate.name } }, { _id: { $ne: req.params.id } }] });
    if (entFound) {
      return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError(ERROR_WDKENTITY_EXISTS, null, req.locale));
    }

    entityToUpdate = helper.setAuditDateInEntity(entityToUpdate, true);
    const resUpd = await WDKnowledge.findByIdAndUpdate(req.params.id, entityToUpdate, { new: true });

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

async function addWDTag(req, res) {
  var entityToAdd = req.body;
  var entityId = req.params.id;
  var wdTag = new WDTag();

  try {

    wdTag.value = entityToAdd.value;
    wdTag.user = helper.getUserWithIdFromRequest(req);

    if (!wdTag.value) {
      return res.status(helper.getAppData().HttpStatus.bad_request).send(helper.getResponseError("ERROR_DATA_NOT_VALID", null, req.locale));
    }

    const wdknowledgeFound = await WDKnowledge.findOne({ _id: entityId }).populate("tags");
    if (!wdknowledgeFound) {
      return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_ENTITY_NOT_FOUND", null, req.locale));
    }

    wdTag.value = wdTag.value.toUpperCase();

    if (wdknowledgeFound.tags) {
      let tagFound = wdknowledgeFound.tags.filter(tag => tag.value.toUpperCase() == wdTag.value);
      if (tagFound && tagFound.length > 0) {
        return res.status(helper.getAppData().HttpStatus.bad_request).send(helper.getResponseError("WDKNOW_TAG_ALREADY_EXISTS", null, req.locale));
      }
    }

    let wdTagSaved = await wdTag.save();
    let wdKnowUpdated = await WDKnowledge.findByIdAndUpdate(
      wdknowledgeFound._id,
      { $push: { tags: wdTagSaved._id } },
      { new: true, useFindAndModify: false }
    );

    if (wdKnowUpdated) {
      return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS", wdKnowUpdated, req.locale));
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

async function removeWDTag(req, res) {

  var dateAudit = helper.getCurrentMomentWithFeatures();

  try {

    const resUpd = await WDKnowledge.findByIdAndUpdate({ _id: req.params.id }, { updatedDate: dateAudit.moment, updatedUnix: dateAudit.unix, $pull: { tags: req.params.tag_id } }, { new: true });
    if (resUpd) {
      await WDTag.findByIdAndRemove(req.params.tag_id);
      return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS", resUpd.wddata, req.locale));
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
  var type = req.params.type;

  try {
    let entityRemoved;
    if (type == 'wd-del-1') {
      entityRemoved = await WDKnowledge.findByIdAndRemove(entityId);
    }
    else {
      entityRemoved = await WDKnowledge.findOne({ _id: { $eq: entityId } });

      if (entityRemoved) {
        entityRemoved = helper.setAuditDateInEntity(entityRemoved, false, true);
        entityRemoved.status = helper.getAppData().Status.eliminado.code;
        entityRemoved = await WDKnowledge.findByIdAndUpdate(req.params.id, entityRemoved, { new: true });
      }
    }


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

async function activate(req, res) {
  var dateAudit = helper.getCurrentMomentWithFeatures();

  try {
    const resUpd = await WDKnowledge.findByIdAndUpdate({ _id: req.params.id }, { updatedDate: dateAudit.moment, updatedUnix: dateAudit.unix, status: helper.getAppData().Status.activo.code }, { new: true });
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

async function inactivate(req, res) {
  var dateAudit = helper.getCurrentMomentWithFeatures();

  try {
    const resUpd = await WDKnowledge.findByIdAndUpdate({ _id: req.params.id }, { updatedDate: dateAudit.moment, updatedUnix: dateAudit.unix, status: helper.getAppData().Status.inactivo.code }, { new: true });
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

async function findByFilter(req, res) {

  try {

    var objConfigToFind = helper.getConfigToFindByFilter(req,
      {
        operator: "OR",
        fnBuild: (queryRegex) => {
          return [
            { name: queryRegex },
          ];
        }
      });

    let vCount = await WDKnowledge.countDocuments(objConfigToFind.filter)

    WDKnowledge.find(objConfigToFind.filter)
      .sort((objConfigToFind.sort == null ? { name: 'asc' } : objConfigToFind.sort))
      .skip(objConfigToFind.pageOptions.page * objConfigToFind.pageOptions.limit)
      .limit(objConfigToFind.pageOptions.limit)
      .populate("tags")
      .exec(function (errFind, docs) {

        if (errFind) {
          applogger.error(applogger.errorMessage(errFind, "Error al buscar"));
          return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_FIND", null, req.locale));
        }

        if (docs) {
          return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS", { count: vCount, hasMore: objConfigToFind.pageOptions.limit == docs.length, result: docs }, req.locale));
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

    const entityFound = await WDKnowledge.findById(entityId).populate("tags");
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
  addWDTag,
  removeWDTag,
  deleteOperation,
  activate,
  inactivate,
  findByFilter,
  findById
};