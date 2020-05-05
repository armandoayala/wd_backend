'use strict'

exports.settings=function(req,res,next)
{
  var locale=req.get('App-Locale');
  if(locale)
  {
    req.locale=locale;
  }
  else
  {
    req.locale='en';
  }

  next();

};
