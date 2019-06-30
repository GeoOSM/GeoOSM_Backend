#! /usr/bin/env node
var http = require('http');
var https = require('https'); 
var fs = require("fs");

var unrar = require("node-unrar-js");
var express = require('express');
var ogr2ogr = require('ogr2ogr');
var BodyParser = require('body-parser');
var zip = new   require('node-zip')();
var cors = require('cors');
var xhr = require('request');
var {PythonShell} = require('python-shell')
// #https://www.npmjs.com/package/python-shell
var app = express();
var MBTiles = require('mbtiles');
var turf = require('@turf/turf')
const { Pool, Client } = require('pg')

const bd_access = {
	user: bd_access.user,
	host: 'host de la bd',
	database: 'nom de la bd',
	password: 'mot de passe de la bd',
	port: 5432,
}
const path_nodejs = '/var/www/smartworld/'
const path_script_python = path_nodejs+'/python_script/'
const path_projet_qgis = path_nodejs
const path_style_qml = path_nodejs+'/style/'

const pool = new Pool({
  user: bd_access.user,
  host: bd_access.host,
  database: bd_access.database,
  password: bd_access.password,
  port: 5432,
})

var multer  = require('multer')
// https://github.com/expressjs/multer#memorystorage npm install --save multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/var/www/geocameroun_admin/public/assets/pdf/')
  },
  filename: function (req, file, cb) { 
  	 var extension = file.originalname.split('.')[file.originalname.split('.').length-1]
  	 var name = file.originalname.replace(/[^\w\s]/gi, '').toLowerCase()+ '_' + Date.now()+'.'+extension
  	 var nom = name.replace(/ /g,'_')
  	
    cb(null, name )
  }
})

var storage_mbtiles = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, '/var/www/smartworld/raster/')
	},
	filename: function (req, file, cb) { 
		 var extension = file.originalname.split('.')[file.originalname.split('.').length-1]
		 var name = file.originalname.replace(/[^\w\s]/gi, '').toLowerCase()+ '_' + Date.now()+'.'+extension
		 var nom = name.replace(/ /g,'_')
		
	  cb(null, name )
	}
  })

  var storage_style = multer.diskStorage({
	destination: function (req, file, cb) {
	  cb(null, path_style_qml)
	},
	filename: function (req, file, cb) { 
		 var extension = file.originalname.split('.')[file.originalname.split('.').length-1]
		 var name = file.originalname.replace(/[^\w\s]/gi, '').toLowerCase()+ '_' + Date.now()+'.'+extension
		 var nom = name.replace(/ /g,'_')
		
	  cb(null, name )
	}
  })
var upload = multer({ storage: storage })
var upload_raster = multer({ storage: storage_mbtiles })
var upload_style = multer({ storage: storage_style })


app.use(cors());
// app.use(BodyParser.json());

// app.use(BodyParser.urlencoded({ extended: true }));

app.use(express.json({limit:'50mb'}))
//app.use(express.urlencoded({limit:'50mb'}))

var corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200
}

app.use(express.static('/'));

var dir_project = '/var/www/cuy/public/assets/nodejs/'
var d = new Date();
var curr_date = d.getDate();
var curr_month = d.getMonth() + 1;
var curr_year = d.getFullYear();


app.get('/importation/*', cors(corsOptions), function (req, res) {

	url = req.params[0]
	var index = url.indexOf("/")
	var extention = url.slice(0, index)
	var lien = url.slice(index)


	if (extention.toLowerCase() == 'rar') {
		console.log(extention, lien)
		var extractor = unrar.createExtractorFromFile(lien, "/home/admin237/unrar/");
		var files = extractor.extractAll();

		if (files[0].state == 'SUCCESS') {
			for (var i = 0; i < files[1].files.length; i++) {
				if (files[1].files[i].fileHeader.name.indexOf(".shp") != -1) {

					var shapefile = ogr2ogr('/home/admin237/unrar/' + files[1].files[i].fileHeader.name)
						.format('GeoJSON')
						.project("EPSG:4326")
						.skipfailures()
						.stream()

					shapefile.pipe(fs.createWriteStream('/var/www/cuy/public/assets/donne_importation_geojson/dd.geojson').on('finish', function () {


						fs.readFile('/var/www/cuy/public/assets/donne_importation_geojson/dd.geojson', { encoding: 'utf-8' }, (err, data) => {
							if (err) throw err;
							// console.log(data);
							res.send(data)
						});

					}))



				}
			}

		}
	} else if (extention.toLowerCase() == 'geojson' || extention.toLowerCase() == 'json') {

		fs.readFile(lien, { encoding: 'utf-8' }, (err, data) => {
			if (err) throw err;
			res.send(data)
		});

	} else if (extention.toLowerCase() == 'zip') {
		console.log(extention, lien)
		var shapefile = ogr2ogr(lien)
			.format('GeoJSON')
			.project("EPSG:4326")
			.skipfailures()
			.stream()

		shapefile.pipe(fs.createWriteStream('/var/www/cuy/public/assets/donne_importation_geojson/dd.geojson').on('finish', function () {

			fs.readFile('/var/www/cuy/public/assets/donne_importation_geojson/dd.geojson', { encoding: 'utf-8' }, (err, data) => {
				if (err) throw err;
				// console.log(data);
				res.send(data)
			});

		}))

	} else {

		var shapefile = ogr2ogr(lien)
			.format('GeoJSON')
			.skipfailures()
			.stream()

		shapefile.pipe(fs.createWriteStream('/var/www/cuy/public/assets/donne_importation_geojson/dd.geojson').on('finish', function () {

			fs.readFile('/var/www/cuy/public/assets/donne_importation_geojson/dd.geojson', { encoding: 'utf-8' }, (err, data) => {
				if (err) throw err;
				res.send(data)
			});

		}))

	}


})

