'use strict'

var bcrypt= require('bcrypt-nodejs');

//modelos
var ObjectId = require('mongoose').Types.ObjectId;
var User = require('../models/user');
var WDProject = require('../models/wdproject');

//servicios
var helper = require('../services/helper');
var applogger = require('../services/applogger');
var encoder=require('../services/encoder');

//Mensajes
const MSG_ERROR_ENTITY_EXISTS = "ERROR_WDPROJECT_EXISTS";

async function save(req, res) {
  var params = req.body;
  var wdProject = new WDProject();

  try {
    wdProject.name = params.name.toUpperCase();
    wdProject.note = "";
    wdProject.href = params.href;
    wdProject.client = params.client;
    wdProject.data = [];
    wdProject.status = helper.getAppData().Status.activo.code;
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

    entityToAdd.name=entityToAdd.name.toUpperCase()
    const entWDataFound = await WDProject.find({ $and: [{ 'wddata.name': entityToAdd.name }, { _id: req.params.id  }] });

    if(entWDataFound && entWDataFound.length > 0)
    {
      return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_WDPROJECT_WDDATA_EXISTS", null, req.locale)); 
    }

    if(entityToAdd.encode)
    {
      entityToAdd.value=encoder.encode(req.params.id,entityToAdd.name,entityToAdd.value);
    }

    const resUpd = await WDProject.findByIdAndUpdate({ _id: req.params.id }, { updatedDate: dateAudit.moment, updatedUnix: dateAudit.unix, $push: { wddata: entityToAdd } }, { new: true });

    if (resUpd) {
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

async function removeWDData(req, res) {

  var entityToRemove = req.body;
  var dateAudit = helper.getCurrentMomentWithFeatures();

  try {
    const resUpd = await WDProject.findByIdAndUpdate({ _id: req.params.id }, { updatedDate: dateAudit.moment, updatedUnix: dateAudit.unix, $pull: { wddata: { _id: entityToRemove.id } } }, { new: true });
    if (resUpd) {
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
      entityRemoved = await WDProject.findByIdAndRemove(entityId);
    }
    else {
      entityRemoved = await WDProject.findOne({ _id: { $eq: entityId } });

      if (entityRemoved) {
        entityRemoved = helper.setAuditDateInEntity(entityRemoved, false, true);
        entityRemoved.status = helper.getAppData().Status.eliminado.code;
        entityRemoved = await WDProject.findByIdAndUpdate(req.params.id, entityRemoved, { new: true });
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
    const resUpd = await WDProject.findByIdAndUpdate({ _id: req.params.id }, { updatedDate: dateAudit.moment, updatedUnix: dateAudit.unix, status: helper.getAppData().Status.activo.code }, { new: true });
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
    const resUpd = await WDProject.findByIdAndUpdate({ _id: req.params.id }, { updatedDate: dateAudit.moment, updatedUnix: dateAudit.unix, status: helper.getAppData().Status.inactivo.code }, { new: true });
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
            { client: queryRegex }
          ];
        }
      });

    let vCount = await WDProject.countDocuments(objConfigToFind.filter)

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

async function decodeWDData(req, res) {
  try {
    var bodyData = req.body;

    const wdProjectFound = await WDProject.findById(req.params.id);
    if (wdProjectFound) {

      if(wdProjectFound.wddata==null || wdProjectFound.wddata.length==0)
      {
        return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS", [], req.locale));
      }

      //Find User to Validate Password
      const userFound= await User.findById(req.user.sub)
      
      if(!userFound)
      {
        return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_USUARIO_NOT_EXISTS", null, req.locale));  
      }

      bcrypt.compare(bodyData.code,userFound.password,(err,check)=>{
        if(err)
        {
          applogger.error(applogger.errorMessage(err,"Error al check usuario en BD"));
          res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_CHECK_DB",null,req.locale));
        }
        else
        {
          if(!check)
          {
            res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_USUARIO_NOT_EXISTS",null,req.locale));
          }
          else
          {
            var wdDataResult=[]
            
            for (var i = 0; i < wdProjectFound.wddata.length; i++) {
              
              let entityWDData=wdProjectFound.wddata[i]
              if(entityWDData.encode)
              {
                let decodeData=encoder.decode(entityWDData.value)
                entityWDData.value=decodeData.data
              }
              
              wdDataResult=[...wdDataResult,entityWDData]
            }
            return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS", wdDataResult, req.locale));
          }
        }

      });
      
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

async function testEncode(req, res)
{
  var entityToAdd = req.body;  

  try {

    var encodedValue=encoder.encode("100","CursoML",entityToAdd.value)

    return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS", encodedValue, req.locale));
  }
  catch (err) {
    applogger.error(applogger.errorMessage(err, "Error al actualizar"));
    return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_UPDATE", null, req.locale));
  }
}

async function testDecode(req, res)
{
  try {

    var decodedData = encoder.decode(req.params.vdata)

    return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS", decodedData, req.locale));
  }
  catch (err) {
    applogger.error(applogger.errorMessage(err, "Error al actualizar"));
    return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_UPDATE", null, req.locale));
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
  findById,
  activate,
  inactivate,
  testEncode,
  testDecode,
  decodeWDData
};