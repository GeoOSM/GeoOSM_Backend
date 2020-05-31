<?php

/*
|--------------------------------------------------------------------------
| SIG - CUY  Routes
|--------------------------------------------------------------------------

*/
Route::post('loginAdmin', ['as' => 'loginAdmin', 'uses' => 'loginController@loginAdmin']);

// Route::get('/','geoportailController@index');
Route::get('/getParamsForSeo','geoportailController@getParamsForSeo');

Route::get('/check', 'geoportailController@checkaccount');

Route::get('deconnect', 'loginController@deconnect');

Route::get('/', function () {
    return view('admin');
});

/*-------------------geoportail---------------------*/
/*-------------------------------------------------------------------*/
Route::post('login', ['as' => 'login', 'uses' => 'loginController@checklogin']);

Route::post('updateAttribute', ['as' => 'updateAttribute', 'uses' => 'geoportailController@updateAttribute']);

Route::post('addEntite', ['as' => 'addEntite', 'uses' => 'geoportailController@addEntite']);

Route::post('deleteEntite', ['as' => 'deleteEntite', 'uses' => 'geoportailController@deleteEntite']);

Route::post('updateEntite', ['as' => 'updateEntite', 'uses' => 'geoportailController@updateEntite']);

Route::post('share', ['as' => 'share', 'uses' => 'geoportailController@share']);




Route::post('getLimite', 'geoportailController@getLimite'); 
Route::post('getListLimit', 'geoportailController@getListLimit'); 
Route::post('getLimitById', 'geoportailController@getLimitById'); 

Route::post('searchLimite', 'geoportailController@searchLimite'); 
Route::post('searchLimiteInTable', 'geoportailController@searchLimiteInTable'); 
Route::post('getLimiteById', 'geoportailController@getLimiteById'); 
Route::get('getZoneInteret', 'geoportailController@getZoneInteret');


Route::post('add_limite_administrative', 'adminController@add_limite_administrative'); 
Route::post('delete_limite_administrative', 'adminController@delete_limite_administrative'); 
Route::get('config_bd_projet', 'adminController@config_bd_projet'); 


Route::post('whriteSvg', 'adminController@whriteSvg'); 
Route::post('whriteMultipleSvg', 'adminController@whriteMultipleSvg'); 

/*-------------------Web Services RESTFULL API V1---------------------*/
/*-------------------------------------------------------------------*/

$api=app('Dingo\Api\Routing\Router');

$api->version('v1',function($api){

	$api->get('v1/RestFull/Catalog/', 'App\Http\Controllers\ApiController@DataCatalog');

	$api->get('v1/RestFull/rolles/{id}', 'App\Http\Controllers\ApiController@RollesLayers');

	$api->get('v1/RestFull/datajson/{shema}/{exp}', 'App\Http\Controllers\ApiController@DataJson');
	$api->get('v1/RestFull/DataJsonApi/{shema}/{exp}', 'App\Http\Controllers\ApiController@DataJsonApi');

	$api->get('v1/RestFull/Catalog/aliase/{shema}/{exp}', 'App\Http\Controllers\ApiController@Catalog');

	$api->get('v1/RestFull/LayerNameEdit/{id}', 'App\Http\Controllers\ApiController@LayerNameEdit');

	$api->get('v1/RestFull/getUsers/', 'App\Http\Controllers\adminController@users');

	$api->get('v1/RestFull/catalogAdmin/', 'App\Http\Controllers\adminController@DataCatalog');

	$api->get('v1/RestFull/catalogAdminCartes/', 'App\Http\Controllers\adminController@DataCatalogCartes');

	$api->get('v1/RestFull/column_name/{shema}/{table}', 'App\Http\Controllers\ApiController@column_name');

});



Route::group(['prefix' => '/user'],function(){

	Route::post('add/','userController@add');

	Route::post('updateUser/','userController@updateUser');

	Route::post('deleteUser/','userController@deleteUser');

	Route::post('addRolesUser/','userController@addRolesUser');

	Route::post('deleteRole/','userController@deleteRole');

	Route::post('uploads/','userController@uploads');
});