app.get('/shape/:datapoint/:datapolygon/:dataline', cors(corsOptions), function (req, res) {

	//var type = 'DXF'
	var type = 'ESRI Shapefile'
	//res.send(req.params.datapoint + ',' + req.params.datapolygon + ','+ req.params.dataline)
	var shapefile = ogr2ogr(req.params.datapoint)
		.format(type)
		.skipfailures()
		.stream()

	shapefile.pipe(fs.createWriteStream(dir_project + 'DessinPoint.zip').on('finish', function () {


		var shapefile = ogr2ogr(req.params.datapolygon)
			.format(type)
			.skipfailures()
			.stream()

		shapefile.pipe(fs.createWriteStream(dir_project + 'DessinPolygone.zip').on('finish', function () {


			var shapefile = ogr2ogr(req.params.dataline)
				.format(type)
				.skipfailures()
				.stream()

			shapefile.pipe(fs.createWriteStream(dir_project + 'DessinLine.zip').on('finish', function () {



				res.send("ok")



			}))

		}))

	}))
})

app.get('/dxf/:datapoint/:datapolygon/:dataline', cors(corsOptions), function (req, res) {

	var type = 'DXF'
	var shapefile = ogr2ogr(req.params.datapoint)
		.format(type)
		.skipfailures()
		.destination(dir_project + 'Point.dxf')

	shapefile.exec(function (er, data) {
		if (er) console.error(er)

		var shapefile = ogr2ogr(req.params.datapolygon)
			.format(type)
			.skipfailures()
			.destination(dir_project + 'Polygone.dxf')

		shapefile.exec(function (er, data) {
			if (er) console.error(er)

			var shapefile = ogr2ogr(req.params.dataline)
				.format(type)
				.skipfailures()
				.destination(dir_project + 'Line.dxf')

			shapefile.exec(function (er, data) {
				if (er) console.error(er)
				res.send('ok')

			})

		})
	})

})
//downloadVectorToWMS,
//addRasterToWMS
app.get('/tiles_geocameroun/:folder/:z/:x/:y.*', function(req, res) {
    console.log(1)
    var mbtilesLocation = '/home/admin237/server_tiles/mbtiles/'+ req.params['folder']+'/tiles.mbtiles';
    new MBTiles(mbtilesLocation, function(err, mbtiles) {
     
    var extension = req.params[0];
    switch (extension) {
      case "png": {
        mbtiles.getTile(req.params['z'], req.params['x'], req.params['y'], function(err, tile, headers) {
          if (err) {
            res.status(404).send('Tile rendering error: ' + err + '\n');
          } else {
            res.header("Content-Type", "image/png")
            res.send(tile);
          }
        });
        break;
      }
      case "grid.json": {
        mbtiles.getGrid(req.params['z'], req.params['x'], req.params['y'], function(err, grid, headers) {
          if (err) {
            res.status(404).send('Grid rendering error: ' + err + '\n');
          } else {
            res.header("Content-Type", "text/json")
            res.send(grid);
          }
        });
        break;
      }
    }
  
  });
});

