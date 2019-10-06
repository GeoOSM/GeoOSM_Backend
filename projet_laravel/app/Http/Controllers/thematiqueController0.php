<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

use DB;

class thematiqueController extends Controller
{
   public function addThematique(Request $Requests)
   {

   		try{
   		DB::select('BEGIN;');
   		DB::select('SAVEPOINT mon_pointdesauvegarde;');


	   	$nom = $Requests->input('nom',null);
	   	$image_src = $Requests->input('img',null);
	   	$sous_sous_thematique = $Requests->input('sousthematique',null);

	   	

	   	$schema = str_replace(" ", "_", $nom);

	   	$rps = array(); 
		
		
		$querry=DB::table('thematique')->insertGetId(
	    	['nom' => $nom, 'image_src' => $image_src,'shema' => $schema, 'sous-sous-thematique' => $sous_sous_thematique],'id'
		);

		$data['id_thematique'] =$querry;
		$data['shema'] =$schema;
		$data['status'] ='ok';

		if ($sous_sous_thematique === 'true') {

			$sous_thematique= $Requests->input('sous_thematiques',null);

			$data['sous_thematiques']=array();

			if($querry){

				

					$querry1=DB::select('CREATE SCHEMA "'.$schema.'"');
				
				
				
				$i=0;	
					foreach ($sous_thematique as $sous_them) {
						$querry2=DB::table('sous-thematique')->insertGetId(
					    	['nom' => $sous_them['nom'], 'id-thematique' => $querry],'id'
						);

						array_push($data['sous_thematiques'],["key"=>$querry2,"couches"=>[]]);
						$j=0;
						foreach ($sous_them['couches'] as $couche ) { 
							$oldVariable = $sous_them['nom'].' '.$couche['nom'];
							$newVariable = str_replace(" ", "_", $oldVariable);

							$querry3=DB::table('couche-sous-thematique')->insertGetId(
					    		['nom' => $couche['nom'],'geom' => $couche['geom'], 'id-sous-thematique' => $querry2, 'id_couche' => $newVariable]
							);

							array_push($data['sous_thematiques'][$i]['couches'],["key_couche"=>$querry3,"id_couche"=>$newVariable]);

							$querry4=DB::select(' CREATE TABLE '.$schema.'.'.$newVariable.' ()with(OIDS = FALSE)');

							$j++;
						}

						$i++;
					}

					DB::select('COMMIT;');
					array_push($rps,$querry, $querry1,$querry2,$querry3,$querry4,'ok');
					return $data;
				
			}else{
				array_push($rps, $querry,'ko');
				return $rps;
			}
		}else{
			$couches= $Requests->input('couches',null);

			$querry1=DB::select('CREATE SCHEMA '.$schema);
			$data['couches'] = array();

			$i=0;
			
			foreach ($couches as $couche ) { 
				$oldVariable = $nom.' '.$couche['nom'];
				$newVariable = str_replace(" ", "_", $oldVariable);

				$querry3=DB::table('couche-thematique')->insertGetId(
					['nom' => $couche['nom'],'geom' => $couche['geom'], 'id-thematique' => $querry, 'id_couche' => $newVariable]
				);

				$querry4=DB::select(' CREATE TABLE '.$schema.'.'.$newVariable.' ()with(OIDS = FALSE)');

				array_push($data['couches'],["key_couche"=>$querry3,"id_couche"=>$newVariable]);

				$i++;

			}	
			DB::select('COMMIT;');
			return $data;			
		}

		}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
				         return $e;
		}
   }

   public function updateThematique(Request $Requests)
   {

   		try{
   			
	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');

	   		$nom = $Requests->input('nom',null);
		   	$id = $Requests->input('id_thematique',null);

		   	$querry = DB::table('thematique')
				           ->where('id', $id)
				           ->update(['nom' => $nom]);

			DB::select('COMMIT;');

				$data['status'] ='ok';
				$data['id'] =$id;
				return $data;	

		}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
				         return $e;
		}
   }

   public function deleteThematique(Request $Requests)
   {

   		try{

	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');
	   		
	   		$id_thematique = $Requests->input('id_thematique',null);
	   		$shema = $Requests->input('shema',null);
	   		$couche_ids = $Requests->input('couche_ids',null);
	   		$sous_thematiques = $Requests->input('sous_thematiques',null);


	   		if($sous_thematiques){

	   			foreach ($couche_ids as $couche_id) {
	   				$querry0 = DB::table('droit-couche-sous-thematique')->where('id_couche_sous_thematique', $couche_id)->delete();
	   			}

	   			foreach ($sous_thematiques as $sous_thematique_id) {
	   				$querry1 = DB::table('couche-sous-thematique')->where('id-sous-thematique', $sous_thematique_id)->delete();
	   			}

	   			$querry2 = DB::table('sous-thematique')->where('id-thematique', $id_thematique)->delete();

	   		}else{

	   			foreach ($couche_ids as $couche_id) {
	   				$querry0 = DB::table('droit-couche-thematique')->where('id_couche_thematique', $couche_id)->delete();
	   			}

	   				$querry1 = DB::table('couche-thematique')->where('id-thematique', $id_thematique)->delete();
	   		}


	    	$querry2 = DB::table('thematique')->where('id', $id_thematique)->delete();

	    	$querry3 =DB::select('DROP SCHEMA '.$shema.' CASCADE');

	    	DB::select('COMMIT;');
	    	$data['status'] ='ok';
			return $data;

    	}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
				         return $e;
		}

   }

   public function deleteCouche(Request $Requests)
   {
	   	try{

		   		DB::select('BEGIN;');
		   		DB::select('SAVEPOINT mon_pointdesauvegarde;');

		   		$sous_thematiques = $Requests->input('sous_thematiques',null);
		   		$id = $Requests->input('key_couche',null);
		   		$id_couche = $Requests->input('id_couche',null);
		   		$shema = $Requests->input('shema',null);

		   		if($sous_thematiques){ 

		   			$querry2 =DB::select('DROP TABLE '.$shema.'.'.$id_couche);

		   			$querry1 = DB::table('droit-couche-sous-thematique')->where('id_couche_sous_thematique', $id)->delete();

		   			$querry0 = DB::table('couche-sous-thematique')->where('id', $id)->delete();

		   		}else{

		   			$querry2 =DB::select('DROP TABLE '.$shema.'.'.$id_couche);

		   			$querry1 = DB::table('droit-couche-thematique')->where('id_couche_thematique', $id)->delete();

		   			$querry0 = DB::table('couche-thematique')->where('id', $id)->delete();

		   		}

		   		DB::select('COMMIT;');
	    		$data['status'] ='ok';
				return $data;

		}catch(\Exception $e){
					         
				DB::select('ROLLBACK TO mon_pointdesauvegarde;');
				DB::select('COMMIT;');
					         return $e;
		}
   }

   public function addCouche(Request $Requests)
   {
   		try{

		   		DB::select('BEGIN;');
		   		DB::select('SAVEPOINT mon_pointdesauvegarde;');

		   		$sous_thematiques = $Requests->input('sous_thematiques',null);
		   		$couches = $Requests->input('couches',null);
		   		$shema = $Requests->input('shema',null);
		   		$nom_thematique = $Requests->input('nom_thematique',null);
		   		$id_sous_thematique = $Requests->input('id_sous_thematique',null);
		   		$id_thematique = $Requests->input('id_thematique',null);

		   		$data['status'] ='ok';
		   		$data['key_couches'] = array();
		   		$data['id_couches'] = array();

		   		foreach ($couches as $couche) {
		   			
			   		$oldVariable = $nom_thematique.' '.$couche['nom'];
					$newVariable = str_replace(" ", "_", $oldVariable);


			   		$querry0=DB::select(' CREATE TABLE '.$shema.'.'.$newVariable.' ()with(OIDS = FALSE)');


			   		if($sous_thematiques){ 
			   			$querry1=DB::table('couche-sous-thematique')->insertGetId(
							['nom' => $couche['nom'],'geom' => $couche['geom'], 'id-sous-thematique' => $id_sous_thematique, 'id_couche' => $newVariable]
						);
			   		}else{

			   			$querry1=DB::table('couche-thematique')->insertGetId(
							['nom' => $couche['nom'],'geom' => $couche['geom'], 'id-thematique' => $id_thematique, 'id_couche' => $newVariable]
						);
			   		}


			   		array_push($data['key_couches'], $querry1);
			   		array_push($data['id_couches'], $newVariable);
		   		}


		   		DB::select('COMMIT;');
	    		
				return $data;

		}catch(\Exception $e){
					         
				DB::select('ROLLBACK TO mon_pointdesauvegarde;');
				DB::select('COMMIT;');
					         return $e;
		}
   }




}
