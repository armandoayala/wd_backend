'use strict'
//modulos
var bcrypt= require('bcrypt-nodejs');
var fs=require('fs');
var path=require('path');
var moment=require('moment');

//modelos
var ObjectId = require('mongoose').Types.ObjectId;
var User=require('../models/user');
var Login=require('../models/login');
var Userevent=require('../models/userevent');

//servicios
var jwt=require('../services/jwt');
var helper=require('../services/helper');
var applogger=require('../services/applogger');
var mail=require('../services/mail');

var valorTest=null;
const cache=require('../services/cache');

//acciones
function test(req,res)
{
  valorTest=cache.get("key_test");

  if(valorTest)
  {
    console.log("VALOR DESDE CACHE: "+valorTest);
  }
  else
  {
    valorTest="HOLA ARGENTINA!";
    cache.put("key_test",valorTest);

    console.log("SE COLOCA VALOR EN CACHE: "+valorTest);
  }

  res.status(200).send({status:'user controller ok',valor:valorTest});
}

function saveUser(req,res)
{
  //Crear el objeto del usuario
  var user = new User();
  var params = req.body;

  if(params.password
    && params.name
    && params.surname
    && params.email)
  {
    user.name=params.name;
    user.surname=params.surname;
    user.email=params.email;
    user.role='ROLE_USER';
    user.image=null;
    user.locale=params.locale;

    if(!user.locale)
    {
      user.locale=helper.getAppData().locale.eeuu.lang;
    }


    User.findOne({email:user.email.toLowerCase()},(err,userFound)=>{
       if(err)
       {
         applogger.error(applogger.errorMessage(err,"Error al comprobar usuario en BD"));
         res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_CHECK_DB",null,req.locale));
       }
       else
       {
          if(userFound)
          {
            res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_USUARIO_EMAIL_EXISTS",null,req.locale));
          }
          else
          {
            bcrypt.hash(params.password,null,null,function(err,hash)
            {
              if(err)
              {
                applogger.error(applogger.errorMessage(err,"Error en encriptacion de password"));
                res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_USUARIO_ENCRIPT_PASSWORD",null,req.locale));
                return;
              }

               user.password=hash;
               user.save((err,userStore)=>{
                 if(err)
                 {
                   applogger.error(applogger.errorMessage(err,"Error en encriptacion de password"));
                   res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_USUARIO_ENCRIPT_PASSWORD",null,req.locale));
                 }
                 else
                 {
                   if(!userStore)
                   {
                     res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_SAVE",null,req.locale));
                   }
                   else
                   {
                     res.status(helper.getAppData().HttpStatus.success)
                        .send(helper.getResponseOk("MENSAJE_SUCCESS",
                                                   {name:userStore.name,
                                                    surname:userStore.surname,
                                                    email:userStore.email,
                                                    role:userStore.role,
                                                    locale:userStore.locale},
                                                    req.locale));
                   }
                 }
               });
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

function login(req,res)
{
  var login = new Login();
  var params = req.body;

  var email = params.email;
  var password= params.password;
  var is_admin=false;

  User.findOne({email:email.toLowerCase()},(err,userFound)=>{
     if(err)
     {
       applogger.error(applogger.errorMessage(err,"Error al comprobar usuario en BD"));
       res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_CHECK_DB",null,req.locale));
     }
     else
     {
       if(userFound)
       {
         bcrypt.compare(password,userFound.password,(err,check)=>{
            if(err)
            {
              applogger.error(applogger.errorMessage(err,"Error al check usuario en BD"));
              res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_CHECK_DB",null,req.locale));
            }
            else
            {
              if(check)
              {
                  var currentMoment=helper.getCurrentMomentWithFeatures();

                  login.token=jwt.createToken(userFound);
                  login.loggedAtDate=currentMoment.moment;
                  login.loggedAtUnix=currentMoment.unix;
                  login.logoutedAtDate=null;
                  login.logoutedAtUnix=null;
                  login.user=userFound;

                  login.save((err,loginStore)=>{
                    if(err)
                    {
                      applogger.error(applogger.errorMessage(err,"Error al registrar login"));
                      res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_USUARIO_LOGIN_SAVE",null,req.locale));
                    }
                    else
                    {
                      if(!loginStore)
                      {
                        res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_USUARIO_LOGIN_SAVE",null,req.locale));
                      }
                      else
                      {
                        if(userFound.role===helper.getAppData().AppRole.Admin)
                        {
                          is_admin=true;
                        }

                        var dataReply= {token:login.token,user:{name:userFound.name,
                                                                      surname:userFound.surname,
                                                                      email:userFound.email,
                                                                      isAdmin:is_admin,
                                                                      locale:userFound.locale}};

                        res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS",dataReply,req.locale));

                      }
                    }
                  });


              }
              else
              {
                res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_USUARIO_NOT_EXISTS",null,req.locale));
              }
            }
         });

       }
       else
       {
         res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_USUARIO_NOT_EXISTS",null,req.locale));
       }
     }


  });

}

/*function getLogin(req,res)
{
  var login = new Login();
  var params = req.body;

  var paramToken = params.token;

  Login.findOne({token:paramToken},(err,loginFound)=>{
     if(err)
     {
       res.status(500).send({message:'Error al buscar login en BD: '+err});
     }
     else
     {
       if(loginFound)
       {
         res.status(200).send(loginFound);
       }
       else
       {
         res.status(404).send({message:'Login token no existe'});
       }
     }


  });

}*/

function updateUser(req,res)
{
   var userId=req.params.id;
   var userToUpdate=req.body;

   if(userId != req.user.sub)
   {
      return res.status(helper.getAppData().HttpStatus.forbidden).send(helper.getResponseError("ERROR_NOT_ALLOWED",null,req.locale));
   }

   User.findByIdAndUpdate(userId,userToUpdate,{new:true},(err,userUpdated)=>{
     if(err)
     {
       applogger.error(applogger.errorMessage(err,"Error al actualizar usuario"));
       return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_UPDATE",null,req.locale));
     }
     else
     {
        if(userUpdated)
        {
          return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS",userUpdated,req.locale));
        }
        else
        {
          return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_USUARIO_NOT_EXISTS",null,req.locale));
        }
     }

   });

}

function uploadImage(req,res)
{
  var userId = req.params.id;
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
      if(userId != req.user.sub)
      {
         return res.status(helper.getAppData().HttpStatus.forbidden).send(helper.getResponseError("ERROR_NOT_ALLOWED",null,req.locale));
      }

      User.findByIdAndUpdate(userId,{image:file_name},{new:true},(err,userUpdated)=>{
        if(err)
        {
          applogger.error(applogger.errorMessage(err,"Error al actualizar usuario"));
          return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_UPDATE",null,req.locale));
        }
        else
        {
           if(userUpdated)
           {
             return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS",userUpdated,req.locale));
           }
           else
           {
             return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_USUARIO_NOT_EXISTS",null,req.locale));
           }
        }

      });
    }
    else
    {
       fs.unlink(file_path,(err)=>{
           if(err)
           {
             return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_FILE_NOT_DELETED",null,req.locale));
           }
           else
           {
             return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_INVALID_FILE_EXTENSION",null,req.locale));
           }
       });

    }

  }
  else
  {
    return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_FILE_NOT_UPLOADED",null,req.locale));
  }

}

function getImageFile(req,res)
{
    var imageFile=req.params.imageFile;
    var path_file='./uploads/users/'+imageFile;

    fs.exists(path_file,function(exists){
       if(exists)
       {
         res.sendFile(path.resolve(path_file));
       }
       else
       {
         res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_FILE_NOT_UPLOADED",null,req.locale));
       }

    });
}

function getUsersByRole(req,res)
{
  var roleId = req.params.role;

  User.find({role:roleId}).exec((err,usersFound)=>
  {
    if(err)
    {
      applogger.error(applogger.errorMessage(err,"Error en filtrar usuarios por rol"));
      return res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_USUARIO_GET_BYUSER",null,req.locale));
    }
    else
    {
      if(usersFound)
      {
        return res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("MENSAJE_SUCCESS",usersFound,req.locale));
      }
      else
      {
        return res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_NOT_FOUND_RESULTS",null,req.locale));
      }

    }

  });

}

function recoveryPassword(req,res)
{
  var params = req.body;

  var email = params.email;
  var userevent=new Userevent();

  User.findOne({email:email.toLowerCase()},(err,userFound)=>{
     if(err)
     {
       applogger.error(applogger.errorMessage(err,"Error al comprobar usuario en BD"));
       res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_CHECK_DB",null,req.locale));
     }
     else
     {
       if(userFound)
       {
         var currentMoment=helper.getCurrentMomentWithFeatures();

         userevent.type=helper.getAppData().AppUserEvent.recoveryPassword;
         userevent.code=helper.randomIntCode(helper.getAppData().AppConfig.minValueRandomCode,helper.getAppData().AppConfig.maxValueRandomCode);
         userevent.createdDate=currentMoment.moment;
         userevent.createdUnix=currentMoment.unix;
         userevent.updatedDate=null;
         userevent.updatedUnix=null;
         userevent.expireCodeUnix=moment().add(helper.getAppData().AppConfig.amountTimeExpireCode,helper.getAppData().AppConfig.unitTimExpireCode).unix()
         userevent.url=  helper.getRecoveryPasswordURL();
         userevent.dataJSON=null;
         userevent.user=userFound;

         userevent.save((err,usereventStored)=>{

           if(err)
           {
             applogger.error(applogger.errorMessage(err,"Error al registrar evento"));
             res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_EVENT_SAVE",null,req.locale));
           }
           else
           {
             if(!usereventStored)
             {
              res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_EVENT_SAVE",null,req.locale));
             }
             else
             {
               mail.sendMailRecoveryPassword(userFound.email,usereventStored)
                   .then(info=>{

                     res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("SUCCESS_USUARIO_RECOVERY_PASSWORD",null,req.locale));
                   })
                   .catch(err => {
                     res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_USUARIO_RECOVERY_PASSWORD",null,req.locale));
                   });

             }
           }

         });

       }
       else
       {

         res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_USUARIO_NOT_EXISTS",null,req.locale));
       }
     }


  });

}

function changePassword(req,res)
{
  var params = req.body;

  var email = params.email;
  var eventCode = params.code;
  var passwordUser = params.password;

  if(!email || !eventCode || !passwordUser)
  {
     return res.status(helper.getAppData().HttpStatus.bad_request).send(helper.getResponseError("ERROR_INCORRECT_DATA",null,req.locale));
  }

  User.findOne({email:email.toLowerCase()},(err,userFound)=>{
     if(err)
     {
       applogger.error(applogger.errorMessage(err,"Error al comprobar usuario en BD"));
       res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_CHECK_DB",null,req.locale));
     }
     else
     {
       if(userFound)
       {
         //Find UserEvent
         Userevent.findOne({user:new ObjectId(userFound._id),code:eventCode,updatedUnix:null},(err,userEventFound)=>{
           if(err)
           {
             applogger.error(applogger.errorMessage(err,"Error al buscar evento de cambio de password con codigo y correo especificado"));
             res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_EVENT_RECOVERYPASSWORD_FIND",null,req.locale));
           }
           else
           {
             if(!userEventFound)
             {
               res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_EVENT_NOT_FOUND",null,req.locale));
             }
             else
             {
                if(userEventFound.expireCodeUnix <= moment().unix())
                {
                  res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_EVENT_RECOVERYPASSWORD_CODE_EXPIRED",null,req.locale));
                }
                else
                {

                  bcrypt.hash(passwordUser,null,null,function(err,hash){
                    if(err)
                    {
                      applogger.error(applogger.errorMessage(err,"Error al generar hash para nueva password"));
                      res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_USUARIO_ENCRIPT_PASSWORD",null,req.locale));
                    }
                    else
                    {
                      User.findByIdAndUpdate(userFound._id,{password:hash},{new:true},(err,userUpdated)=>{
                        if(err)
                        {
                          applogger.error(applogger.errorMessage(err,"Error al actualizar password"));
                          res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_UPDATE",null,req.locale));
                        }
                        else
                        {
                           if(userUpdated)
                           {
                            var currentMoment=helper.getCurrentMomentWithFeatures();

                             Userevent.findByIdAndUpdate(userEventFound._id,{updatedDate:currentMoment.moment,updatedUnix:currentMoment.unix},{new:true},(err,userEventUpdated)=>{
                                if(err)
                                {
                                  applogger.error(applogger.errorMessage(err,"Error al actualizar evento de cambio de password"));
                                  res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_UPDATE",null,req.locale));
                                }
                                else
                                {
                                  if(!userEventUpdated)
                                  {
                                    res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_EVENT_NOT_FOUND",null,req.locale));
                                  }
                                  else
                                  {

                                    mail.sendMailPasswordChanged(userFound)
                                        .then(info=>{
                                          res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("SUCCESS_EVENT_RECOVERYPASSWORD",null,req.locale));
                                        })
                                        .catch(err => {
                                          res.status(helper.getAppData().HttpStatus.success).send(helper.getResponseOk("SUCCESS_EVENT_RECOVERYPASSWORD_NOTSENDMAIL",null,req.locale));
                                        });

                                  }
                                }

                             });

                           }
                           else
                           {
                             res.status(helper.getAppData().HttpStatus.internal_error_server).send(helper.getResponseError("ERROR_USUARIO_NOT_EXISTS",null,req.locale));
                           }
                        }

                      });
                    }

                  });
                }
             }

           }

         });


       }
       else
       {

         res.status(helper.getAppData().HttpStatus.not_found).send(helper.getResponseError("ERROR_USUARIO_NOT_EXISTS",null,req.locale));
       }
     }


  });

}

//Exporto el controller con sus metodos
module.exports =
{
  test,
  saveUser,
  login,
  updateUser,
  uploadImage,
  getImageFile,
  getUsersByRole,
  recoveryPassword,
  changePassword
};
