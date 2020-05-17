'use strict'
//modulos
var fs=require('fs');
var path=require('path');
var moment=require('moment');

//modelos
var ObjectId = require('mongoose').Types.ObjectId;
var User=require('../models/user');
var Accesslink=require('../models/accesslinks');

//servicios
var helper=require('../services/helper');
var applogger=require('../services/applogger');

const cache=require('../services/cache');

function save(req,res)
{
  var params = req.body;
  var accesslink=new Accesslink();

  if(params.title
    && params.url)
  {
    accesslink.title=params.title.toUpperCase();
    accesslink.url=params.url;
    accesslink.description=params.description;
    accesslink.enabled=true;
    accesslink.image=params.image;
    accesslink.user=helper.getUserWithIdFromRequest(req);

    accesslink=helper.setAuditDateInEntity(accesslink,false);

    Accesslink.findOne({title:accesslink.title,user:accesslink.user},(err,entityFound)=>{
       if(err)
       {
         applogger.error(applogger.errorMessage(err,"Error al comprobar en BD"));
         res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_CHECK_DB",null,req.locale));
       }
       else
       {
          if(entityFound)
          {
            res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_ACCESSLINK_TITLE_EXISTS",null,req.locale));
          }
          else
          {
              accesslink.save((err,entitySaved)=>{
                if(err)
                {
                  applogger.error(applogger.errorMessage(err,"Error al registrar en BD"));
                  res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_SAVE",null,req.locale));
                }
                else
                {
                  if(!entitySaved)
                  {
                    res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_SAVE",null,req.locale));
                  }
                  else
                  {
                    res.status(helper.getAppData().HttpStatus.success)
                       .send(helper.getResponseOk("MENSAJE_SUCCESS",
                                                  {title:entitySaved.title,
                                                   url:accesslink.url,
                                                   description:accesslink.description,
                                                   enabled:accesslink.enabled,
                                                   image:accesslink.image,
                                                   user:accesslink.user.sub},
                                                   req.locale));
                  }
                }
              });
          }
       }
    });

  }
  else
  {
     res.status(helper.getAppData().HttpStatus.bad_request).send(helper.getResponseError("ERROR_INCORRECT_DATA",null,req.locale));
  }

}

function update(req,res)
{
   var entityToUpdate=req.body;

   Accesslink.findOne({ $and: [ { title: { $eq: entityToUpdate.title } }, { _id: { $ne: req.params.id } } ] } ,(err,entityFound)=>{
        if(err)
        {
          applogger.error(applogger.errorMessage(err,"Error al comprobar en BD"));
          return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_CHECK_DB",null,req.locale));
        } 
    
        if(entityFound)
        {
          res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_ACCESSLINK_TITLE_EXISTS",null,req.locale));
        }
        else
        {
          entityToUpdate=helper.setAuditDateInEntity(entityToUpdate,true);

          Accesslink.findByIdAndUpdate(req.params.id,entityToUpdate,{new:true},(err,entityUpdated)=>{
            if(err)
            {
              applogger.error(applogger.errorMessage(err,"Error al actualizar"));
              return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_UPDATE",null,req.locale));
            }
            else
            {
               if(entityUpdated)
               {
                 return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS",entityUpdated,req.locale));
               }
               else
               {
                 return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_ACCESSLINK_NOT_FOUND",null,req.locale));
               }
            }

          });
        }

   });
}

function deleteOperation(req,res)
{
  var entityId=req.params.id;

  Accesslink.findByIdAndRemove(entityId,(err,entityRemoved)=>{
     if(err)
     {
       applogger.error(applogger.errorMessage(err,"Error al eliminar"));
       return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_DELETE",null,req.locale));
     }

     else
     {
       if(entityRemoved)
       {
         return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS",entityRemoved,req.locale));
       }
       else
       {
         return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_ACCESSLINK_NOT_FOUND",null,req.locale));
       }
     }
  });
}

function findAll(req,res)
{
  var entityReqFilter=req.body;

  var filter={};
  filter.user=req.user.sub;

  if(entityReqFilter)
  {
      //Enabled
       if (typeof(entityReqFilter.enabled) !== 'undefined')
       {
           filter.enabled=entityReqFilter.enabled;
       }

  }

  Accesslink.find(filter).exec((err,results)=>{

    if(err)
    {
      applogger.error(applogger.errorMessage(err,"Error al buscar"));
      return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_FIND",null,req.locale));
    }
    else
    {
      if(results)
      {
        return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS",results,req.locale));
      }
      else
      {
        return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("MENSAJE_NOT_FOUND_RESULTS",null,req.locale));
      }
    }
  });
}

function findById(req,res)
{

  var entityId = req.params.id;

  Accesslink.findById(entityId).exec((err,entityFound)=>{

    if(err)
    {
      applogger.error(applogger.errorMessage(err,"Error al buscar"));
      return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_FIND",null,req.locale));
    }
    else
    {
      if(entityFound)
      {
        return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS",entityFound,req.locale));
      }
      else
      {
        return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("MENSAJE_NOT_FOUND_RESULTS",null,req.locale));
      }

    }
  });
}

module.exports =
{
  save,
  update,
  deleteOperation,
  findAll,
  findById
};