Route::group(['prefix' => '/thematique'],function(){

	Route::get('getCatalogueDonne/','thematiqueController@getCatalogueDonne');

	
	

	Route::post('changeLayerSousThematique/','thematiqueController@changeLayerSousThematique');

	Route::post('updateThematique/','thematiqueController@updateThematique');
	Route::post('updateOrdreThematique/','thematiqueController@updateOrdreThematique');
	

	Route::post('addThematique/','thematiqueController@addThematique');
	
	Route::post('deleteThematique/','thematiqueController@deleteThematique');



	Route::post('addSousThematique/','thematiqueController@addSousThematique');

	Route::post('updateSousThematique/','thematiqueController@updateSousThematique');

	Route::post('deleteSousThematique/','thematiqueController@deleteSousThematique');



	Route::post('addCouche/','thematiqueController@addCouche');
	
	Route::post('deleteCouche/','thematiqueController@deleteCouche');

	Route::post('change_nameCouche/','thematiqueController@change_nameCouche');

	Route::post('save_logo/','thematiqueController@save_logo');
	



	Route::post('addColumns/','thematiqueController@addColumns');

	Route::post('deleteColumn/','thematiqueController@deleteColumn');
	
	Route::post('updateColumn/','thematiqueController@updateColumn');

	Route::post('definir_champ_principal/', 'thematiqueController@definir_champ_principal');


	Route::post('queryLimite/', 'thematiqueController@queryLimite');


	Route::post('emptyTable/','thematiqueController@emptyTable');
	Route::post('importationDeDonnes/','thematiqueController@importationDeDonnes');

	Route::post('save_properties_couche_wms/','thematiqueController@save_properties_couche_wms');
	Route::post('define_service/','thematiqueController@define_service');

	Route::post('save_properties_couche_api/','thematiqueController@save_properties_couche_api');
	
	Route::post('save_properties_couche_osm/','thematiqueController@save_properties_couche_osm');
	Route::post('save_properties_couche_sql_complete_osm/','thematiqueController@save_properties_couche_sql_complete_osm');
	Route::post('save_select_clause/','thematiqueController@save_select_clause');
	

	Route::post('delete_cles_vals_osm/','thematiqueController@delete_cles_vals_osm');
	
	Route::post('querryOsm/','thematiqueController@querryOsm');

	Route::post('chooseTypeWms/','thematiqueController@chooseTypeWms');
	
	Route::post('genrateJsonFileByCat/','thematiqueController@genrateJsonFileByCat'); 

	Route::get('genrateAutomaticJsonFileByCat/','thematiqueController@genrateAutomaticJsonFileByCat');

	Route::post('addMetadata/','thematiqueController@addMetadata');
	
	Route::post('editMetadata/','thematiqueController@editMetadata');

	Route::post('donwload/','exportController@exportDataOsm');
	
});

Route::group(['prefix' => '/adressage'],function(){

	Route::post('getAdresse/','adressageController@getAdresse');

	Route::post('getPosition/','adressageController@getPosition');

	Route::post('getPoints/','adressageController@getPoints'); 
	

	Route::get('codeUsage/','adressageController@codeUsage');
	
	Route::post('getData/','adressageController@getData');
	
	Route::post('getElastcData/','adressageController@getElastcData');


	Route::post('getAdresse_on_click/','adressageController@getAdresse_on_click');

	
});


Route::post("uploadGeoFIle/file", "FilesController@uploadGeoFIle");

Route::post("upload/file", "FilesController@upload");

Route::post("uploads/file", "FilesController@uploads");
 
Route::get('/geoportail/getCatalogue', 'adminController@DataCatalog');
// Route::get('/geoportail/getCatalogue', 'geoportailController@getCatalogue');

Route::post('/geoportail/saveDraw', 'geoportailController@saveDraw');
Route::post('/geoportail/getDraw', 'geoportailController@getDraw');
Route::post('/geoportail/drapeline', 'geoportailController@drapeline');
Route::post('/geoportail/getAlti', 'geoportailController@getAlti');
Route::post('/geoportail/getUsers', 'geoportailController@getUsers');

Route::post('/geoportail/getJsonFIle', 'geoportailController@getJsonFIle');

Route::post('/geoportail/addCountVieuwData', 'geoportailController@addCountVieuwData'); 
Route::get('/geoportail/getVisitiors', 'geoportailController@getVisitiors'); 
Route::post('/geoportail/getFeatureFromLayerById', 'geoportailController@getFeatureFromLayerById'); 

Route::get('/geoportail/getAllExtents', 'adminController@getAllExtents'); 

Route::group(['prefix' => '/cartes'],function(){


	Route::post('addGroupeCartes/','cartesController@addGroupeCartes');

	Route::post('updateGroupeCartes/','cartesController@updateGroupeCartes');
	
	Route::post('deleteCartes/','cartesController@deleteCartes');


	Route::post('updateSousCartes/','cartesController@updateSousCartes');

	Route::post('deleteSousCartes/','cartesController@deleteSousCartes');

	Route::post('addCoucheCartes/','cartesController@addCoucheCartes');

	Route::post('addSousGroupeCartes/','cartesController@addSousGroupeCartes');

	Route::post('change_nameCoucheCartes/','cartesController@change_nameCoucheCartes');

	Route::post('saveCommentCartes/','cartesController@saveCommentCartes');
	
	Route::post('deleteCoucheCartes/','cartesController@deleteCoucheCartes');

	Route::post('editCoucheCartes/','cartesController@editCoucheCartes');

	Route::post('addSequence/','cartesController@addSequence');
	
	Route::post('deleteSequence/','cartesController@deleteSequence');

	Route::post('setPrincipalCartes/', 'cartesController@setPrincipalCartes');

	Route::post('add_doc_pdf/', 'cartesController@add_doc_pdf');
	
	Route::post('updatePdfcarte/', 'cartesController@updatePdfcarte');


	Route::post('delete_doc_pdf/','cartesController@delete_doc_pdf');

	Route::post('SaveCoordPdf/','cartesController@SaveCoordPdf');
	
	Route::post('addMetadata/','cartesController@addMetadata');
	Route::post('editMetadata/','cartesController@editMetadata');
	
});

