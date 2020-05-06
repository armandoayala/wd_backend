'use strict'

var helper=require('./helper');
var winston = require('winston');
require('winston-daily-rotate-file');

const { splat, combine, timestamp, label, printf } = winston.format;
const myFormat = printf(({ level, message, label, timestamp}) => {
  return `[${timestamp}] [${label}] [${level}] -> [MENSAJE: ${message}]`;
});

var logger={};

function createLogger()
{
  /*var transportRollingFile = new (winston.transports.DailyRotateFile)(helper.getAppData().AppConfig.logger);

  logger = winston.createLogger({
      format: combine(
        label({ label: 'workdesk' }),
        timestamp(),
        splat(),
        myFormat
        ),
          transports: [
                 transportRollingFile
          ]
          });

  if (helper.getAppData().AppConfig.NODE_ENV !== 'PROD') {
      logger.add(new winston.transports.Console());
  }*/
  logger = winston.createLogger({
    format: combine(
      label({ label: 'workdesk' }),
      timestamp(),
      splat(),
      myFormat
      ),
      transports: []
        });

    logger.add(new winston.transports.Console());
  
}

function getLogger()
{
  return logger;
}

function infoMessage(message,extra)
{
  var result={};
  result.message=message;
  result.extra=extra;

  return result;
}

function errorMessage(error,extra)
{
  var result={};
  result.message=error.message;
  result.stack=error.stack;
  result.extra=extra;

  return result;
}

function info(message)
{
  if(message && logger)
  {
    logger.info(formatObject(message));
  }
}

function error(message)
{
  if(message && logger)
  {
    logger.error(formatObject(message));
  }
}

function isObject (item) {
  return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

function formatObject(param) {
  if (isObject(param)) {
    return JSON.stringify(param);
  }
  return param;
}

module.exports=
{
  createLogger,
  getLogger,
  info,
  error,
  infoMessage,
  errorMessage
}
