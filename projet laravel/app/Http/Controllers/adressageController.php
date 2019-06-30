<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

use DB;

class adressageController extends Controller
{
   

   public function getAdresse(Request $Requests)
   {

   		try{

		    DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

		   	$table = $Requests->input('table',null);
			$shema = $Requests->input('shema',null);
			$geom = $Requests->input('geom',null);
			 $tab=$shema.'."'.$table.'"';
		
			 
			 $querry1=DB::select("select *,ST_AsGeoJSON(geom) as geometry from ".$tab." where  st_within(st_setsrid(geom,4326), st_setsrid(geometry('".$geom."'),4326))");

			 return  (array)$querry1;


		}catch(\Exception $e){
						         
				DB::select('ROLLBACK TO mon_pointdesauvegarde;');
				DB::select('COMMIT;');
				      return $e;
		}

   }

   public function getPosition(Request $Requests)
   {

   		try{

		    DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

		function parenthese ($str) {
            return substr($str, ($p = strpos($str, '(')+1), strrpos($str, ')')-$p);
        };

		   	$adresse = $Requests->input('adresse',null);
			// 10 Rue 1.563

			 $querry1=DB::select(" select st_asgeojson(adressage.fournit_position_yde('".$adresse."')) as geometry");

			  return  $querry1;


		}catch(\Exception $e){
						         
				DB::select('ROLLBACK TO mon_pointdesauvegarde;');
				DB::select('COMMIT;');
				return $e;
		}

   }

   public function getPoints(Request $Requests)
   {

   		try{

		    DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$coord = $Requests->input('coord',null);
			$nom_rue = $Requests->input('nom_rue',null);
				$rps = array(); 

		   	//"st_asgeojson(ST_Buffer(ST_GeographyFromText('SRID=4326;POINT(".$coord[0]." ".$coord[1].")'),20))"


			 // $querry1=DB::select("SELECT arrondissement ,nom_voie ,st_asgeojson(point_adresse) ,designation_construct ,proprietaire ,quartier ,numero_porte ,designation_nature_occupation , ST_Intersects(point_adresse, ST_Buffer(ST_GeographyFromText('SRID=4326;POINT(".$coord[0]." ".$coord[1].")'),20)) FROM  adressage.base_formate where nom_voie == '".$nom_rue."'");

			 $querry1=DB::select("SELECT arrondissement ,nom_voie ,st_asgeojson(point_adresse) as geometry,designation_construct as construction ,proprietaire ,quartier ,numero_porte ,designation_nature_occupation as nom , ST_Intersects(point_adresse, ST_Buffer(ST_GeographyFromText('SRID=4326;POINT(".$coord[0]." ".$coord[1].")'),20)) FROM  adressage.base_formate ");

			 foreach ($querry1 as $key ) {
			 	//return json_decode( json_encode($key), true)['st_intersects'];

			 		
			 	if (json_decode( json_encode($key), true)['st_intersects'] == true && strtoupper(preg_replace('/\s+/', '', json_decode( json_encode($key), true)['nom_voie'])) == strtoupper(preg_replace('/\s+/', '', $nom_rue)) ) {
			 		array_push($rps,$key);
			 	}
			}
			 return  $rps;




		}catch(\Exception $e){
						         
				DB::select('ROLLBACK TO mon_pointdesauvegarde;');
				DB::select('COMMIT;');
				return $e;
		}

   }

   public function codeUsage()
   {
   		

   		try{

		    DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

		   	$rps = array();

			$codes = DB::table('adressage.base_formate')->select('code_usage as code')->distinct()->get();

			foreach ($codes as $code) {
				
				$usage = DB::table('adressage.code_usage')->select('designation','code')->where('code', $code->code )->get();

				array_push($rps,$usage);
			}
			 return  $rps;


		}catch(\Exception $e){
						         
				DB::select('ROLLBACK TO mon_pointdesauvegarde;');
				DB::select('COMMIT;');
				return $e;
		}

   }

   public function getData(Request $Requests)
   {
   		
   		try{

		    DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$usage = $Requests->input('usage',null);
			

			//$donne = DB::table('adressage.base_formate')->select('designation','code')->where('code_usage',$usage )->get();

			 $querry1=DB::select("SELECT arrondissement ,nom_voie ,st_asgeojson(point_adresse) as geometry,designation_construct as construction ,proprietaire ,quartier ,numero_porte ,designation_nature_occupation as nom  FROM  adressage.base_formate WHERE code_usage ='".$usage."' and point_adresse is not null");

		   	
			 return  $querry1;


		}catch(\Exception $e){
						         
				DB::select('ROLLBACK TO mon_pointdesauvegarde;');
				DB::select('COMMIT;');
				return $e;
		}

   }

   public function getElastcData(Request $Requests)
   {
	   	try{

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$data = $Requests->input('data',null);
			$rps = array();
			for ($i=0; $i < sizeof($data) ; $i++) { 

				$shema = $data[$i]['shema'];
				$table = $data[$i]['table'];
				$tab=$shema.'."'.$table.'"';
				$key_couche = $data[$i]['key_couche'];
				$datajson=DB::select('select *,ST_AsGeoJSON(geom) as geometry from '.$tab.' where id ='.$data[$i]['id']);

				$datajson[0]->shema = $shema;
				$datajson[0]->key_couche = $key_couche;
				array_push($rps,$datajson[0]);
			}
			
			return $rps;

		}catch(\Exception $e){
							         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
   }


   public function getAdresse_on_click(Request $request)
   {     
	 try{ 
	   DB::select('BEGIN;');
	   DB::select('SAVEPOINT mon_pointdesauvegarde;');
 
	   $coord=$request->input('coord',null);
 
	   $voie=DB::select("SELECT * FROM adressage.voies WHERE ST_DWithin( trace , 'POINT(".$coord[0]." ".$coord[1].")':: geography, 50 ) ORDER BY ST_Distance(trace, 'POINT(".$coord[0]." ".$coord[1].")':: geography);
	   ");
		
	   	if( sizeof($voie)>=1  ){
			$adresse = DB::select("SELECT adressage.founit_adresse_yde(".$voie[0]->id_voie.",".$coord[0].",".$coord[1].")");
			return $adresse[0]->founit_adresse_yde;
		}else{
			return 'off';
		}
	  
	   
	   }catch(Exception $e){
		 
		
		 DB::select('ROLLBACK TO mon_pointdesauvegarde;');
		 DB::select('COMMIT;');
		 return $e;
	   }
   }


}
