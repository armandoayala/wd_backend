'use strict'
//modulos
var fs=require('fs');
var path=require('path');
var applogger=require('../services/applogger');

//modelos
var User=require('../models/user');
var Transaction=require('../models/transaction');


//acciones
function test(req,res)
{
  res.status(200).send({status:'transaction controller ok'});
}

function save(req,res)
{
  //Crear el objeto del usuario
  var entityToSave = new Transaction();
  var params = req.body;

  if(params.name
    && params.codigo)
  {
    entityToSave.name=params.name.toUpperCase();
    entityToSave.description=params.description;
    entityToSave.codigo=params.codigo;
    entityToSave.precio=params.precio;
    entityToSave.image=null;
    entityToSave.user=req.user.sub;

    Transaction.findOne({name:entityToSave.name,
                         codigo:entityToSave.codigo},(err,entityFound)=>{
       if(err)
       {
         applogger.error(applogger.errorMessage(err,"Error al comprobar en BD"));
         res.status(500).send({message:'Error al comprobar en BD: '+err.message});
       }
       else
       {
          if(entityFound)
          {
            res.status(400).send({message:'Entidad ya existe: '+entityFound.name});
          }
          else
          {
            entityToSave.save((err,entityStored)=>{
              if(err)
              {
                applogger.error(applogger.errorMessage(err,"Error al guardar"));
                res.status(500).send({message:'Error al guardar: '+err.message});
              }
              else
              {
                if(!entityStored)
                {
                  res.status(404).send({message:'No se ha podido registrar'});
                }
                else
                {
                  res.status(200).send({entity:entityStored});
                }
              }
            });
          }
       }
    });

  }
  else
  {
     res.status(400).send({message:'Datos incorrectos'});
  }

}

function findAll(req,res)
{
  Transaction.find({}).populate({path:'user'}).exec((err,results)=>{

    if(err)
    {
      applogger.error(applogger.errorMessage(err,"Error al buscar"));
      return res.status(500).send({message:'Error en petición'});
    }
    else
    {
      if(results)
      {
        return res.status(200).send({result:results});
      }
      else
      {
        return res.status(404).send({message:'No se han encontrado resultados'});
      }

    }
  });
}

function findById(req,res)
{

  var entityId = req.params.id;

  Transaction.findById(entityId).populate({path:'user'}).exec((err,entityFound)=>{

    if(err)
    {
      applogger.error(applogger.errorMessage(err,"Error al buscar por id"));
      return res.status(500).send({message:'Error en petición'});
    }
    else
    {
      if(entityFound)
      {
        return res.status(200).send({result:entityFound});
      }
      else
      {
        return res.status(404).send({message:'No se han encontrado entidad'});
      }

    }
  });
}

function update(req,res)
{
   var entityId=req.params.id;
   var entityToUpdate=req.body;

   Transaction.findByIdAndUpdate(entityId,entityToUpdate,{new:true},(err,entityUpdated)=>{
     if(err)
     {
       applogger.error(applogger.errorMessage(err,"Error al actualizar"));
       return res.status(500).send({message:'Error al actualizar'});
     }
     else
     {
        if(entityUpdated)
        {
          return res.status(200).send({message:'Entidad actualizada',entity:entityUpdated});
        }
        else
        {
          return res.status(404).send({message:'Entidad no encontrado'});
        }
     }

   });

}

function uploadImage(req,res)
{
  var entityId = req.params.id;
  var file_name='No subido';

  if(req.files)
  {
    var file_path=req.files.image.path;
    var file_split=file_path.split('\\');
    var file_name=file_split[2];

    var ext_split=file_name.split('\.');
    var file_ext=ext_split[1];

    if(file_ext=='png'
       || file_ext=='jpg'
       || file_ext=='jpeg')
    {

      Transaction.findByIdAndUpdate(entityId,{image:file_name},{new:true},(err,entityUpdated)=>{
        if(err)
        {
          applogger.error(applogger.errorMessage(err,"Error al actualizar - upload imagen"));
          return res.status(500).send({message:'Error al actualizar'});
        }
        else
        {
           if(entityUpdated)
           {
             return res.status(200).send({message:'Entidad actualizada',entity:entityUpdated});
           }
           else
           {
             return res.status(404).send({message:'Entidad no encontrada'});
           }
        }

      });
    }
    else
    {
       fs.unlink(file_path,(err)=>{
           if(err)
           {
             return res.status(404).send({message:'Extension no valida y archivo no borrado'});
           }
           else
           {
             return res.status(404).send({message:'Extension no valida'});
           }
       });

    }

  }
  else
  {
    return res.status(404).send({message:'No se han subido archivos'});
  }

}

function getImageFile(req,res)
{
    var imageFile=req.params.imageFile;
    var path_file='./uploads/transactions/'+imageFile;

    fs.exists(path_file,function(exists){
       if(exists)
       {
         res.sendFile(path.resolve(path_file));
       }
       else
       {
         return res.status(404).send({message:'Imagen no existe'});
       }

    });
}

function deleteEntity(req,res)
{
  var entityId=req.params.id;

  Transaction.findByIdAndRemove(entityId,(err,entityRemoved)=>{
     if(err)
     {
       applogger.error(applogger.errorMessage(err,"Error al eliminar"));
       return res.status(500).send({message:'Error en petición'});
     }
     else
     {
       if(entityRemoved)
       {
         return res.status(200).send({message:'Entidad borrada',entity:entityRemoved});
       }
       else
       {
         return res.status(404).send({message:'Entidad no encontrada'});
       }

     }


  });
}

//Exporto el controller con sus metodos
module.exports =
{
  test,
  save,
  findAll,
  findById,
  update,
  uploadImage,
  getImageFile,
  deleteEntity
};
