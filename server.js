/**@ccarcamo**/
/**POC llamada a servicios desde nodeJs
/**requerido : express,body-parser,node-xml-lite,node-rest-client
*** Ver tema de seguridad : línea de código 20
*** Cambiar los metodos por post, se dejan en get para efectos de prueba
*** 
/****REST*****/
var restClient = require('node-rest-client').Client;
/****SOAP****/
var soap = require('soap');
/**** SERVER ****/
var express    = require('express');        
var app        = express();
var bodyParser = require('body-parser');
var xmlParser = require("node-xml-lite");
/****************************************/

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: false ,limit: '5mb'}));

app.use(function(req, res, next){
//se habilitan peticiones entre dominios
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type"); // ver seguridad
  res.header("Content-Type", "application/json; charset=UTF-8");
  next();
});
var port = process.env.PORT || 8080;        // puerto 8080 para servicios Ewin
// ===============================ROUTER==============================================
var router = express.Router();

// middleware para atencion de todas las peticiones
router.use(function(req, res, next) {
	console.log("Recibiendo petición :");
	//console.log(req);
	next();
	//console.dir(req);
});


//***** CONSULTA DEUDA *****
router.route('/consultadeuda')
    .post(function(req, res){ // CAMBIAR POR POST PARA DEJAR EN PROD. Consulta Deuda (POST http://localhost:8080/api/consultadeuda)
        //console.log('###########################################');
		//console.log('req',req);
		var rut = req.body.rut;
		var url = 'http://200.75.7.209/WSConsulta/services/WSConsulta?wsdl';
		var data = {  // comentar, entrada de prueba, este debe ser parameetro de entrada
		    consultaDeuda: {
		        encabezado: {
		            canal: 'INTERNET',
		            destino: {
		                tipo: '',
		                valor: ''
		            },
		            fecha: '20141211',
		            hora: '141530',
		            id_mensaje: 'MTPEC15',
		            id_operacion: '3070',
		            ordenamiento: {
		                campo: '',
		                direccion: ''
		            },
		            origen: {
		                tipo: 'RUT',
		                valor: '780537906'
		            },
		            paginacion: {
		                cantidad_trx: '', //1
		                nmro_pagina: '' //10
		            },
		            version: '3'
		        },
		        servicio: //uno o mas repeticiones
		            [{
		            captura: '',
		            id_convenio_rec: '14760',
		            id_eps: '', //96678790
		            modo: 'det',
		            nmro_servicio: [{
		                tipo: 'RUTC',
		                valor: rut
		            }]
		        }],
		        MY_QNAME: ''
		    }
		};

		soap.createClient(url, function(err, client) {
		    //console.dir(client);
				if(err){				
					console.dir(err);
					var errorDesc =  {
						Fault: {
						Code: {
							Value: "error",
							Subcode: { value: err.code }
						},
						Reason: { Text: err }
						}
					};
					res.json({ data: errorDesc});
				}
				else{
					client.ConsultaDeuda(data, function(err, result) {
									//console.log('#### result #####');
									//console.log(JSON.stringify(result));
									
									//datos proporcionados por forum hasta que mejoren el webservice
									result = { return: 
												{ attributes: { type: 'org.example.www.wsconsultaforum.ConsultaDeudaResponse' },
													encabezado: 
													{ id_mensaje: 'MTPEC16',
														version: '3',
														origen: {tipo:'1',valor:'EFT'},
														destino: {tipo:'RUT',valor:'780537906'},
														fecha: '20141211',
														hora: '141530',
														id_operacion: '3070',
														canal: 'INTERNET',
														cod_estado: '500',
														paginacion: {nmro_pagina:'1',cantidad_trx:'1',total_registros:'1'},
														ordenamiento: {campo:'',direccion:''} },
													servicio: [{modo:"DET",id_eps:"",id_convenio_rec:"14760",id_trx:"43820984",nmro_servicio:{tipo:"RUTC",valor:"165315391"},
																deuda:[
																	{nmro_documento:{tipo:"FAC",valor:"14"},
																	monto:"351611",
																	moneda:"",
																	fecha_vencimiento:"20160815",
																	cod_estado:"100",desc_estado:"Deuda encontrada",
																	dato_adicional:[
																		{tipo:"SERVICIO",valor:"LA310324"},
																		{tipo:"VALOR CUOTA",valor:"351611"},
																		{tipo:"GASTO COBRANZA",valor:"0"},
																		{tipo:"INTERESES",valor:"0"},
																		{tipo:"ESTADO DEUDA",valor:""},
																		{tipo:"DESCRIPCION",valor:""},
																		{tipo:"CODIGO PRODUCTO",valor:"4"},
																		{tipo:"PRODUCTO",valor:"Cuota"},
																		{tipo:"DIAS ATRASO",valor:"0"},
																		{tipo:"DOC ID",valor:"736293517"},
																		{tipo:"CLI NOMBRE",valor:"Rossana"},
																		{tipo:"COD EMP",valor:"3"},{tipo:"TPD ID",valor:"2"},{tipo:"EMP NOMBRE",valor:"Forum SA"}]}
																	]
																}]	 
												} 
											}
									res.json({ data: result});	
		    		});
				}	
		});
    });


//***** Login *****
 router.route('/login')
    .post(function(req, res){ // CAMBIAR POR POST PARA DEJAR EN PROD.Login(POST http://localhost:8080/api/login) camibar de arg el dato que se debe recibir en XML
    	
		var urllogin = req.body.urllogin; //"http://200.75.7.242/WSPortalMobileForum/webresources/monitorcall"
		
		var options_auth = { user: "wsportalmobile", password: "as123456" };
    	var restclient = new restClient(options_auth);

		var data = "<message><header><msg_type>SPMLOGIN01</msg_type><date>2016-11-17T19:00:26-03:00</date><action>LoginPortalMobile</action></header>"
			data +="<body><parameters count='2'><parameter><name>id_cliente</name><value>"+ req.body.rut + "</value></parameter>"
			data +="<parameter><name>clave</name><value>"+ req.body.password+"</value></parameter></parameters></body></message>";


    	var args = {
		    data:data,
			headers: { "Content-Type": "text/xml" }
		};
		restclient.post(urllogin, args, function (data, response) {
		    var responseParse = xmlParser.parseBuffer(data);
		    res.json({ data: responseParse});
		});
    });   


router.get('/', function(req, res) {
    res.json({ message: 'Ewin Services Started' });
});
//***** CONSULTA COMPROBANTE *****
router.get('/comprobante')
.post(function(req, res){

})
.get(function(){
	return 'hola mundo'
});


// REGISTRANDO ROUTES -------------------------------
// todas las rutas iran despues del prefijo /api
app.use('/api', router);

// INICIAMOS EL SERVIDOR
// =============================================================================
app.listen(port);
console.log('Iniciado en puerto : ' + port);

