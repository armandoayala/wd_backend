const nodemailer = require('nodemailer');

var helper=require('./helper');
var applogger=require('./applogger');
var util=require('util');


function sendMail(mailOptions)
{
  /*
  const mailOptions = {
  from: 'sender@email.com', // sender address
  to: 'to@email.com', // list of receivers
  subject: 'Subject of your email', // Subject line
  html: '<p>Your html here</p>'// plain text body
 };
  */

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
        user: helper.getAppData().AppConfig.mail.user,
        pass: helper.getAppData().AppConfig.mail.password
    },
  tls: { rejectUnauthorized: false }
  });



 return new Promise((resolve, reject)=>{
   transporter.sendMail(mailOptions, function (err, info) {
     if(err)
     {
       applogger.error(applogger.errorMessage(err,"Error al enviar correo"));
       transporter.close();
       reject(err);
     }
     else
     {
       applogger.info(applogger.infoMessage("Se envio correo",info));
       transporter.close();
       resolve(info);
     }
   });


 });

}

function sendMailRecoveryPassword(addressTo,userevent)
{

  return helper.getTemplateRecoveryPassword()
        .then(template=>{

          var message=(helper.getAppData().AppConfig.recoveryPasswordRandomCode==true) ? util.format(template,userevent.url,userevent.code) : util.format(template,userevent.url);

          const mailOptions = {
              from: 'support@workdesk.com', // sender address
              to: addressTo, // list of receivers
              subject: helper.getAppData().Constant.subjectRecoveryPassword, // Subject line
              html: message// plain text body
           };

           return this.sendMail(mailOptions);
        })
        .catch(err=>{
          applogger.error(applogger.errorMessage(err,"Error leyendo template para correo recovery password"));
          throw err;
        });

}

function sendMailPasswordChanged(user)
{

  return helper.getTemplatePasswordChanged()
        .then(template=>{

          var message=util.format(template,user.name,user.surname);

          const mailOptions = {
              from: 'support@workdesk.com', // sender address
              to: user.email, // list of receivers
              subject: helper.getAppData().Constant.subjectPasswordChanged, // Subject line
              html: message// plain text body
           };

           return this.sendMail(mailOptions);
        })
        .catch(err=>{
          applogger.error(applogger.errorMessage(err,"Error leyendo template para correo password changed"));
          throw err;
        });

}



module.exports=
{
  sendMail,
  sendMailRecoveryPassword,
  sendMailPasswordChanged
}
