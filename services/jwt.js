'use strict'

var jwt=require('jwt-simple');
var moment=require('moment');
var helper=require('./helper');

function createToken (user)
{
  var payload=
  {
    sub:user._id,
    name:user.name,
    surname:user.surname,
    email:user.email,
    role:user.role,
    imagen:user.image,
    iat:moment().unix(),
    exp:moment().add(helper.getAppData().AppConfig.jwt_minutes_expire,'minutes').unix()
  };

  return jwt.encode(payload,helper.getAppData().AppConfig.jwt_secret);
};

function encodeWDData (wdProjectId,wdProjectName,value)
{
  var payload=
  {
    sub:wdProjectId,
    name:wdProjectName,
    data:value
  };

  return jwt.encode(payload,helper.getAppData().AppConfig.jwt_secret);
};

function decodeWDData (data)
{
  return jwt.decode(data,helper.getAppData().AppConfig.jwt_secret);
};

module.exports =
{
  createToken,
  encodeWDData,
  decodeWDData
};
