'use strict'

var jwt=require('jwt-simple');
var moment=require('moment');
var helper=require('../services/helper');
var applogger=require('../services/applogger');

exports.ensureAuth=function(req,res,next)
{
  if(!req.headers.authorization)
  {
    return res.status(401).send({message:'Peticion no autorizada'});
  }

  var token = req.headers.authorization.replace(/['"]+/g,'');

  try
  {
    var payload=jwt.decode(token,helper.getAppData().AppConfig.jwt_secret);

    if(payload.exp <= moment().unix())
    {
      return res.status(401).send({message:'Token expirado'});
    }

  }catch(ex)
  {
    applogger.error(applogger.errorMessage(ex,"Error en ensureAuth"));
    return res.status(401).send({message:'Token no valido'});
  }

  req.user=payload;
  next();
}
