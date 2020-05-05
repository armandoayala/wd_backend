'use strict'

var jwt=require('jwt-simple');
var moment=require('moment');
var helper=require('./helper');

exports.createToken=function(user)
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
    exp:moment().add(1,'days').unix()
  };

  return jwt.encode(payload,helper.getAppData().AppConfig.jwt_secret);
};
