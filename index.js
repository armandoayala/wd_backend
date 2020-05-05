'use strict'

const mongoose=require('mongoose');
const app=require('./app');
const helper=require('./services/helper');
const applogger=require('./services/applogger');
const data = require('./data/appdata');
const port=process.env.PORT || 3788;
//var port=process.env.PORT;//Toma el valor de una variable del sistema


mongoose.Promise=global.Promise;

//START APP
mongoose.connect(data.AppConfig.db_conn,{ useNewUrlParser: true, useFindAndModify: false })
          .then(()=>{
             //console.log("BASEAPP: La conexión a la BD se ha realizado correctamente - BD "+data.AppConfig.db_conn);
             helper.createUserAdmin().then(res=>{

               //console.log("BASEAPP: "+res.message);
               applogger.createLogger();


               app.listen(port,()=>{
                 //console.log("BASEAPP: Servidor local ejecutando con exito - PORT "+port);
                 applogger.info("La conexión a la BD se ha realizado correctamente - BD "+data.AppConfig.db_conn);
                 applogger.info(res.message);
                 applogger.info("Servidor local ejecutando con exito - PORT "+port);

               });

             }).catch(err=>applogger.error(applogger.errorMessage(err,"Error en inicio APP")));

           })
           .catch(err=>console.log(err));