// https://cuy.sogefi.cm:8443/generateAllShapeFromOsmBuilder/smartworld4
app.get('/generateAllShapeFromOsmBuilder/:projet_qgis',cors(corsOptions),function (req,res) {
	var projet_qgis= path_projet_qgis+req.params["projet_qgis"]+".qgs"

	if(req.params["projet_qgis"] == "madagascar" ){
		var destination ='/var/www/smartworld/madagascar_gpkg/'
		var database = "madagascar"
	}else if(req.params["projet_qgis"] == "smartworld4"){
		var destination = '/var/www/smartworld/gpkg/'
		var database = "geocameroun3"
	}else if(req.params["projet_qgis"] == "occitanie"){
		var destination = '/var/www/smartworld/occitanie_gpkg/'
		var database = "occitanie"
	}

	const pool = new Pool({
		user: bd_access.user,
		host: bd_access.host,
		database: database,
		password: bd_access.password,
		port: 5432,
	  })

	pool.query('SELECT * from public.categorie where sql is not null', (err, response) => {
		pool.end()
		
		var query = response.rows
		var i = 0

		console.log(query.length)
		
			var executeOgr2ogr =function (i) {
			
				var type = 'GPKG'
				var nom_shp = query[i].nom_cat.replace(/[^a-zA-Z0-9]/g,'_')+'_'+query[i].sous_thematiques+'_'+query[i].key_couche+'_'+query[i].id_cat

				var shapefile = ogr2ogr('PG:host='+bd_access.host+' port=5432 user='+bd_access.user+' dbname='+database+' password='+bd_access.password)
					.format(type)
					.options(["--config","-select","osm_id,hstore_to_json" , "CPL_DEBUG", "ON","-sql",query[i].sql])
					.project('EPSG:4326')
					.timeout(1800000)
					.onStderr(function(data) {
						//console.log('azerty',data);
					})
					.skipfailures()
					.destination(destination +nom_shp+'.gpkg');
				
				console.log(i,nom_shp)
				
				shapefile.exec(function (er, data) {
					check_function(i)
					/*let options = {
						mode: 'text',
						pythonPath: 'python3',
						//pythonOptions: ['-u'], // get print results in real-time
						//scriptPath: 'path/to/my/scripts',
						args: [projet_qgis,destination +nom_shp+'.gpkg', query[i].nom_cat.replace(/[^a-zA-Z0-9]/g,'_')]
					};

					PythonShell.run('/var/www/smartworld/add_vector_layer.py', options, function (err, results) {
						if (err) throw err;
						if( Array.isArray(results) && results[0] == 'ok' ){
							
							const pool1 = new Pool({
								user: bd_access.user,
								host: bd_access.host,
								database: database,
								password: bd_access.password,
								port: 5432,
							})
							var url = 'http://tiles.geocameroun.xyz/cgi-bin/qgis_mapserv.fcgi?map='+projet_qgis
							
							if (query[i].sous_thematiques) { 
								var query_update = 'UPDATE public."couche-sous-thematique" SET url= \' '+ url +'\', identifiant= \''+ query[i].nom_cat.replace(/[^a-zA-Z0-9]/g,'_') +'\' WHERE id ='+query[i].key_couche
							} else {
								var query_update = 'UPDATE public."couche-thematique" SET url= \' '+ url +' \', identifiant= \''+ query[i].nom_cat.replace(/[^a-zA-Z0-9]/g,'_') +'\' WHERE id ='+query[i].key_couche
							}

							//console.log(query_update)
							pool1.query( query_update , (err, response) => {
								pool1.end()
								check_function(i)
								
							})

						}
						
					})*/
					
				})
				
			}

			if(query.length > 0){
				executeOgr2ogr(i)
			}else{
				console.log('finish')
			}
			var compteur = []
			var check_function = function(a){
				compteur.push(a)

				if(compteur.length == query.length){
					let options = {
						mode: 'text',
						pythonPath: 'python3',
						//pythonOptions: ['-u'], // get print results in real-time
						//scriptPath: 'path/to/my/scripts',
						args: [projet_qgis]
					};
					//python '/var/www/smartworld/reload_qgis_project.py' "/var/www/smartworld/smartworld4.qgs"
					PythonShell.run(path_script_python+'/reload_qgis_project.py', options, function (err, results) {
						
						if (err) throw err;
						
						console.log(results,'yess')
						res.send("ok")
						
					});
				}else{
					executeOgr2ogr(compteur.length )
				}
			}
			
			res.send("ok")
	})
})

