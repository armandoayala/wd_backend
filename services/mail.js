const sgMail = require('@sendgrid/mail');

var helper = require('./helper');
var applogger = require('./applogger');
var util = require('util');

sgMail.setApiKey(helper.getAppData().AppConfig.mail.SENDGRID_API_KEY);

function sendMail(mailOptions) {

  console.log(JSON.stringify(helper.getAppData().AppConfig.mail))
  console.log("EMAIL FROM: " + helper.getAppData().AppConfig.mail.SENDGRID_EMAIL_USER)

  var msg = {
    to: mailOptions.to,
    from: {
      email: helper.getAppData().AppConfig.mail.SENDGRID_EMAIL_USER
    },
    subject: mailOptions.subject,
    html: mailOptions.content
  };

  return new Promise((resolve, reject) => {
    sgMail.send(msg).then((sent) => {
      applogger.info(applogger.infoMessage("Se envio correo", sent));
      resolve(sent);
    })
      .catch((err) => {
        applogger.error(applogger.errorMessage(err, "Error al enviar correo"));
        reject(err);
      });
  });

}

function sendMailRecoveryPassword(addressTo, userevent) {

  return helper.getTemplateRecoveryPassword()
    .then(template => {

      var message = (helper.getAppData().AppConfig.recoveryPasswordRandomCode == "1") ? util.format(template, userevent.url, userevent.code) : util.format(template, userevent.url);

      const mailOptions = {
        to: addressTo, // list of receivers
        subject: helper.getAppData().Constant.subjectRecoveryPassword, // Subject line
        content: message// plain text body
      };

      return this.sendMail(mailOptions);
    })
    .catch(err => {
      applogger.error(applogger.errorMessage(err, "Error leyendo template para correo recovery password"));
      throw err;
    });

}

function sendMailPasswordChanged(user) {

  return helper.getTemplatePasswordChanged()
    .then(template => {

      var message = util.format(template, user.name, user.surname);

      const mailOptions = {
        to: user.email, // list of receivers
        subject: helper.getAppData().Constant.subjectPasswordChanged, // Subject line
        content: message// plain text body
      };

      return this.sendMail(mailOptions);
    })
    .catch(err => {
      applogger.error(applogger.errorMessage(err, "Error leyendo template para correo password changed"));
      throw err;
    });

}

function sendMailWelcomeUser(addressTo, userEntity) {

  return helper.getTemplateWelcomeUser()
    .then(template => {

      var urlParsed = helper.getWelcomeUserURL(userEntity._id, userEntity.codeAuth);
      var message = util.format(template, urlParsed);

      const mailOptions = {
        to: addressTo, // list of receivers
        subject: helper.getAppData().Constant.subjectWelcomeUser, // Subject line
        content: message// plain text body
      };

      return this.sendMail(mailOptions);
    })
    .catch(err => {
      applogger.error(applogger.errorMessage(err, "Error leyendo template para welcome user"));
      throw err;
    });

}

module.exports =
{
  sendMail,
  sendMailRecoveryPassword,
  sendMailPasswordChanged,
  sendMailWelcomeUser
}
