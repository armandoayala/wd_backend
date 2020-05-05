'use strict'

var localeService=require('../services/localeservice');

function health(req,res)
{
  res.status(200).send({status:'UP'});
}

function translate(req,res)
{
  /*var locale=req.get('app-locale');
  if(locale)
  {
    localeService.setLocale(locale);
  }*/

  var text=localeService.translate('Hello',req.locale);

  res.status(200).send({message:text});
}

function auth(req,res)
{
  res.status(200).send({status:'Auth OK',user:req.user});
}


//Exporto el controller con sus metodos
module.exports =
{
  health,
  auth,
  translate
};