// https://cuy.sogefi.cm:8443/generateShapeFromOsmBuilder/171/false
app.get('/generateShapeFromOsmBuilder/:projet_qgis/:id_cat/:addtowms',cors(corsOptions),function (req,res) {
	var projet_qgis= path_projet_qgis+req.params["projet_qgis"]+".qgs"
	var destination = ""
	if(req.params["projet_qgis"] == "madagascar" ){
		var destination ='/var/www/smartworld/madagascar_gpkg/'
		var database = "madagascar"
	}else if(req.params["projet_qgis"] == "smartworld4"){
		var destination = '/var/www/smartworld/gpkg/'
		var database = "geocameroun3"
	}else if(req.params["projet_qgis"] == "occitanie"){
		var destination = '/var/www/smartworld/occitanie_gpkg/'
		var database = "occitanie"
	}
	const pool = new Pool({
		user: bd_access.user,
		host: bd_access.host,
		database: database,
		password: bd_access.password,
		port: 5432,
	  })

		pool.query('SELECT * from public.categorie where id_cat = '+ req.params["id_cat"] , (err, response) => {
			pool.end()
			
			var query = response.rows[0]

			var type = "GPKG"
			var nom_shp = query.nom_cat.replace(/[^a-zA-Z0-9]/g,'_')+'_'+query.sous_thematiques+'_'+query.key_couche+'_'+query.id_cat

			var add_to_qgis=function () {

				if (req.params["addtowms"] == 'false') {
					res.send({
						'status' : 'ok', 
						'addtowms':false 
					}) 
				} else if( req.params["addtowms"] == 'true') {
					
					let options = {
						mode: 'text',
						pythonPath: 'python3',
						//pythonOptions: ['-u'], // get print results in real-time
						//scriptPath: 'path/to/my/scripts',
						args: [projet_qgis,destination+nom_shp+'.gpkg', query.nom_cat.replace(/[^a-zA-Z0-9]/g,'_')]
					};
					console.log(1,projet_qgis,destination+nom_shp+'.gpkg', query.nom_cat.replace(/[^a-zA-Z0-9]/g,'_'))
					PythonShell.run(path_script_python+'/add_vector_layer.py', options, function (err, results) {
						
						if (err) throw err;
						
						console.log(11,err, results)
						if( Array.isArray(results) && results[0] == 'ok' ){
							
							

							const pool1 = new Pool({
								user: bd_access.user,
								host: bd_access.host,
								database: database,
								password: bd_access.password,
								port: 5432,
							})
							var url = 'http://tiles.geocameroun.xyz/cgi-bin/qgis_mapserv.fcgi?map='+projet_qgis
							
							if (query.sous_thematiques) { 
								var query_update = 'UPDATE public."couche-sous-thematique" SET url= \' '+ url +'\', identifiant= \''+ query.nom_cat.replace(/[^a-zA-Z0-9]/g,'_') +'\' WHERE id ='+query.key_couche
							} else {
								var query_update = 'UPDATE public."couche-thematique" SET url= \' '+ url +' \', identifiant= \''+ query.nom_cat.replace(/[^a-zA-Z0-9]/g,'_') +'\' WHERE id ='+query.key_couche
							}

							//console.log(query_update)
							pool1.query( query_update , (err, response) => {
								pool1.end()
								//console.log('sql =',response, 'results: ', results,query_update)
								res.send({
									'status' : 'ok',
									'addtowms':true,
									'identifiant':query.nom_cat.replace(/[^a-zA-Z0-9]/g,'_'),
									'projet_qgis':url
								})

								

								
							})

						}else{
							
							res.send(results)
						}
						
					});
				}
			}
			
			//console.log(query.sql.split(';').length, "sql")
			if (query.sql.split(';').length==1) {
				var shapefile = ogr2ogr('PG:host='+bd_access.host+' port=5432 user='+bd_access.user+' dbname='+database+' password='+bd_access.password)
				.format(type)
				.options(["--config","-select","osm_id,hstore_to_json", "CPL_DEBUG", "ON","-sql",query.sql])
				.project('EPSG:4326')
				.timeout(1800000)
				.onStderr(function(data) {
					//console.log('azerty',data);
				})
				.skipfailures()
				.destination(destination+nom_shp+'.gpkg');

				shapefile.exec(function (er, data) {
					add_to_qgis()
				})
			}else if (query.sql.split(';').length==2){
				var shapefile = ogr2ogr('PG:host='+bd_access.host+' port=5432 user='+bd_access.user+' dbname='+database+' password='+bd_access.password)
				.format(type)
				.options(["--config","-select","osm_id,hstore_to_json", "CPL_DEBUG", "ON","-sql",query.sql.split(';')[0]])
				.project('EPSG:4326')
				.timeout(1800000)
				.onStderr(function(data) {
					//console.log('azerty',data);
				})
				.skipfailures()
				.destination(destination+nom_shp+'.gpkg');

				shapefile.exec(function (er, data) {
					//console.log(query.sql.split(';')[0])
					var shapefile = ogr2ogr('PG:host='+bd_access.host+' port=5432 user='+bd_access.user+' dbname='+database+' password='+bd_access.password)
					.format(type)
					.options(["-append","--config","-select","osm_id,hstore_to_json", "CPL_DEBUG", "ON","-sql",query.sql.split(';')[1]])
					.project('EPSG:4326')
					.timeout(1800000)
					.onStderr(function(data) {
						//console.log('azerty',data);
					})
					.skipfailures()
					.destination(destination+nom_shp+'.gpkg');

					shapefile.exec(function (er, data) {
						//console.log(query.sql.split(';')[1])
						add_to_qgis()
					})
				})
			}
			
			
		})


})


app.post('/download', cors(corsOptions), upload.single('file'), function (req, res, next) {
	var file = req.file
	var extension = file.filename.split('.')[file.filename.split('.').length-1]
  	 var nom = file.filename

	res.send({'status':'ok','file':'assets/pdf/'+nom})
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})

