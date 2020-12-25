const path = require('path');
const logger = require('morgan');
const express = require('express');
const { sendResponse } = require('./app/helpers');
const { fetchAuthorProfile } = require('./app/scotch');
const { fetchPCFactoryProfile} = require('./app/scotch');
const { fetchLiderProfile} = require('./app/scotch');
const { fetchParisProfile} = require('./app/scotch');
const { fetchMicroPlayProfile} = require('./app/scotch');
const { fetchZmartProfile} = require('./app/scotch');
const { fetchFalabellaProfile} = require('./app/scotch');
const { fetchLaPolarProfile} = require('./app/scotch');
const { fetchRipleyProfile} = require('./app/scotch');
const { fetchWePlayProfile} = require('./app/scotch');
const { fetchSonyProfile} = require('./app/scotch');

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
	asyncCallPcFactory(req);
	//console.log("pfcatory: "+asyncCallPcFactory(req));
	return sendResponse(res)(fetchPCFactoryProfile(req));
});

app.get('/lider', (req,res, next) => {
	asyncCallLider(req);
	sendResponse(res)(fetchLiderProfile(req));
});

app.get('/paris', (req,res, next) => {
	asyncCallParis(req);
	sendResponse(res)(fetchParisProfile(req));
});

app.get('/microplay', (req,res, next) => {
	asyncCallMicroPlay(req);
	sendResponse(res)(fetchMicroPlayProfile(req));
});

app.get('/zmart', (req,res, next) => {
	asyncCallZmart(req);
	sendResponse(res)(fetchZmartProfile(req));
});

app.get('/falabella', (req,res, next) => {
	asyncCallFalabella(req);
	sendResponse(res)(fetchFalabellaProfile(req));
});
app.get('/lapolar', (req,res, next) => {
	asyncCallLaPolar(req);
	sendResponse(res)(fetchLaPolarProfile(req));
});

app.get('/ripley', (req,res, next) => {
	asyncCallRipley(req);
	sendResponse(res)(fetchRipleyProfile(req));
});
app.get('/weplay', (req,res, next) => {
	asyncCallWePlay(req);
	sendResponse(res)(fetchWePlayProfile(req));
});
app.get('/sony', (req,res, next) => {
	asyncCallSony(req);
	sendResponse(res)(fetchSonyProfile(req));
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





// crear llamado a metodos 
app.get('/scanPages', (req,res, next) => {
	asyncCallPcFactory(req);		
	asyncCallLider(req);
	asyncCallParis(req);
	asyncCallMicroPlay(req);
	asyncCallZmart(req);	
	asyncCallFalabella(req);
	asyncCallLaPolar(req);
	asyncCallWePlay(req);
	asyncCallRipley(req);
	asyncCallSony(req);
	return res.send("servicio corriendo");
});

function envioCorreo(link) {
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		host: 'smtp.gmail.com',
		auth: {
			user: "*************@gmail.com",
			pass: "****************"
		}
	});
	var mailOptions = {
		from: '***************@gmail.com',
		to: '***************@gmail.com',
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

async function asyncCallPcFactory(req) {
	console.log('calling asyncCallPcFactory');
	const resultados = await fetchPCFactoryProfile(req);
	if(!resultados.data.includes("Ficha Producto No disponible")){
		console.log("pasa por el if");
		if(req.res.statusCode==200){
			envioCorreo(resultados.data+"<br>"+resultados.urlCompleta);
		 }
	}
}

async function asyncCallLider(req) {
	console.log('calling asyncCallLider');
	const resultados1 = await fetchLiderProfile(req)
		.then(number => {return  number;}) 
		.catch(error => console.error("error"));
		if( resultados1!=undefined ){
            envioCorreo(resultados1.urlCompleta);
		}
	
}

async function asyncCallParis(req) {
	console.log('calling asyncCallParis');
	const resultados1 = await fetchParisProfile(req)
		.then(number => {return  number;}) 
		.catch(error => console.error("error"));
		if(resultados1!= undefined && req.res.statusCode==200){
			envioCorreo(resultados1.urlCompleta);
		}
}

async function asyncCallMicroPlay(req) {
	console.log('calling asyncCallMicroPlay');
	const resultados1 = await fetchMicroPlayProfile(req)
		.then(number => {return  number;}) 
		.catch(error => console.error("error"));
		//console.log(resultados1.stringHtml);
		if(resultados1.url!= null && req.res.statusCode==200){
			envioCorreo(resultados1.urlCompleta);
		}
}
async function asyncCallZmart(req) {
	console.log('calling asyncCallZmart');
	const resultados = await fetchZmartProfile(req);
	if(!resultados.data.includes("PRODUCTO AGOTADO")){
		console.log("pasa por el if");
		if(req.res.statusCode==200){
		   envioCorreo(resultados.data+"<br>"+resultados.urlCompleta);
		}
	}
}

async function asyncCallFalabella(req) {
	console.log('calling asyncCallFalabella');
	const resultados = await fetchFalabellaProfile(req);
	if(!resultados.data.includes("Producto sin stock")){
		console.log("pasa por el if");
		if(req.res.statusCode==200){
		   envioCorreo(resultados.data+"<br>"+resultados.urlCompleta);
		}
	}
}

async function asyncCallLaPolar(req) {
	console.log('calling asyncCallLaPolar');
	const resultados = await fetchLaPolarProfile(req);
	if(!resultados.data.includes("Agotado")){
		console.log("pasa por el if");
		if(req.res.statusCode==200){
		   envioCorreo(resultados.data+"<br>"+resultados.urlCompleta);
		}
	}
}

async function asyncCallWePlay(req) {
	console.log('calling asyncCallWePlay');
	const resultados1 = await fetchWePlayProfile(req)
		.then(number => {return  number;}) 
		.catch(error => console.error("error"));
	//	console.log(resultados1.stringHtml);
		if(resultados1!= undefined && req.res.statusCode==200){
			envioCorreo(resultados1.urlCompleta);
		}
}

async function asyncCallRipley(req) {
	console.log('calling asyncCallRipley');
	const resultados1 = await fetchRipleyProfile(req)
		.then(number => {return  number;}) 
		.catch(error => console.error("error"));
	//	console.log(resultados1.stringHtml);
		if(resultados1!= undefined && req.res.statusCode==200){
			envioCorreo(resultados1.urlCompleta);
		}

	
}

async function asyncCallSony(req) {
	console.log('calling asyncCallSony');
	const resultados1 = await fetchSonyProfile(req)
		.then(number => {return  number;}) 
		.catch(error => console.error("error"));
	//	console.log(resultados1.stringHtml);
		if(resultados1!= undefined && req.res.statusCode==200){
			envioCorreo(resultados1.urlCompleta);
		}
	
}



  

  
//crear un main que esté corriendo la app
app.listen(port, () => console.log(`App started on port ${port}.`));
