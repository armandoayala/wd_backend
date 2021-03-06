'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//*******cargar rutas******
var user_routes = require('./routes/user');
var manage_routes = require('./routes/manage');
var transaction_routes = require('./routes/transaction');
var accesslink_routes = require('./routes/accesslink');
var wdproject_routes = require('./routes/wdproject');
var wdknowledge_routes = require('./routes/wdknowledge');

//*****middlewares de body-parser*****
app.use(bodyParser.urlencoded({ extended: false }));
//lo que llega al body de una peticion se convierte a JSON
app.use(bodyParser.json());

//*******Configurar cabeceras y cors****
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Method, App-Locale');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});

//*******rutas bases*********
app.use('/api/workdesk/user', user_routes);
app.use('/api/workdesk/manage', manage_routes);
app.use('/api/workdesk/transaction', transaction_routes);
app.use('/api/workdesk/accesslink', accesslink_routes);
app.use('/api/workdesk/wdproject', wdproject_routes);
app.use('/api/workdesk/wdknowledge', wdknowledge_routes);


//*******Export module*************
module.exports = app;