app.post('/downloadRaster', cors(corsOptions), upload_raster.single('file'), function (req, res, next) {
	/// a cause du fait qu'on ne peut rien envoyer avec le post, c'est le projet smartword qui va porter tous les rasters
	var file = req.file
	var extension = file.filename.split('.')[file.filename.split('.').length-1]
  	 var name = file.filename
	   var nom = name
	   var file = '/var/www/smartworld/raster/'+nom
	   console.log(1,name)
	   let options = {
			mode: 'text',
			pythonPath: 'python3',
			pythonOptions: ['-u'], // get print results in real-time
			args: ["/var/www/smartworld/smartworld4.qgs",file, nom.replace(/[^a-zA-Z0-9]/g,'_')]
		};
		
	PythonShell.run(path_script_python+'/add_raster_layer.py', options, function (err, results) {
		
	//	python "/var/www/smartworld/add_raster_layer.py" "/var/www/smartworld/smartworld4.qgs" "/var/www/smartworld/raster/drone_limbe.mbtiles" "drone_limbe_2018"

		if (err) throw err;
		//console.log( results,3)
		if( Array.isArray(results) && results[0] == 'ok' ){
			var url = 'http://tiles.geocameroun.xyz/cgi-bin/qgis_mapserv.fcgi?map=/var/www/smartworld/smartworld4.qgs'
			
				res.send({
					'status' : 'ok',
					'identifiant':nom.replace(/[^a-zA-Z0-9]/g,'_'),
					'projet_qgis':url,
					'url_raster':file
				})

		}else{
			
			res.send(results)
		}
	})

	
 
})

app.post('/download_style_qgs',cors(corsOptions), upload_style.single('file'),function (req,res) {
	
			
			var file = req.file
			var extension = file.filename.split('.')[file.filename.split('.').length-1]
			var nom = file.filename
			var style_file = nom
			console.log(style_file)
			res.send({'status':'ok','style_file':style_file})
			

})

// https://cuy.sogefi.cm:8443/set_style_qgs/madagascar/style_communes_itasy.qml/communes_istasy_zip
// https://cuy.sogefi.cm:8443/set_style_qgs/madagascar/style_grand_bassins_versants.qml/grand_bassin_versant_lac_itasy_mars_zip
app.get('/set_style_qgs/:projet_qgis/:style_file/:idndifiant',cors(corsOptions), function (req,res) {
	var projet_qgis= path_projet_qgis+req.params["projet_qgis"]+".qgs"
	
	var style_file =path_style_qml+req.params["style_file"]
	var layername = req.params["idndifiant"]
	console.log(style_file,layername)
	let options = {
						mode: 'text',
						pythonPath: 'python3',
						//pythonOptions: ['-u'], // get print results in real-time
						//scriptPath: 'path/to/my/scripts',
						args: [projet_qgis,style_file, layername]
					};

	PythonShell.run(path_script_python+'/set_style_on_layer.py', options, function (err, results) {
						
		if (err) throw err;
						
						
		if( results == 'ok' ){
							
			res.send({
				'status' : 'ok'
			})

		}else{
							
			res.send(results)
		}
						
	});

})
//////////////////////////////////////////

// https://cuy.sogefi.cm:8443/get_source_file/communes
app.get('/get_source_file/:projet_qgis/:idndifiant',cors(corsOptions), function (req,res) {
	var projet_qgis= path_projet_qgis+req.params["projet_qgis"]+".qgs"
		var layername = req.params["idndifiant"]
		console.log(layername)
		let options = {
							mode: 'text',
							pythonPath: 'python3',
							//pythonOptions: ['-u'], // get print results in real-time
							//scriptPath: 'path/to/my/scripts',
							args: [projet_qgis, layername]
						};
	
		PythonShell.run(path_script_python+'/get_source_file.py', options, function (err, results) {
							
			if (err) throw err;
					console.log(results[0])		
				var file = 'http://service.geocameroun.cm'+results[0].replace('/vsizip/','')	
								
				res.send({
					'status' : 'ok',
					'url':file
				})
			
							
		});
	
	})

// https://cuy.sogefi.cm:8443/downloadVectorToWMS/occitanie/Association_false_54_198.gpkg
// https://cuy.sogefi.cm:8443/downloadVectorToWMS/madagascar/grand_bassin_versant_lac_itasy_mars.zip
app.get('/downloadVectorToWMS/:projet_qgis/:file/',cors(corsOptions),function (req,res) {
	if(req.params["projet_qgis"] == "madagascar" ){
		var destination ='/var/www/smartworld/madagascar_gpkg/'
		var database = "madagascar"
	}else if(req.params["projet_qgis"] == "smartworld4"){
		var destination = '/var/www/smartworld/gpkg/'
		var database = "geocameroun3"
	}else if(req.params["projet_qgis"] == "occitanie"){
		var destination = '/var/www/smartworld/occitanie_gpkg/'
		var database = "occitanie"
	}
	var projet_qgis= path_projet_qgis+req.params["projet_qgis"]+".qgs"
			var nom_shp = req.params["file"]
			
					
					let options = {
						mode: 'text',
						pythonPath: 'python3',
						//pythonOptions: ['-u'], // get print results in real-time
						//scriptPath: 'path/to/my/scripts',
						args: [projet_qgis,destination+nom_shp, nom_shp.replace(/[^a-zA-Z0-9]/g,'_')]
					};

					PythonShell.run(path_script_python+'/add_vector_layer.py', options, function (err, results) {
						// python3 /var/www/smartworld/add_vector_layer.py /var/www/smartworld/occitanie.qgs /var/www/smartworld/occitanie_gpkg/Association_false_54_198.gpkg hhhh
						if (err) throw err;
						
						console.log(results)
						if( Array.isArray(results) && results[0] == 'ok' ){
							
							var url = 'http://tiles.geocameroun.xyz/cgi-bin/qgis_mapserv.fcgi?map='+projet_qgis
							console.log('oui ou non')
							
								res.send({
									'status' : 'ok',
									'identifiant':nom_shp.replace(/[^a-zA-Z0-9]/g,'_'),
									'projet_qgis':url
								})

						}else{
							
							res.send(results)
						}
						
					});
			

})
 
