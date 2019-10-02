
const bd_access = {
	user: 'postgres',
	host: '217.70.189.38',
	database: '',
	password: 'postgres237',
	port: 5432,
}

let get_projet_pt = function(projet){
    if(projet == "madagascar" ){
		var destination ='/var/www/smartworld/madagascar_gpkg/'
		var database = "madagascar"
	}else if(projet == "smartworld4"){
		var destination = '/var/www/smartworld/gpkg/'
		var database = "geocameroun3"
	}else if(projet == "occitanie"){
		var destination = '/var/www/smartworld/occitanie_gpkg/'
		var database = "occitanie"
    }
    
    bd_access.database = database
    
    return {
        bd_access:bd_access,
        destination:destination
    }
}

module.exports = get_projet_pt
