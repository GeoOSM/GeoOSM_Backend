<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

use DB;

class cartesController extends Controller
{	
	private $id_instance_gc = 1;

    public function index()
    {
        $this->id_instance_gc ='22';

    }

    public function send_message()
    {   

        echo $this->id_instance_gc;
    }

	public function addGroupeCartes(Request $Requests)
	{
		try{
	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');

	   			$rps = array(); 

	   		$nom = $Requests->input('nom',null);
		   	$color = $Requests->input('color',null);
		   	$souscartes = $Requests->input('souscartes',null);

		   	$querry=DB::table('cartes')->insertGetId(['nom' => $nom, 'color' => $color, 'sous-sous-cartes' => $souscartes,'id_instances_gc' => $this->id_instance_gc],'id');

		   	$data['id_cartes'] =$querry;
		   	$data['status'] ='ok';

		   	if ($souscartes === 'true') {

		   		$sous_cartes= $Requests->input('sous_cartes',null);

				$data['sous_cartes']=array();

				$i=0;	

				foreach ($sous_cartes as $sous_carte) {
					$querry2=DB::table('sous-cartes')->insertGetId(['nom' => $sous_carte['nom'], 'id-cartes' => $querry],'id');

						array_push($data['sous_cartes'],["nom"=>$sous_carte['nom'],"key"=>$querry2,"couches"=>[]]);

						$j=0;

						foreach ($sous_carte['couches'] as $couche ) { 
							
							$img = str_replace(" ", "_", $couche['nom_img_modife']);

							$querry3=DB::table('couche-sous-cartes')->insertGetId(
					    		['nom' => $couche['nom'],'type' => $couche['type'], 'id-sous-cartes' => $querry2,'image_src' => $img ]
							);

							array_push($data['sous_cartes'][$i]['couches'],["id"=>$j,"check"=>false,"key_couche"=>$querry3,'nom' => $couche['nom'],'type' => $couche['type'],'image_src' => $img]);

							$j++;
						}

						$i++;
				}

				DB::select('COMMIT;');
				
				return $data;

		   	}else{

		   		$couches= $Requests->input('couches',null);
		   		$data['couches'] = array();

		   		$i=0;
			
				foreach ($couches as $couche ) { 
					
					$img = str_replace(" ", "_", $couche['nom_img_modife']);

					$querry3=DB::table('couche-cartes')->insertGetId(
						['nom' => $couche['nom'],'type' => $couche['type'], 'id-cartes' => $querry,'image_src' => $img]
					);
					
					array_push($data['couches'],["id"=>$i,"check"=>false,"key_couche"=>$querry3,'nom' => $couche['nom'],'type' => $couche['type'],'image_src' => $img]);

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

	public function updateGroupeCartes(Request $Requests)
	{
		try{
	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');

	   		$nom = $Requests->input('nom',null);
	   		$color = $Requests->input('color',null);
		   	$id = $Requests->input('id_cartes',null);
			$img = $Requests->input('nom_img_modife',null);


			$imgN = str_replace(" ", "_", $img);

			if ($img) {
				$querry = DB::table('cartes')
						->where('id', $id)
						->update(['nom' => $nom,'color' => $color,'image_src' => $imgN]);
			}else{
				$querry = DB::table('cartes')
				->where('id', $id)
				->update(['nom' => $nom,'color' => $color]);
			}

		  

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

	public function deleteCartes(Request $Requests)
	{
		try{
	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');

	   		$id_cartes = $Requests->input('id_cartes',null);
	   		$sous_cartes = $Requests->input('sous_cartes',null);
	   		$id_sous_cartes = $Requests->input('id_sous_cartes',null);

	   		if($sous_cartes != false){


	   			foreach ($id_sous_cartes as $id_sous_carte) {
	   				$querry1 = DB::table('couche-sous-cartes')->where('id-sous-cartes', $id_sous_carte)->delete();
	   			}

	   			$querry2 = DB::table('sous-cartes')->where('id-cartes', $id_cartes)->delete();

	   		}else{


	   			$querry2 = DB::table('couche-cartes')->where('id-cartes', $id_cartes)->delete();

	   		}

	   		$querry3 = DB::table('cartes')->where('id', $id_cartes)->delete();

	   		DB::select('COMMIT;');
	    	$data['status'] ='ok';
			return $data;

	   	}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function updateSousCartes(Request $Requests)
	{
		try{
	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');

	   		$id = $Requests->input('key',null);
		   	$nom = $Requests->input('nom',null);

		   	$querry= DB::table('sous-cartes')
				           ->where('id', $id)
				           ->update(['nom' => $nom]);

			DB::select('COMMIT;');
	    	$data['status'] ='ok';
			return $data;


	   	}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function deleteSousCartes(Request $Requests)
	{
		try{
	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');


	   		$id_sous_cartes = $Requests->input('key',null);


		   	$querry0 = DB::table('couche-sous-cartes')->where('id-sous-cartes', $id_sous_cartes)->delete();

		   	$querry1 = DB::table('sous-cartes')->where('id', $id_sous_cartes)->delete();

		    DB::select('COMMIT;');
	    	$data['status'] ='ok';
			return $data;

	   	}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}

	}

	public function addCoucheCartes(Request $Requests)
	{
		try{
	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');

	   		$sous_cartes = $Requests->input('sous_cartes',null);
		   	$couches = $Requests->input('couches',null);
		   	$nom_cartes = $Requests->input('nom_cartes',null);
		   	$id_sous_cartes = $Requests->input('id_sous_cartes',null);
		   	$id_cartes = $Requests->input('id_cartes',null);

		   	$data['status'] ='ok';
		   	$data['key_couches'] = array();
		   
		   	foreach ($couches as $couche) {

			   	$img = str_replace(" ", "_", $couche['nom_img_modife']);

			   	if($sous_cartes){ 

			   		$querry1=DB::table('couche-sous-cartes')->insertGetId(
						['nom' => $couche['nom'],'image_src' => $img,'type' => $couche['type'], 'id-sous-cartes' => $id_sous_cartes]
					);

			   	}else{

			   		$querry1=DB::table('couche-cartes')->insertGetId(
						['nom' => $couche['nom'],'image_src' => $img,'type' => $couche['type'], 'id-cartes' => $id_cartes]
					);
			   	}

			   	array_push($data['key_couches'], $querry1);
			   		
		   	}


		   	DB::select('COMMIT;');
	    		
			return $data;



	   	}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}

	}

	public function addSousGroupeCartes(Request $Requests)
	{
		try{
	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');


	   		$id_cartes = $Requests->input('id_cartes',null);
		   	$nom = $Requests->input('nom',null);

		   	$querry=DB::table('sous-cartes')->insertGetId(
					    	['nom' => $nom, 'id-cartes' => $id_cartes],'id'
						);

			DB::select('COMMIT;');
			$data['key']=$querry;
	    	$data['status'] ='ok';
			return $data;



	   	}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}

	}

	public function change_nameCoucheCartes(Request $Requests)
	{

		try{

	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');


	   			$nom = $Requests->input('nom_modifier',null);
		   		$image_src = $Requests->input('nom_img_modife',null);
		   		$id = $Requests->input('key_couche',null);
		   		$sous_cartes = $Requests->input('sous_cartes',null);

				$data['status'] ='ok';
				//return $sous_cartes;
				if ($sous_cartes) {
					if ($image_src ) {
						$imgN = str_replace(" ", "_", $image_src);

						$querry = DB::table('couche-sous-cartes')
				           ->where('id', $id)
				           ->update(['nom' => $nom,'image_src' => $imgN]);

					}else{

						$querry = DB::table('couche-sous-cartes')
				           ->where('id', $id)
				           ->update(['nom' => $nom]);
					}
					
				}else{

					if ($image_src) {

						$imgN = str_replace(" ", "_", $image_src);
						$querry = DB::table('couche-cartes')
				           ->where('id', $id)
				           ->update(['nom' => $nom,'image_src' => $imgN]);
					}else{

						$querry = DB::table('couche-cartes')
				           ->where('id', $id)
				           ->update(['nom' => $nom]);
					}
				}

				DB::select('COMMIT;');
		    		
				return $data;

	   	}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function saveCommentCartes(Request $Requests)
	{
		try{

	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');


	   			$com_modifier = $Requests->input('commentaire',null);
		   		$id = $Requests->input('key_couche',null);
		   		$sous_cartes = $Requests->input('sous_cartes',null);

				$data['status'] ='ok';
				//return $sous_cartes;
				if ($sous_cartes) {

					$querry = DB::table('couche-sous-cartes')
				           ->where('id', $id)
				           ->update(['commentaire' => $com_modifier]);
					
				}else{

					$querry = DB::table('couche-cartes')
				           ->where('id', $id)
				           ->update(['commentaire' => $com_modifier]);

				}

				DB::select('COMMIT;');
		    		
				return $data;

	   	}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function deleteCoucheCartes(Request $Requests)
	{

		try{

		   		DB::select('BEGIN;');
		   		DB::select('SAVEPOINT mon_pointdesauvegarde;');


		   		$sous_cartes = $Requests->input('sous_cartes',null);
		   		$id = $Requests->input('key_couche',null);

		   		if($sous_cartes){ 

		   			$querry0 = DB::table('couche-sous-cartes')->where('id', $id)->delete();

		   		}else{


		   			$querry0 = DB::table('couche-cartes')->where('id', $id)->delete();

		   		}

		   		$querry1 = DB::table('couches-sequence')->where('id_couche', $id)->delete();

		   		DB::select('COMMIT;');
	    		$data['status'] ='ok';
				return $data;


		}catch(\Exception $e){
				         
				DB::select('ROLLBACK TO mon_pointdesauvegarde;');
				DB::select('COMMIT;');
				return $e;
		}
	}

	public function editCoucheCartes(Request $Requests)
	{
		try{

		   	DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

		   	$sous_cartes = $Requests->input('sous_cartes',null);
		   	$id = $Requests->input('key_couche',null);

		   	$url = $Requests->input('url',null);
		   	$identifiant = $Requests->input('identifiant',null);
		   	$bbox = $Requests->input('bbox',null);
		   	$projection = $Requests->input('projection',null);
		   	$zmax = $Requests->input('zmax',null);
		   	$zmin = $Requests->input('zmin',null);

		   	if($sous_cartes){ 

		   		$querry0 = DB::table('couche-sous-cartes')
				        ->where('id', $id)
				        ->update(['url' => $url,'identifiant' => $identifiant,'bbox' => $bbox,'projection' => $projection,'zmax' => $zmax,'zmin' => $zmin]);

		   	}else{

		   		$querry0 = DB::table('couche-cartes')
				        ->where('id', $id)
				        ->update(['url' => $url,'identifiant' => $identifiant,'bbox' => $bbox,'projection' => $projection,'zmax' => $zmax,'zmin' => $zmin]);

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

	public function addSequence (Request $Requests)
	{
		try{

		   	DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

		   	$nom = $Requests->input('nom',null);
		   	$couches = $Requests->input('coucheSequence',null);
		   	$key = $Requests->input('key',null);
		   	$id_cartes = $Requests->input('id_cartes',null);

		   	//$data =array();

		   	if ($key) { 

		   		$querry1=DB::table('sequence')->insertGetId(
					['name' => $nom,'id_referent' => $key]
				);

		   		foreach ($couches as $couche ) {

		   			$querry=DB::table('couches-sequence')->insertGetId(
						['id_couche' => $couche['key_couche'],'id_sequence' => $querry1]
					);
		   		}
				

		   	}else if ($id_cartes){

		   		$querry1=DB::table('sequence')->insertGetId(
					['name' => $nom,'id_referent' => $id_cartes]
				);

				foreach ($couches as $couche ) {

		   			$querry=DB::table('couches-sequence')->insertGetId(
						['id_couche' => $couche['key_couche'],'id_sequence' => $querry1]
					);


		   		}

		   	}

		   	DB::select('COMMIT;');
	    	$data['status'] ='ok';
	    	$data['id_sequence'] =$querry1;
			return $data;

		}catch(\Exception $e){
				         
				DB::select('ROLLBACK TO mon_pointdesauvegarde;');
				DB::select('COMMIT;');
				return $e;
		}
	}

	public function deleteSequence(Request $Requests)
	{
		try{

		   	DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

		   	$id_sequence = $Requests->input('id_sequence',null);

		   	$querry0 = DB::table('sequence')->where('id', $id_sequence)->delete();
		   	$querry1 = DB::table('couches-sequence')->where('id_sequence', $id_sequence)->delete();

		   	DB::select('COMMIT;');
	    	$data['status'] ='ok';
			return $data;

		}catch(\Exception $e){
				         
				DB::select('ROLLBACK TO mon_pointdesauvegarde;');
				DB::select('COMMIT;');
				return $e;
		}
	}

	public function setPrincipalCartes(Request $Requests)
	{
		try{

		   	DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

		   	$id_couche = $Requests->input('id_couche',null);
		   	$sous_cartes = $Requests->input('sous_cartes',null);
		   	$status = $Requests->input('status',null);

		   	$querry = DB::table('couche-sous-cartes')
				           ->where('principal', true)
				           ->update(['principal' => false]);

			$querry = DB::table('couche-cartes')
				           ->where('principal', true)
				           ->update(['principal' => false]);

			if ($sous_cartes) {
				$querry = DB::table('couche-sous-cartes')
				           ->where('id', $id_couche)
				           ->update(['principal' => $status]);
			} else {
				$querry = DB::table('couche-cartes')
				           ->where('id', $id_couche)
				           ->update(['principal' => $status]);
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

	public function add_doc_pdf(Request $Requests)
	{
		try{

		   	DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

		   	$id_referent = $Requests->input('id_referent',null);
			$description = $Requests->input('description',null);
		    $bbox = $Requests->input('bbox',null);
		    $type = $Requests->input('type',null);
		    $url = $Requests->input('url',null);
			$url_raster = $Requests->input('url_raster',null);
			$zmax = $Requests->input('zmax',null);
		    $zmin = $Requests->input('zmin',null);
	  	    $name = $Requests->input('name',null);
			$id_pdf = $Requests->input('id',null);
			$url_tile = $Requests->input('url_tile',null);
			$pdf_public = $Requests->input('pdf_public',null);
		    $identifiant = $Requests->input('identifiant',null);
		    $nom_img_modife = $Requests->input('img_temp',null);
		    $sous_cartes = $Requests->input('sous_cartes',null);

		   	$data = array();
		   	$data['data']= array();
		   	if ($sous_cartes) {
		   			
		   		$querry1=DB::table('sous_cartes_pdf')->insertGetId(
					['id_referent'=>$id_referent,'description' => $description,'pdf_public' => $pdf_public,'url_raster' => $url_raster,'bbox' => $bbox,'url' => $url,'type' => $type,'url_tile' => $url_tile,'name' => $name,'zmax' => $zmax,'zmin' => $zmin,'identifiant'=>$identifiant,'image_src' => $nom_img_modife]
				);
				$data['id'] =$querry1;
				//array_push($data['data'], ['id' => $querry1 ]);
		   		
		   	} else {

	   			$querry1=DB::table('cartes_pdf')->insertGetId(
					['id_referent'=>$id_referent,'description' => $description,'pdf_public' => $pdf_public,'url_raster' => $url_raster,'bbox' => $bbox,'url' => $url,'type' => $type,'url_tile' => $url_tile,'name' => $name,'zmax' => $zmax,'zmin' => $zmin,'identifiant'=>$identifiant,'image_src' => $nom_img_modife]
				);

				$data['id'] =$querry1;
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

	public function updatePdfcarte(Request $Requests)
	{
		try{

	   		DB::select('BEGIN;');
	   		DB::select('SAVEPOINT mon_pointdesauvegarde;');


	   			$description = $Requests->input('description',null);
	   			$bbox = $Requests->input('bbox',null);
	   			$type = $Requests->input('type',null);
	   			$url = $Requests->input('url',null);
	   			$url_raster = $Requests->input('url_raster',null);
	   			$zmax = $Requests->input('zmax',null);
	   			$zmin = $Requests->input('zmin',null);
	   			$name = $Requests->input('name',null);
	   			$id_pdf = $Requests->input('id',null);
	   			$url_tile = $Requests->input('url_tile',null);
		   		$identifiant = $Requests->input('identifiant',null);
		   		$nom_img_modife = $Requests->input('img_temp',null);
		   		$pdf_public = $Requests->input('pdf_public',null);
		   		$key_couche = $Requests->input('key_couche',null);
		   		$sous_cartes = $Requests->input('sous_cartes',null);
		   		

				$data['status'] ='ok';
				//return $sous_cartes;
				if ($sous_cartes) { 

					$querry = DB::table('sous_cartes_pdf')
				           ->where('id', $id_pdf)->where('id_referent', $key_couche)
				           ->update(['description' => $description,'pdf_public' => $pdf_public,'url_raster' => $url_raster,'bbox' => $bbox,'url' => $url,'type' => $type,'url_tile' => $url_tile,'name' => $name,'zmax' => $zmax,'zmin' => $zmin,'identifiant'=>$identifiant,'image_src' => $nom_img_modife]);
				
				}else{

					$querry = DB::table('cartes_pdf')
				           ->where('id', $id_pdf)->where('id_referent', $key_couche)
				           ->update(['description' => $description,'pdf_public' => $pdf_public,'url_raster' => $url_raster,'type' => $type,'bbox' => $bbox,'url' => $url,'url_tile' => $url_tile,'name' => $name,'zmax' => $zmax,'zmin' => $zmin,'identifiant'=>$identifiant,'image_src' => $nom_img_modife]);

				}

				DB::select('COMMIT;');
		    		
				return $data;

	   	}catch(\Exception $e){
				         
			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}


	public function delete_doc_pdf(Request $Requests)
	{
		try{

		   	DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

		   	$id = $Requests->input('id',null);
		   	$sous_cartes = $Requests->input('sous_cartes');


		   	if ($sous_cartes) {
		   		$querry0 = DB::table('sous_cartes_pdf')->where('id', $id)->delete();
		   		
		   	} else {
		   		$querry0 = DB::table('cartes_pdf')->where('id', $id)->delete();
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

	public function SaveCoordPdf(Request $Requests)
	{
		try{

		   	DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

		   	$id = $Requests->input('id',null);
		   	$geom = $Requests->input('geom',null);
		   	$sous_cartes = $Requests->input('sous_cartes',null);

		   	if($sous_cartes == 'true'){ 

		   		$querry0 = DB::table('couche-sous-cartes')
				        ->where('id', $id)
				        ->update(['geom' => $geom]);

		   	}else{

		   		$querry0 = DB::table('couche-cartes')
				        ->where('id', $id)
				         ->update(['geom' => $geom]);

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


	public function addMetadata(Request $Requests)
	{
		try{

		   	DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

		   	$resume = $Requests->input('resume',null);
			$description = $Requests->input('description',null);
			$zone = $Requests->input('zone',null);
			$date_creation = $Requests->input('date_creation',null);
			$update = $Requests->input('update',null);
			$epsg = $Requests->input('epsg',null);
			$langue = $Requests->input('langue',null);
			$echelle = $Requests->input('echelle',null);
			$licence = $Requests->input('licence',null);
			$sous_cartes = $Requests->input('sous',null);
			$id_referent = $Requests->input('id_referent',null);
			$tags = $Requests->input('tags',null);
			$partenaires = $Requests->input('partenaire',null);

			$querry1=DB::table('metadata_cartes')->insertGetId(
				['licence'=>$licence,'resume'=>$resume,'description' => $description,'zone' => $zone,'date_creation' => $date_creation,'update' => $update,
				'epsg' => $epsg,'langue' => $langue,'echelle' => $echelle,'sous_cartes' => $sous_cartes,'id_referent' => $id_referent]
			);

			if($tags){
				foreach ($tags as $tag ) {
					$querry=DB::table('tags')->insertGetId(['tags' => $tag,'id_referent' => $querry1,'sous' => $sous_cartes,'type' =>'cartes']);
				}
			}

			if($partenaires){
				foreach ($partenaires as $partenaire ) {
					$querry=DB::table('partenaire')->insertGetId(['id_user' => $partenaire['id_user'],'id_referent' => $querry1,'sous' => $sous_cartes,'type' =>'cartes']);
				}
			}

		   DB::select('COMMIT;');
		   $data['status'] ='ok';
		   $data['id'] =$querry1;
		   return $data;
   
		}catch(\Exception $e){
							
		   DB::select('ROLLBACK TO mon_pointdesauvegarde;');
		   DB::select('COMMIT;');
		   return $e;
	   }		   
	}

	public function editMetadata(Request $Requests)
	{
		try{

		   	DB::select('BEGIN;');
		   	DB::select('SAVEPOINT mon_pointdesauvegarde;');

			   $id_metadata = $Requests->input('id_metadata',null);
			   $licence = $Requests->input('licence',null);
		   	$resume = $Requests->input('resume',null);
			$description = $Requests->input('description',null);
			$zone = $Requests->input('zone',null);
			$date_creation = $Requests->input('date_creation',null);
			$update = $Requests->input('update',null);
			$epsg = $Requests->input('epsg',null);
			$langue = $Requests->input('langue',null);
			$echelle = $Requests->input('echelle',null);
			$sous_cartes = $Requests->input('sous',null);
			$id_referent = $Requests->input('id_referent',null);
			$tags = $Requests->input('tags',null);
			$partenaires = $Requests->input('partenaire',null);

			$querry = DB::table('metadata_cartes')
			->where('id', $id_metadata)
			->update(['licence'=>$licence,'resume'=>$resume,'description' => $description,'zone' => $zone,'date_creation' => $date_creation,'update' => $update,
			'epsg' => $epsg,'langue' => $langue,'echelle' => $echelle]);

			$querry0 = DB::table('tags')->where('id_referent', $id_metadata)->where('sous', $sous_cartes)->where('type','cartes')->delete();
			$querry0 = DB::table('partenaire')->where('id_referent', $id_metadata)->where('sous', $sous_cartes)->where('type', 'cartes')->delete();

			if($tags){
				foreach ($tags as $tag ) {
					$querry=DB::table('tags')->insertGetId(['tags' => $tag,'id_referent' => $id_metadata,'sous' => $sous_cartes,'type' =>'cartes']);
				}
			}

			if($partenaires){
				foreach ($partenaires as $partenaire ) {
					$querry=DB::table('partenaire')->insertGetId(['id_user' => $partenaire['id_user'],'id_referent' => $id_metadata,'sous' => $sous_cartes,'type' =>'cartes']);
				}
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

}