app.post('/analyse_spatiale',cors(corsOptions), function (req,res){
	var donne = req.body
	if (donne['geometry'] != 'tout'){
		var polygon = turf.polygon(donne['geometry']);
	}else{
		var polygon ='tout'
	}
	
	if (donne['geometry'] != 'tout') {
		
		var format_data  = function(k) {
			console.log('k_0',k)
			var url = donne['querry'][k]['url']
			var methode = donne['querry'][k]['methode']
			var typeGestion = donne['querry'][k]['type']
			
			if(methode == 'get'){

				xhr(url, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						//console.log(body) 
						var data = JSON.parse(body)
						var all_coordinates= []
						for (var index = 0; index < data.length; index++) {
							if (typeGestion == 'api' || typeGestion == 'couche') {
								var property = {}
								for (var i = 0; i < data[index].length; i++) {
									if (data[index][i]['index'] == 'geometry') {
										var geometry = JSON.parse(data[index][i]['val']);
									}else{
										property[data[index][i]['index']] = data[index][i]['val']
									}
								}
							}else if (typeGestion == 'requete') {
								var geometry = JSON.parse(data[index].geometry);
								
								var property = {}
								var property_old = data[index]
								delete property_old.geometry;

								property['name'] = property_old['name']
								property['osm_id'] = property_old['osm_id']
								
								var hstore_to_json = JSON.parse(property_old['hstore_to_json'])

								for(var champ in hstore_to_json) { 
									
									property[champ] = hstore_to_json[champ]
								}
							}

							if (geometry.coordinates.length == 1) {
								var coord = geometry.coordinates[0]
							} else {
								var coord = geometry.coordinates
							}

							all_coordinates.push({
								'coord':coord,
								'property':property
							})
						}
						
						var features = []
						
						for (var jj = 0; jj < all_coordinates.length; jj++) {
							
							features.push(turf.point( all_coordinates[jj]['coord'], all_coordinates[jj]['property']))
						}  

						var turf_points = turf.featureCollection(features);
						contains(turf_points,k)
					}
				})

			}else if(methode == 'post'){
				var options = { url: url,method: "POST",form:donne['querry'][k]['data'],strictSSL: false}
				//console.log(options,typeGestion)
				xhr(options , function (error, response, body) {
					//console.log(body) 
					if (!error && response.statusCode == 200){
					
						var data =  JSON.parse(body) 
						var all_coordinates= []
						//console.log('data_lenght_1',data.length,data[0])
						for (var index = 0; index < data.length; index++) {
							if (typeGestion == 'api' || typeGestion == 'couche') {
								var property = {}
								for (var i = 0; i < data[index].length; i++) {
									if (data[index][i]['index'] == 'geometry') {
										var geometry = JSON.parse(data[index][i]['val']);;
									}else{
										property[data[index][i]['index']] = data[index][i]['val']
									}
								}
							}else if (typeGestion == 'requete') {
								var geometry = JSON.parse(data[index].geometry)
								var property = {}
								var property_old = data[index]
								delete property_old.geometry;

								property['name'] = property_old['name']
								property['osm_id'] = property_old['osm_id']

								var hstore_to_json = JSON.parse(property_old['hstore_to_json'])

								for(var champ in hstore_to_json) { 
									
									property[champ] = hstore_to_json[champ]
								}


							}

							if (geometry.coordinates.length == 1) {
								var coord = geometry.coordinates[0]
							} else {
								var coord = geometry.coordinates
							}

							all_coordinates.push({
								'coord':coord,
								'property':property
							})
						}
						//console.log('data_lenght_2',data.length)
						//var turf_points = turf.points(all_coordinates)
						//console.log(turf.point( all_coordinates[0]['coord'], all_coordinates[0]['property']))

						var features = []
						
						for (var jj = 0; jj < all_coordinates.length; jj++) {
							
							features.push(turf.point( all_coordinates[jj]['coord'], all_coordinates[jj]['property']))
						}  

						var turf_points = turf.featureCollection(features);
						
						contains(turf_points,k)
					}
				})
			}else if(methode == 'qgis'){
				var projet_qgis =  path_projet_qgis+donne['querry'][k]['projet_qgis']+".qgs" 
				var layername = donne['querry'][k]['identifiant']
				let options = {
					mode: 'text',
					pythonPath: 'python3',
					//pythonOptions: ['-u'], // get print results in real-time
					//scriptPath: 'path/to/my/scripts',
					args: [projet_qgis, layername,path_projet_qgis+'/roi.geojson','/home/admin237/analyse/']
				};
				// console.log(options)
				PythonShell.run(path_script_python+'/download_data.py', options, function (err, results) {
					if (err) throw err;
					console.log(results)	
					compeur.push(1)	
					if (results != null){
						donne['querry'][compeur.length -1 ]['number'] = results[0]
						donne['querry'][compeur.length -1 ]['nom_file']= "http://service.geocameroun.cm/home/admin237/analyse/"+layername+'.gpkg'
					}else {
						donne['querry'][compeur.length -1 ]['number'] = 0
						donne['querry'][compeur.length -1 ]['nom_file']= false
					}
					
					if(compeur.length == donne['querry'].length){
						res.send(donne['querry'])
					}else{
						format_data(compeur.length)
					}	
				});
			}
		}

		if(donne['querry'].length>0){
			var methode_qgis = []
			for (var index = 0; index < donne['querry'].length; index++) {
				if(donne['querry'][index]['methode']== 'qgis'){
					methode_qgis.push(1)
				} ;
			}
			if (methode_qgis.length > 0){
				fs.writeFile (path_projet_qgis+'/roi.geojson', JSON.stringify(polygon), function(err) {
					if (err) throw err;
						format_data(0)
					}
				);
			}else{
				format_data(0)
			}
			
		}else{
			res.send('Aucune donnée à traiter ')
		}
		// fontion de traitement
		var compeur = []
		var contains = function (turf_points) {
			
			var ptsWithin = turf.pointsWithinPolygon(turf_points, polygon);
			compeur.push(ptsWithin.features.length)
			donne['querry'][compeur.length -1 ]['number']= ptsWithin.features.length
			var nom_file =donne['querry'][compeur.length -1 ]['nom'].replace(/[^\w\s]/gi, '').toLowerCase()+ '_' + Date.now()+'.zip'
			donne['querry'][compeur.length -1 ]['nom_file']= "http://service.geocameroun.cm/home/admin237/analyse/"+nom_file
			//console.log('contains',compeur.length,donne['querry'].length)

			var type = 'ESRI Shapefile'
			var shapefile = ogr2ogr(ptsWithin)
				.format(type)
				.skipfailures()
				.stream()
		
			shapefile.pipe(fs.createWriteStream( '/home/admin237/analyse/'+nom_file).on('finish', function () {
				if(compeur.length == donne['querry'].length){
					res.send(donne['querry'])
				}else{
					format_data(compeur.length)
				}
			}))
		}
		
	} else {
		var compeur = []

		var format_data  = function(k) {
			console.log('k_0',k)
			var url = donne['querry'][k]['url']
			var methode = donne['querry'][k]['methode']
			var typeGestion = donne['querry'][k]['type']

			if(methode == 'qgis'){
				var projet_qgis =  path_projet_qgis+donne['querry'][k]['projet_qgis']+".qgs" 
				var layername = donne['querry'][k]['identifiant']
				let options = {
					mode: 'text',
					pythonPath: 'python3',
					//pythonOptions: ['-u'], // get print results in real-time
					//scriptPath: 'path/to/my/scripts',
					args: [projet_qgis, layername]
				};
				// console.log(options)
				PythonShell.run(path_script_python+'/telchargement_tout.py', options, function (err, results) {
					if (err) throw err;
					console.log(results)	
					compeur.push(1)	
					if (results != null){
						donne['querry'][compeur.length -1 ]['number'] = results[1]
						donne['querry'][compeur.length -1 ]['nom_file']= "http://service.geocameroun.cm/"+results[0]
					}else {
						donne['querry'][compeur.length -1 ]['number'] = 0
						donne['querry'][compeur.length -1 ]['nom_file']= false
					}
					
					if(compeur.length == donne['querry'].length){
						res.send(donne['querry'])
					}else{
						format_data(compeur.length)
					}	
				});
			}
		}

		if(donne['querry'].length>0){
			format_data(0)
		}
		else{
			res.send('Aucune donnée à traiter ')
		}

		
	}
})

