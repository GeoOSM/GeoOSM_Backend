<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

use DB;

class userController extends Controller
{
   public function add(Request $Requests)
   {

   	try{

   		DB::select('BEGIN;');
   		DB::select('SAVEPOINT mon_pointdesauvegarde;');

	   	$nom = $Requests->input('nom',null);
	   	$img = $Requests->input('img',null);
	   	$email = $Requests->input('email',null);
	   	$numero = $Requests->input('numero',null);
	   	$mot_passe = $Requests->input('mot_passe',null);

	   	$rps = array();
		

		$querry=DB::table('utilisateur')->insertGetId(
	    	['nom' => $nom, 'src_photo' => $img,'email' => $email, 'telephone' => $numero,'mot_de_passe' => $mot_passe],'id_utilisateur'
		);

		 	DB::select('COMMIT;');
		if($querry){
			array_push($rps, $querry,'ok');
			$rps['status'] ='ok';
			return $rps;
		}else{
			array_push($rps, $querry,'ko');
			return $rps;
		}

	}catch(\Exception $e){
				         
		DB::select('ROLLBACK TO mon_pointdesauvegarde;');
		DB::select('COMMIT;');
		        return $e;
	}

   }


    public function updateUser(Request $Requests){

    	try{

	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');

	   		$nom = $Requests->input('nom',null);
		   	$img = $Requests->input('img',null);
		   	$email = $Requests->input('email',null);
		   	$numero = $Requests->input('numero',null);
		   	$mot_passe = $Requests->input('mot_passe',null);
		   	$id_utilisateur = $Requests->input('id_utilisateur',null);


		   	$querry = DB::table('utilisateur')
				            ->where('id_utilisateur', $id_utilisateur)
				            ->update(['src_photo' => $img,'email' => $email,'telephone' => $numero,'mot_de_passe' => $mot_passe,'nom' => $nom]);


			DB::select('COMMIT;');				            
	        if($querry){
				$rps['status'] ='ok';
				return $rps;
			}else{
				return 'ko';
			}

		}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
		        return $e;
		}

    }

    public function deleteUser(Request $Requests)
    {
    	try{

	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');

	    	$id_utilisateur = $Requests->input('id_utilisateur',null);

	    	$querry0 = DB::table('droit-couche-sous-thematique')->where('id_utilisateur', $id_utilisateur)->delete();
	    	$querry1 = DB::table('droit-couche-thematique')->where('id_utilisateur', $id_utilisateur)->delete();


			$querry2= DB::table('utilisateur')->where('id_utilisateur', $id_utilisateur)->delete();
			DB::select('COMMIT;');
			$rps['status'] ='ok';
			return $rps;

		}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
		        return $e;
		}
    }

    public function addRolesUser(Request $Requests){

    	try{

	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');

	   		$id_utilisateur = $Requests->input('id_utilisateur',null);
		   	$id_sous_thematique_couches = $Requests->input('sous_thematique_couches',null);
		   	$id_thematiques_couches = $Requests->input('thematiques_couches',null);

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		   							// insertion des droits des sous thematique couche : on formate dabord le tableau (sous_thematique_couches) qui va servir à une multi inserition, si c'est ok on passe au couche sous theme, si non on renvois ko1
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	   	
		   	$sous_thematique_couches = array();
			
		   	foreach ($id_sous_thematique_couches as $id_couche ) {
		   		array_push($sous_thematique_couches, ['id_utilisateur' => $id_utilisateur, 'id_couche_sous_thematique' => $id_couche,'droit' => 1]);
		   	};

		   	$querry1=DB::table('droit-couche-sous-thematique')->insert(
		   		$sous_thematique_couches
			);

		   //	if($querry1){
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		   							// insertion des droits des couche sous theme : on formate dabord le tableau (thematiques_couches) qui va servir à une multi inserition
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
		   		$thematiques_couches = array();
			
			   	foreach ($id_thematiques_couches as $id_couche ) {
			   		array_push($thematiques_couches, ['id_utilisateur' => $id_utilisateur, 'id_couche_thematique' => $id_couche,'droit' => 1]);
			   	};

			   	$querry2=DB::table('droit-couche-thematique')->insert(
			   		$thematiques_couches
				);

			   	DB::select('COMMIT;');

				$rps['status'] ='ok';
				return $rps;
				
			

		}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
		        return $e;
		}

   }

   public function deleteRole(Request $Requests)
   {

   		try{

	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');
   		
	   		$id_utilisateur = $Requests->input('id_utilisateur',null);
		   	$id_sous_thematique_couches = $Requests->input('id_sous_thematique_couches',null);
		   	$id_thematique_couches = $Requests->input('id_thematique_couches',null);

		   	$querry0 =0;
		   	$querry1 =0;

		   	foreach ($id_sous_thematique_couches as $id_couche ) {
	    		$querry0 = DB::table('droit-couche-sous-thematique')->where([
	    			['id_utilisateur', $id_utilisateur],
	    			['id_couche_sous_thematique', $id_couche]
	    		])->delete();
		   	};

		   	foreach ($id_thematique_couches as $id_couche ) {
	    		$querry1 = DB::table('droit-couche-thematique')->where([
	    			['id_utilisateur', $id_utilisateur],
	    			['id_couche_thematique', $id_couche]
	    		])->delete();
		   	};

		   	DB::select('COMMIT;');

		   	if($querry0 >= 0 ){
		   		if ($querry1 >= 0) {
		   			$rps['status'] ='ok';
					return $rps;
		   		}
		   		
		   	}else{
		   		return 'ko0';
		   	}

	   	}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
		        return $e;
		}
   }

   public function uploads(Request $request){
      $file = $request->file('file');
   return $file;
      //Display File Name
      echo 'File Name: '.$file->getClientOriginalName();
      echo '<br>';
   
      //Display File Extension
      echo 'File Extension: '.$file->getClientOriginalExtension();
      echo '<br>';
   
      //Display File Real Path
      echo 'File Real Path: '.$file->getRealPath();
      echo '<br>';
   
      //Display File Size
      echo 'File Size: '.$file->getSize();
      echo '<br>';
   
      //Display File Mime Type
      echo 'File Mime Type: '.$file->getMimeType();
   
      //Move Uploaded File
      //$destinationPath = 'uploads';
      //$file->move($destinationPath,$file->getClientOriginalName());
   }
}
