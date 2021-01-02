'use strict'

const mongoose=require('mongoose');
const app=require('./app');
const helper=require('./services/helper');
const applogger=require('./services/applogger');
const port=process.env.PORT || 3789;

mongoose.Promise=global.Promise;

//START APP
mongoose.connect(helper.getAppData().AppConfig.db_conn,{ useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true  })
          .then(()=>{

            applogger.createLogger();
             //console.log("BASEAPP: La conexión a la BD se ha realizado correctamente - BD "+data.AppConfig.db_conn);
             helper.createUserAdmin().then(res=>{

               
               app.listen(port,()=>{
                 //console.log("BASEAPP: Servidor local ejecutando con exito - PORT "+port);
                 applogger.info("La conexión a la BD se ha realizado correctamente - BD "+helper.getAppData().AppConfig.db_conn);
                 applogger.info(res.message);
                 applogger.info("Servidor local ejecutando con exito - PORT "+port);

               });

             }).catch(err=>applogger.error(applogger.errorMessage(err,"Error en inicio APP")));

           })
           .catch(err=>console.log(err));