app.get('/remove_layer_by_name/:projet_qgis/:idndifiant',cors(corsOptions), function (req,res) {
		var projet_qgis= path_projet_qgis+req.params["projet_qgis"]+".qgs"
		var layername = req.params["idndifiant"]
		console.log(layername)
		let options = {
							mode: 'text',
							pythonPath: 'python3',
							//pythonOptions: ['-u'], // get print results in real-time
							//scriptPath: 'path/to/my/scripts',
							args: [projet_qgis, layername]
						};
	
		PythonShell.run(path_script_python+'/remove_layer_by_name.py', options, function (err, results) {
							
			if (err) throw err;
							
			if( results == 'ok' ){
								
				res.send({
					'status' : 'ok'
				})
	
			}else{
								
				res.send(results)
			}
							
		});
	
})
// '/change_all_style_point/:projet_qgis/:layername/:img' /change_all_style_point/occitanie
app.get('/change_all_style_point/:projet_qgis/',cors(corsOptions),function (req,res) {
	var projet_qgis= path_projet_qgis+req.params["projet_qgis"]+"_icon.qgs"
	var destination = ""
	if(req.params["projet_qgis"] == "madagascar" ){
		var destination ='/var/www/smartworld/madagascar_gpkg/img/'
		var database = "madagascar"
		// var icon_png = "/var/www/madagascar_admin/"+"public/"+req.params["img"]
		var icon_png = "/var/www/madagascar_admin/"+"public/"
	}else if(req.params["projet_qgis"] == "smartworld4"){
		var destination = '/var/www/smartworld/gpkg/img/'
		var database = "geocameroun3"
		// var icon_png = "/var/www/geocameroun_admin/"+"public/"+req.params["img"]
		var icon_png = "/var/www/geocameroun_admin/"+"public/"
	}else if(req.params["projet_qgis"] == "occitanie"){
		var destination = '/var/www/smartworld/occitanie_gpkg/img/'
		var database = "occitanie"
		// var icon_png = "/var/www/occitanie_admin/"+"public/assets/images/icones-couches-modification/"+req.params["img"]
		var icon_png = "/var/www/occitanie_admin/"+"public/"
	}

	const pool = new Pool({
		user: bd_access.user,
		host: bd_access.host,
		database: database,
		password: bd_access.password,
		port: 5432,
	  })

	  let pte = []
	  var  i = 39
		

	function style_layer(props) {
		// console.log(props)
		let options = {
			mode: 'text',
			pythonPath: 'python3',
			pythonOptions: ['-u'], // get print results in real-time
			args: [props['projet_qgis'],props['icon_png'], props["layername"],props["destination"]]
		};
		
		PythonShell.run(path_script_python+'/set_icon_on_lyer.py', options, function (err, results) {
			
			if (err){
				console.log(err)
			}
			
			i = i+1
			console.log( i,'contine')

			if (pte.length != i) {
				style_layer(pte[i])
			}else{
				console.log('termine')
			}
		})
	}

	pool.query("SELECT * from public."+'"couche-sous-thematique"' +"where wms_type='osm' and geom='point'", function (err, response) {
		pool.end()
		
		var rows =  response.rows
		
		for (var index = 0; index < rows.length; index++) {
			var element = rows[index];
			var icon_path = icon_png + element['image_src']
			var layername = element['identifiant']
			pte.push({
				'projet_qgis':projet_qgis,
				'icon_png':icon_path,
				'layername':layername,
				'destination':destination,
			})

			// console.log('start',pte.length)
		}
		console.log('start',pte.length)
		style_layer(pte[i])
		
		res.send(pte)
		
	})
	
})

