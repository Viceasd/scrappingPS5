const path = require('path');
const logger = require('morgan');
const express = require('express');
const { sendResponse } = require('./app/helpers');
const { fetchAuthorProfile } = require('./app/scotch');
const { fetchPCFactoryProfile} = require('./app/scotch');
const { fetchLiderProfile} = require('./app/scotch');
const { fetchParisProfile} = require('./app/scotch');
var nodemailer = require('nodemailer');

var alive = true;

const app = express();
const port = process.env.PORT || 3000;

app.set('port', port);
app.use(logger('dev'));
app.use('/', express.static(path.resolve(__dirname, 'public')));

app.get('/scotch/:author', (req, res, next) => {
	const author = req.params.author;
	sendResponse(res)(fetchAuthorProfile(author));
});

app.get('/pcFactory', (req,res, next) => {
	
	console.log(fetchPCFactoryProfile(req));
	
	return sendResponse(res)(fetchPCFactoryProfile(req));
});

app.get('/lider', (req,res, next) => {
	let respuesta =fetchLiderProfile(req);
	console.log(respuesta);
	sendResponse(res)(fetchLiderProfile(req));
});

app.get('/paris', (req,res, next) => {
	let respuesta =fetchParisProfile(req);
	sendResponse(res)(fetchParisProfile(req));
});

app.get('/alive/:seguir', (req,res, next) => {
	alive = req.params.seguir
	console.log("sigue vivo: "+alive);
	
	envioCorreo(link);  
	sendResponse(res)(alive);
});

app.get('/vive', (req,res, next) => {	
	console.log("sigue vivo: "+alive);
	//res.params.alive = JSON.parse(alive);
	sendResponse('{"status":"failure","code":500,"message":"Request failed."}');
});



function sleep(millis) {
	return new Promise(resolve => setTimeout(resolve, millis));
  }
  
  // Usage in async function
  async function sleepFiveMinutes() {
	await sleep(1000*60*5)
	console.log("five minutes has elapsed")
  }
  
  // Usage in normal function
  function test2() {
	sleep(1000).then(() => {
	  console.log("one second has elapsed")
	});
  }
  


// crear llamado a metodos 
app.get('/scanPages', (req,res, next) => {
	let respuesta;
	while(alive){
		respuesta=fetchPCFactoryProfile(req);
		if(!respuesta.includes("Ficha Producto No disponible")){
			envioCorreo(respuesta);
		}
		respuesta = fetchLiderProfile(req);
		if(!respuesta.includes("404")){
			envioCorreo(respuesta);
		}		
		sleepFiveMinutes();		
	}
	sendResponse(res)(fetchPCFactoryProfile(req));
});

function envioCorreo(link) {
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		host: 'smtp.gmail.com',
		auth: {
			user: "*****@gmail.com",
			pass: "**********"
		}
	});
	var mailOptions = {
		from: '**********@gmail.com',
		to: '*************@gmail.com',
		subject: 'Sending Email using Node.js[nodemailer]',
		text: 'That was easy!'+link
	};
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		}
		else {
			console.log('Email sent: ' + info.response);
		}
	});
}
//crear un main que esté corriendo la app
app.listen(port, () => console.log(`App started on port ${port}.`));