//https://cuy.sogefi.cm:8443/addRasterToWMS/madagascar/carte_ocsol_2018_Itasy.tif
app.get('/addRasterToWMS/:projet_qgis/:nom/', cors(corsOptions), function (req, res, next) {
	var projet_qgis= path_projet_qgis+req.params["projet_qgis"]+".qgs"
	if(req.params["projet_qgis"] == "madagascar" ){
		var destination ='/var/www/smartworld/madagascar_gpkg/'
		var database = "madagascar"
	}else if(req.params["projet_qgis"] == "smartworld4"){
		var destination = '/var/www/smartworld/gpkg/'
		var database = "geocameroun3"
	}else if(req.params["projet_qgis"] == "occitanie"){
		var destination = '/var/www/smartworld/occitanie_gpkg/'
		var database = "occitanie"
	}
	   var nom = req.params["nom"]
	   var file = '/var/www/smartworld/raster/'+nom
	   console.log(nom)
	   let options = {
			mode: 'text',
			pythonPath: 'python3',
			pythonOptions: ['-u'], // get print results in real-time
			args: [projet_qgis,file, nom.replace(/[^a-zA-Z0-9]/g,'_')]
		};
		
	PythonShell.run(path_script_python+'/add_raster_layer.py', options, function (err, results) {
		
	//	python "/var/www/smartworld/add_raster_layer.py" "/var/www/smartworld/smartworld4.qgs" "/var/www/smartworld/raster/drone_limbe.mbtiles" "drone_limbe_2018"

		if (err) throw err;
		//console.log( results,3)
		if( Array.isArray(results) && results[0] == 'ok' ){
			var url = 'http://tiles.geocameroun.xyz/cgi-bin/qgis_mapserv.fcgi?map='+projet_qgis
			
				res.send({
					'status' : 'ok',
					'identifiant':nom.replace(/[^a-zA-Z0-9]/g,'_'),
					'projet_qgis':url,
					'url_raster':file
				})

		}else{
			
			res.send(results)
		}
	})

	
 
})

 
var httpServer = http.createServer(app);
// var httpsServer = https.createServer(credentials, app);

// httpServer.listen(3000);
// httpsServer.listen(8443);
app.listen(3000)



