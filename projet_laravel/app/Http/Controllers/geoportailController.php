<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

use DB;

use File;

class geoportailController extends Controller
{
    
  private $id_instance_gc = 1;

  public function getParamsForSeo(Request $request)
  {
    $type = $request->input('type',null);
    $id = $request->input('id',null);
    $sous = $request->input('sous',null);
    $id_couche = $request->input('id_couche',null);
    $id_mapPdf = $request->input('id_mapPdf',null);

    if($type == 'map'){
      if($sous != 'false'){
        $couche = DB::table('couche-sous-cartes')->select('image_src','nom')
        ->where('id',$id_couche)
        ->get();

        $metadata=DB::table("metadata_cartes")->select("resume")
            ->where("id_referent","=",$id_couche)
            ->where("sous_cartes","=",true)
            ->get();

      }else{
        $couche = DB::table('couche-cartes')->select('image_src','nom')
        ->where('id',$id_couche)
        ->get();

        $metadata=DB::table("metadata_cartes")->select("resume")
        ->where("id_referent","=",$id_couche)
        ->where("sous_cartes","=",false)
        ->get();
      }
    }else{
      if($sous != 'false'){
        $couche = DB::table('couche-sous-thematique')->select('image_src','nom','wms_type','type_couche')
        ->where('id',$id_couche)
        ->get();

        $metadata=DB::table("metadata_thematiques")->select("resume")
        ->where("id_referent","=",$id_couche)
        ->where("sous_thematiques","=",true)
        ->get();

        if(sizeof($couche)>=1 && ($couche[0]->wms_type=='osm' || $couche[0]->type_couche=='requete' )) {

          $categorie=DB::table("categorie")->select("number","surface","distance")
          ->where("sous_thematiques","=",true)
          ->where("key_couche","=",$id_couche)
          ->get();
         
           $couche[0]->number =$categorie[0]->number;
           $couche[0]->surface =$categorie[0]->surface;
           $couche[0]->distance =$categorie[0]->distance;
        }

      }else{
        $couche = DB::table('couche-thematique')->select('image_src','nom','wms_type','type_couche')
        ->where('id',$id_couche)
        ->get();

        $metadata=DB::table("metadata_thematiques")->select("resume")
        ->where("id_referent","=",$id_couche)
        ->where("sous_thematiques","=",false)
        ->get();

        if(sizeof($couche)>=1 && ($couche[0]->wms_type=='osm' || $couche[0]->type_couche=='requete' )) {
          
           $categorie=DB::table("categorie")->select("number","surface","distance")->where("sous_thematiques","=",false)->where("key_couche","=",$id_couche)->get();
           $couche[0]->number =$categorie[0]->number;
           $couche[0]->surface =$categorie[0]->surface;
           $couche[0]->distance =$categorie[0]->distance;
        }

      }
    }

    if($id_mapPdf){
      $carte_pdf = DB::table('sous_cartes_pdf')->select('name','image_src')
      ->where('id',$id_mapPdf)
      ->get();
      $couche[0]->carte_pdf =  $carte_pdf[0]->name;
      $couche[0]->carte_pdf_img =  $carte_pdf[0]->image_src;
    }

    if (sizeof($metadata)>=1) {
      $couche[0]->resume =$metadata[0]->resume;
    }
    return $couche;

  }

public function index(Request $request)
{

  try{

    $id = $request->input('id',null);

    $adresse = $request->input('adresse',null);

    $position = $request->input('position',null);

    if ($id) {
    
      if ($id == 'admin' ) {
        return view('admin');
      } else {

        $donne = explode(",", $id);
        $shema = null;
        if (sizeof($donne) == 3) {

          $sous_thematique =  floatval($donne[0]) ;
          $key_couche=  floatval($donne[1]);
          $id=  floatval($donne[2]);

        }else if (sizeof($donne) == 4) {
          $shema = $donne[0] ;
          $sous_thematique = $donne[1] ;
          $key_couche = floatval($donne[2]) ;
          $id= floatval($donne[3]) ;
        }

        if (sizeof($donne) == 3 || sizeof($donne) == 4) {
          
        
        if ($shema) {
          
          if ($sous_thematique) {
            
            $table = DB::table('couche-sous-thematique')->select('id_couche','image_src','nom','contour_couleur','opacity','geom')
                ->where('id',$key_couche)
                ->get();

            $tab=$shema.'."'.$table[0]->id_couche.'"';

            $champ_principal = DB::table('catalogue_champ_principal')->select('champ','*')
            ->where([
                  ['id_theme', $key_couche],
                ['sous_thematiques', 'true']
            ])
            ->get();
          
            if (sizeof($champ_principal) == 1) {
              $dd =$champ_principal[0]->champ ;
              $querry=DB::select('select '.$champ_principal[0]->champ.' from '.$tab.' where id ='. $id);
              $nom=$querry[0] -> $dd;
            }else{
              $nom = $table[0]->nom ;
            }

            $img = $table[0]->image_src;
            $nom_title =$table[0]->nom.' - '.$nom;

          } else {

            $donne = DB::table('couche-thematique')->select('id-thematique as id_thematique','id_couche','image_src','remplir_couleur','contour_couleur','opacity','geom')
                ->where('id',$key_couche)
                ->get();

            $tab=$shema.'."'.$donne[0]->id_couche.'"';

            $champ_principal = DB::table('catalogue_champ_principal')->select('champ')
            ->where([
              ['id_theme', $key_couche],
                  ['sous_thematiques','false'],
            ])
            ->get();

            if (sizeof($champ_principal) == 1) {
              $dd =$champ_principal[0]->champ ;
              $querry=DB::select('select '.$champ_principal[0]->champ.' from '.$tab.' where id ='. $id);
              $nom=$querry[0] -> $dd;
            }else{
              $nom = $donne[0]->nom ;
            }

            $img = $donne[0]->image_src;
            $nom_title = $donne[0]->nom.' - '.$nom;

          }

        } else {
          
          if ($sous_thematique) {
            
            $id_thematique = DB::table('sous-thematique')->select('id-thematique as id_thematique','nom')
                ->where('id',$sous_thematique)
                ->get();
          
            $shema = DB::table('thematique')->select('shema','nom')
                ->where('id',$id_thematique[0]->id_thematique)
                ->get();

            $table = DB::table('couche-sous-thematique')->select('id_couche','image_src','nom')
                ->where('id',$key_couche)
                ->get();

            $tab=$shema[0]->shema.'."'.$table[0]->id_couche.'"';

            $champ_principal = DB::table('catalogue_champ_principal')->select('champ','sous_thematiques','*')
            ->where([
              ['id_theme', $key_couche],
                ['sous_thematiques', 'true']
            ])
            ->get();
          
            if (sizeof($champ_principal) == 1) {
              $dd =$champ_principal[0]->champ ;
              $querry=DB::select('select * from '.$tab.' where id ='. $id);
            
              $nom=$querry[0] -> $dd;
            }else{
              $nom = $table[0]->nom ;
            }

            $nom_title = $shema[0]->nom.' - '.$id_thematique[0]->nom.' - '.$table[0]->nom.' - '.$nom;
            $img = $table[0]->image_src;

          } else {

            $donne = DB::table('couche-thematique')->select('id-thematique as id_thematique','id_couche','image_src','nom')
                ->where('id',$key_couche)
                ->get();

            $shema = DB::table('thematique')->select('shema','nom')
                ->where('id', $donne[0]->id_thematique )
                ->get();

            $tab=$shema[0]->shema.'."'.$donne[0]->id_couche.'"';

            $champ_principal = DB::table('catalogue_champ_principal')->select('champ')
            ->where([
              ['id_theme', $key_couche],
                  ['sous_thematiques','=', 'false'],
            ])
            ->get();

            if (sizeof($champ_principal) == 1) {
              $dd =$champ_principal[0]->champ ;
              $querry=DB::select('select '.$champ_principal[0]->champ.' from '.$tab.' where id ='. $id);
              $nom=$querry[0] -> $dd;
            }else{
              $nom = $donne[0]->nom ;
            }

            $nom_title = $shema[0]->nom.' - '.$donne[0]->nom.' - '.$nom;
            $img = $donne[0]->image_src;
            
          }

        }

        return view('geoportail')
        ->with('img',$img)
        ->with('adresse','')
        ->with('position','')
        ->with('nom',$nom_title);

        }else{
          return view('geoportail')
          ->with('img','')
          ->with('adresse','')
          ->with('position','')
          ->with('nom','');
        }


      }

    }else if($adresse){
      if ($adresse == 'admin' ) {

        return view('admin');

      }else{
        $adresse_formate = str_replace('_', ' ', $adresse);
        $adresse_formate1 = str_replace("'", "''", $adresse_formate);

        $adresse_formate2 = str_replace("'", " ", $adresse_formate);
       
        $querry1= DB::select("select st_asgeojson(adressage.fournit_position_yde('".$adresse_formate1."')) as geometry");
        
        $coord = $querry1[0];
        $coord->adresse = $adresse_formate2;
        $q = json_encode($coord) ;

        $nom = "Cliquer pour aller à l'adresse : ".$adresse_formate2;
        
        return view('geoportail')
          ->with('img','')
           ->with('nom',$nom)
           ->with('position','')
           ->with('adresse', $q); 
      }
    }else if ($position) {
      if ($position == 'admin' ) {
          return view('admin');
      }else{
         $position_formate = str_replace('_', ' ', $position);
        
        $nom = "POSITION : ".$position_formate;
                
        return view('geoportail')
                  ->with('img','')
                   ->with('nom',$nom)
                   ->with('adresse', '')
                   ->with('position', $position_formate);
       }
    }else{
      return response()->view('geoportail', ['adresse'=>'','img'=>'', 'nom'=>'', 'position'=>''], 200);
    } 

 }catch(\Illuminate\Database\QueryException $ex){
      return response()->view('geoportail', ['adresse'=>'','img'=>'', 'nom'=>'', 'position'=>''], 200);
       
 }

}

public function getCatalogue()
{

  $path = public_path() . "/upload/catalogue.json"; // ie: /var/www/laravel/app/storage/json/filename.json
  
  $json = json_decode(file_get_contents($path), true); 

  return  $json ;

}

public function getJsonFIle(Request $request)
{

  $file=$request->input('file',null);

  $path = public_path() . "/upload/json/".$file; // ie: /var/www/laravel/app/storage/json/filename.json
  
  $json = json_decode(file_get_contents($path), true); 

  return  $json ;

}

public function deleteEntite(Request $request)
{
   try{
    DB::select('BEGIN;');
    DB::select('SAVEPOINT mon_pointdesauvegarde;');

    $shema=$request->input('shema',null);
    $table=$request->input('table',null);
    $id=$request->input('id',null);

    $tab=$shema.'."'.$table.'"';

    DB::select("delete from ".$tab." where id=".$id."");

    DB::select('COMMIT;');
    return "ok"; 
  }catch(Exception $e){
    DB::select('COMMIT;');
      DB::select('ROLLBACK TO mon_pointdesauvegarde;');
      DB::select('COMMIT;');
    return $e;

  }
} 



public function checkaccount()
{
	if(\Session::has('session')){



      $data = array('super' =>\session::get('super'),'nom' =>\session::get('nom') ,'prenom' =>\session::get('prenom') ,'droit'=>\session::get('droit') ,'id'=> \session::get('id') ,'src_photo'=>\session::get('src_photo') ,'session'=>true);

      
   return $data;

	}else{

     return ['session'=>false];

	}
}

public function addEntite(Request $request)
{
  try{
        DB::select('BEGIN;');
        DB::select('SAVEPOINT mon_pointdesauvegarde;');


        $data=$request->input('data',null);
        $coordinates=$request->input('coordinates',null);
        $shema=$request->input('shema',null);
        $table=$request->input('table',null);
        $geom=$request->input('geom',null);

        $bool = false;
        $cols=DB::select("select column_name as nom ,column_name as champ from information_schema.columns where table_schema = '".$shema."' and table_name = '".$table."'");
      
        foreach ($cols as $col) {
              if($col->nom == 'geom'){
                $bool = true;
              }
        }
       
        if(!$bool){
          
          $tab=$shema.'."'.$table.'"';
          DB::select("ALTER TABLE ".$tab." ADD COLUMN id serial");
          
          DB::select("ALTER TABLE ".$tab." ADD PRIMARY KEY (id)");
          
          DB::select("ALTER TABLE ".$tab." ADD COLUMN geom geometry");
        }
        
        if($data[0]["ind"]!=""){
             $id = DB::table($shema.".".$table)->insertGetId(
            [$data[0]["ind"] => $data[0]["val"]]);

        }else{
           $id = DB::table($shema.".".$table)->insertGetId(
            [$data[0]["ind"] => null] );
        }

        for ($i=1; $i < sizeof($data); $i++) { 

          if($data[$i]["val"]!=""){
            DB::table($shema.".".$table)
                      ->where("id", '=',$id)
                      ->update([$data[$i]["ind"]=>$data[$i]["val"]]);

          }else{

            DB::table($shema.".".$table)
                      ->where("id", '=',$id)
                      ->update([$data[$i]["ind"]=>null]);

          }

        }

        if($geom=="Polygon"){

          $b="POLYGON((";

          for ($i=0; $i <sizeof($coordinates[0])-1; $i++) { 
                    
            $b=$b.$coordinates[0][$i][0]."  ".$coordinates[0][$i][1].",";

          }

          $b=$b.$coordinates[0][sizeof($coordinates)-1][0]." ".$coordinates[0][sizeof($coordinates)-1][1]."))";


          $tab=$shema.'."'.$table.'"';

          DB::select("update ".$tab." set geom=ST_Multi(st_transform(st_setsrid(ST_GeomFromText('".$b."'),3857),4326)) where id=".$id."");

        }elseif ($geom=="LineString") {
          

            $b="LINESTRING(";

            for ($i=0; $i <sizeof($coordinates)-1; $i++) { 
                    
              $b=$b.$coordinates[$i][0]."  ".$coordinates[$i][1].",";

            }

            $b=$b.$coordinates[sizeof($coordinates)-1][0]." ".$coordinates[sizeof($coordinates)-1][1].")";


            $tab=$shema.'."'.$table.'"';

            DB::select("update ".$tab." set geom=ST_Multi(st_transform(st_setsrid(ST_GeomFromText('".$b."'),3857),4326)) where id=".$id."");


        }else{

            $tab=$shema.'."'.$table.'"';

            DB::select("update ".$tab." set geom=ST_Multi(st_transform(st_setsrid(ST_GeomFromText('POINT(".$coordinates[0]." ".$coordinates[1].")'),3857),4326)) where id=".$id."");


        }


        DB::select('COMMIT;');
        return $id; 

  }catch(Exception $e){

    DB::select('COMMIT;');
      DB::select('ROLLBACK TO mon_pointdesauvegarde;');
      DB::select('COMMIT;');
    return $e;

 }

}


public function updateEntite(Request $request)
{

    try{
        DB::select('BEGIN;');
        DB::select('SAVEPOINT mon_pointdesauvegarde;');

        $id=$request->input('id',null);
        $shema=$request->input('shema',null);
        $table=$request->input('table',null);
        $coordinates=$request->input('coordinates',null);
        $type_geometry=$request->input('type_geometry',null);

        if ($type_geometry=="LineString") {
          

           $b="LINESTRING(";

            for ($i=0; $i <sizeof($coordinates)-1; $i++) { 
                    
              $b=$b.$coordinates[$i][0]."  ".$coordinates[$i][1].",";

            }

            $b=$b.$coordinates[sizeof($coordinates)-1][0]." ".$coordinates[sizeof($coordinates)-1][1].")";


            $tab=$shema.'."'.$table.'"';

            DB::select("update ".$tab." set geom=ST_Multi(st_transform(st_setsrid(ST_GeomFromText('".$b."'),3857),4326)) where id=".$id."");


        }elseif ($type_geometry=="Polygon") {

           $b="POLYGON((";

          for ($i=0; $i <sizeof($coordinates[0])-1; $i++) { 
                    
            $b=$b.$coordinates[0][$i][0]."  ".$coordinates[0][$i][1].",";

          }

          $b=$b.$coordinates[0][sizeof($coordinates)-1][0]." ".$coordinates[0][sizeof($coordinates)-1][1]."))";


          $tab=$shema.'."'.$table.'"';

          DB::select("update ".$tab." set geom=ST_Multi(st_transform(st_setsrid(ST_GeomFromText('".$b."'),3857),4326)) where id=".$id."");

        }elseif ($type_geometry=="Point") {

          $tab=$shema.'."'.$table.'"';

          DB::select("update ".$tab." set geom=ST_Multi(st_transform(st_setsrid(ST_GeomFromText('POINT(".$coordinates[0]." ".$coordinates[1].")'),3857),4326)) where id=".$id."");

        }

          DB::select('COMMIT;');
          return "ok"; 

    }catch(Exception $e){

      DB::select('COMMIT;');
      DB::select('ROLLBACK TO mon_pointdesauvegarde;');
      DB::select('COMMIT;');
      return $e;

    }
}

public function updateAttribute(Request $request)
{

    try{
        DB::select('BEGIN;');
        DB::select('SAVEPOINT mon_pointdesauvegarde;');
        $id=$request->input('id',null);
        $shema=$request->input('shema',null);
        $table=$request->input('table',null);
        $data=$request->input('data',null);


        for ($i=0; $i < sizeof($data);$i++) { 

        if($data[$i]["val"]!=""){

        DB::table($shema.".".$table)
                    ->where("id", '=',$id)
                    ->update([$data[$i]["ind"]=>$data[$i]["val"]]);

        }else{

        DB::table($shema.".".$table)
                    ->where("id", '=',$id)
                    ->update([$data[$i]["ind"]=> null]);
                }
        }

        DB::select('COMMIT;');
        return 'ok'; 
    }catch(Exception $e){

        DB::select('COMMIT;');
        DB::select('ROLLBACK TO mon_pointdesauvegarde;');
        DB::select('COMMIT;');
        return $e;

    }

}
  

  public function share(Request $request)
  {
        try{ 
          DB::select('BEGIN;');
          DB::select('SAVEPOINT mon_pointdesauvegarde;');
          $id=$request->input('id',null);
          $shema=$request->input('shema',null);
          $sous_thematique=$request->input('sous_thematique',null);
          $key_couche=$request->input('key_couche',null);

          if ($shema) {
            
            if ($sous_thematique) {
              
              $table = DB::table('couche-sous-thematique')->select('id_couche','image_src','remplir_couleur','contour_couleur','opacity','geom')
                  ->where('id',$key_couche)
                  ->get();

              $tab=$shema.'."'.$table[0]->id_couche.'"';

              $datajson=DB::select('select *,ST_AsGeoJSON(geom) as geometry from '.$tab.' where id ='. $id);
              $datajson[0]->sous_thematique = true;
              $datajson[0]->images_theme = $table[0]->image_src;
              $datajson[0]->remplir_couleur = $table[0]->remplir_couleur;
              $datajson[0]->contour_couleur = $table[0]->contour_couleur;
              $datajson[0]->opacity = $table[0]->opacity;
              $datajson[0]->geom = $table[0]->geom;
              $datajson[0]->key_couche = $key_couche;
              $datajson[0]->table = $table[0]->id_couche;
              $datajson[0]->shema = $shema;

            } else {

              $donne = DB::table('couche-thematique')->select('id-thematique as id_thematique','id_couche','image_src','remplir_couleur','contour_couleur','opacity','geom')
                  ->where('id',$key_couche)
                  ->get();

              $tab=$shema.'."'.$donne[0]->id_couche.'"';

              $datajson=DB::select('select *,ST_AsGeoJSON(geom) as geometry from '.$tab.' where id ='. $id);
              $datajson[0]->sous_thematique = false;
              $datajson[0]->images_theme = $donne[0]->image_src;
              $datajson[0]->remplir_couleur = $donne[0]->remplir_couleur;
              $datajson[0]->contour_couleur = $donne[0]->contour_couleur;
              $datajson[0]->opacity = $donne[0]->opacity;
              $datajson[0]->geom = $donne[0]->geom;
              $datajson[0]->key_couche = $key_couche;
              $datajson[0]->table = $donne[0]->id_couche;
              $datajson[0]->shema = $shema;
            }

          } else {
            
            if ($sous_thematique) {
              
              $id_thematique = DB::table('sous-thematique')->select('id-thematique as id_thematique')
                  ->where('id',$sous_thematique)
                  ->get();
             
              $shema = DB::table('thematique')->select('shema')
                  ->where('id',$id_thematique[0]->id_thematique)
                  ->get();

              $table = DB::table('couche-sous-thematique')->select('id_couche','image_src','remplir_couleur','contour_couleur','opacity','geom')
                  ->where('id',$key_couche)
                  ->get();

              $tab=$shema[0]->shema.'."'.$table[0]->id_couche.'"';

              $datajson=DB::select('select *,ST_AsGeoJSON(geom) as geometry from '.$tab.' where id ='. $id);
              $datajson[0]->sous_thematique = true;
              $datajson[0]->images_theme = $table[0]->image_src;
              $datajson[0]->remplir_couleur = $table[0]->remplir_couleur;
              $datajson[0]->contour_couleur = $table[0]->contour_couleur;
              $datajson[0]->opacity = $table[0]->opacity;
              $datajson[0]->geom = $table[0]->geom;
              $datajson[0]->key_couche = $key_couche;
              $datajson[0]->table = $table[0]->id_couche;
              $datajson[0]->shema = $shema[0]->shema;

            } else {

              $donne = DB::table('couche-thematique')->select('id-thematique as id_thematique','id_couche','image_src','remplir_couleur','contour_couleur','opacity','geom')
                  ->where('id',$key_couche)
                  ->get();

              $shema = DB::table('thematique')->select('shema')
                  ->where('id', $donne[0]->id_thematique )
                  ->get();

              $tab=$shema[0]->shema.'."'.$donne[0]->id_couche.'"';

              $datajson=DB::select('select *,ST_AsGeoJSON(geom) as geometry from '.$tab.' where id ='. $id);
              $datajson[0]->sous_thematique = false;
              $datajson[0]->images_theme = $donne[0]->image_src;
              $datajson[0]->remplir_couleur = $donne[0]->remplir_couleur;
              $datajson[0]->contour_couleur = $donne[0]->contour_couleur;
              $datajson[0]->opacity = $donne[0]->opacity;
              $datajson[0]->geom = $donne[0]->geom;
              $datajson[0]->key_couche = $key_couche;
              $datajson[0]->table = $donne[0]->id_couche;
              $datajson[0]->shema = $shema[0]->shema;
            }

          }
          
          if ($datajson) {
            return $datajson;
          }

          return 'ko' ;
          DB::select('COMMIT;');
         
      }catch(Exception $e){

          DB::select('COMMIT;');
          DB::select('ROLLBACK TO mon_pointdesauvegarde;');
          DB::select('COMMIT;');
          return $e;

      }
  }

  public function getLimite(Request $request)
  {
      DB::select('BEGIN;');
      DB::select('SAVEPOINT mon_pointdesauvegarde;');

      $coord_4326=$request->input('coord',null);
      
      $coord = DB::select("select ST_TRANSFORM(ST_SetSRID(ST_Point(".$coord_4326[0].",".$coord_4326[1]."),4326),4326) as geom");

      $limites = DB::table('limite_admin')->select('nom_table','nom','sous_thematiques','key_couche','id_limite')->get();

      $reponse= array();

      for ($i=0; $i < sizeof($limites) ; $i++) { 
        
        $lim_i = DB::select("SELECT name FROM ".$limites[$i]->nom_table." WHERE ST_Contains( geometry , '".$coord[0]->geom."'::geometry ) "  );
        
        if (sizeOf($lim_i)>0 ) {
          $reponse[$limites[$i]->nom] = $lim_i[0]->name;
        }else{
          $reponse[$limites[$i]->nom] = false;
        }
        
      }

      return  $reponse;
  }

  public function getListLimit(Request $request)
  {
    DB::select('BEGIN;');
    DB::select('SAVEPOINT mon_pointdesauvegarde;');


    $quartiers = 'quartiers';

    $communes = 'communes';
    $departements = 'departements';
    $regions = 'regions';

    $table=$request->input('table');
    
    // ST_TRANSFORM(ST_SetSRID(way),900913),4326)
    $list=DB::select("SELECT name, id,hstore_to_json->'ref:INSEE' as ref FROM ".$table." ORDER BY name");

    return  $list;
  }

  public function getLimitById(Request $request)
  {
    DB::select('BEGIN;');
    DB::select('SAVEPOINT mon_pointdesauvegarde;');

    $table=$request->input('table');
    $id=$request->input('id');
    $geometry=DB::select("SELECT name,st_asgeojson(ST_TRANSFORM(ST_SetSRID(geometry,4326),4326)) as geometry FROM ".$table." where id=".$id);
    
    return json_encode($geometry[0]) ;
  }


  public function saveDraw (Request $Requests) 
   {

      try{

        DB::select('BEGIN;');
        DB::select('SAVEPOINT mon_pointdesauvegarde;');

        
        $donnes = $Requests->input('donnes',null);

        $max=DB::table("dessin")->max('id_dessin');
          
          if ($max==null) {
            $max=11;
          }

          $max=$max+1000;

          $code="RF4QWYmjJonDwQKS8LqwDA".$max;
          
          $date = date('Y-m-d H:i:s');

        $id_dessin=DB::table('dessin')->insertGetId(
              ['date_creation' => date("Y-m-d H:i:s"),'code_dessin'=>$code],'id_dessin'
            );

      

        foreach ($donnes as $donne ) {
          //return "INSERT INTO graphique (id_dessin,descripion,hexa_code,type_dessin,geom) VALUES (".$id_dessin.",'".$donne['comment']."','".$donne['hexa_code']."','".$donne['type']."',ST_GeomFromGeoJSON('".json_encode($donne['geom'])."'))";

          $querry = DB::select("INSERT INTO graphique (id_dessin,descripion,hexa_code,type_dessin,geom) VALUES (".$id_dessin.",'".$donne['comment']."','".$donne['hexa_code']."','".$donne['type']."',ST_GeomFromGeoJSON('".json_encode($donne['geom'])."'))");
        }


        $data['status'] ='ok';
        $data['code_dessin'] =$code;

        DB::select('COMMIT;');

        return $data;


    }catch(\Exception $e){
                     
         DB::select('ROLLBACK TO mon_pointdesauvegarde;');
        DB::select('COMMIT;');
              return $e;
    }

      
   }

   public function getDraw(Request $Requests)
   {
     
    try{
      
        DB::select('BEGIN;');
        DB::select('SAVEPOINT mon_pointdesauvegarde;');
      
              
        $code_dessin = $Requests->input('code_dessin',null);

        $id_dessin = DB::table('dessin')->select('code_dessin', 'date_creation','id_dessin')
        ->where("code_dessin","=",$code_dessin)
        ->get();
        //return $id_dessin[0]->id_dessin;

        $dessins = DB::select("Select id_dessin,descripion,hexa_code,type_dessin,st_asgeojson(geom) as geometry from graphique where id_dessin =".$id_dessin[0]->id_dessin);
        
        
        $data['status'] ='ok';
        $data['dessins'] =$dessins;

        DB::select('COMMIT;');

        return $data;


      }catch(\Exception $e){
                      
          DB::select('ROLLBACK TO mon_pointdesauvegarde;');
          DB::select('COMMIT;');
                return $e;
      }
   }

   public function drapeline (Request $Requests) 
   {

      try{

        DB::select('BEGIN;');
        DB::select('SAVEPOINT mon_pointdesauvegarde;');

        
        $coordinates = $Requests->input('donnes',null);
        //st_transform(ST_MakeLine(geom),3857)
      
        $querry = DB::select("select st_asgeojson(st_transform(ST_SetSRID((drape('".json_encode($coordinates)."')),32632),3857)) as drape");

        return json_encode($querry[0]->drape);
        DB::select('COMMIT;');
        
      }catch(\Exception $e){
          
          DB::select('ROLLBACK TO mon_pointdesauvegarde;');
              DB::select('COMMIT;');
          return $e;
      }
    

  }

  public function getAlti(Request $Requests)
  {
    $lon = $Requests->input('lon',null);
    $lat = $Requests->input('lat',null);

    $querry = DB::select(" select ST_Value(rast, ST_Transform(ST_SetSRID(ST_MakePoint(".$lon.", ".$lat."),4326),32632)) as value from srtm WHERE ST_Intersects(rast,ST_Transform(ST_SetSRID(ST_MakePoint( ".$lon.", ".$lat."),4326),32632)) ");
    
    if (sizeof($querry) >= 1 ) {
      return $querry[0]->value;
    }else{
      return 'ko';
    }
   
  }

  public function getUsers(Request $Requests)
  {
          try{
      
              DB::select('BEGIN;');
              DB::select('SAVEPOINT mon_pointdesauvegarde;');
      
              
              $donnes = $Requests->input('donnes',null);

              $users = DB::table('utilisateur')->select('nom', 'src_photo','email','id_utilisateur')
              ->where("id_instances_gc","=",$this->id_instance_gc)
              ->whereIn('id_utilisateur',$donnes)
              ->get();

              DB::select('COMMIT;');
              return $users;
            
          }catch(\Exception $e){
              
              DB::select('ROLLBACK TO mon_pointdesauvegarde;');
                  DB::select('COMMIT;');
              return $e;
          }
  }

  public function searchLimiteInTable(Request $Requests)
  {
    $word = $Requests->input('word',null);
    $table = $Requests->input('table',null);
    $limitResults = 10;
    
    $limites = DB::select("SELECT id ,name,hstore_to_json->'ref:INSEE' as ref FROM public.$table where strpos(regexp_replace(regexp_replace(lower(name), '[é,è]', 'e', 'g'), '[".' '.",-]', '', 'g'), regexp_replace(regexp_replace(lower('".$word."'), '[é,è]', 'e', 'g'), '[".' '.",-]', '', 'g')) >0 LIMIT $limitResults " );
   
    return $limites;
  }

  public function searchLimite(Request $Requests)
  {
          try{
      
              DB::select('BEGIN;');
              DB::select('SAVEPOINT mon_pointdesauvegarde;');

              $word = $Requests->input('word',null);
              $all_limites = DB::table('limite_admin')->select('nom_table','nom','sous_thematiques','key_couche','id_limite')->get();

              foreach ($all_limites as $one_limite) {
                $limites = DB::select("SELECT id ,name,hstore_to_json->'ref:INSEE' as ref FROM public.$one_limite->nom_table where strpos(regexp_replace(regexp_replace(lower(name), '[é,è]', 'e', 'g'), '[".' '.",-]', '', 'g'), regexp_replace(regexp_replace(lower('".$word."'), '[é,è]', 'e', 'g'), '[".' '.",-]', '', 'g')) >0 limit 10");
                $data[$one_limite->nom_table] =$limites;
              }

              // $communes = DB::select("SELECT id ,name,hstore_to_json->'ref:INSEE' as ref FROM public.communes where strpos(regexp_replace(regexp_replace(lower(name), '[é,è]', 'e', 'g'), '[".' '.",-]', '', 'g'), regexp_replace(regexp_replace(lower('".$word."'), '[é,è]', 'e', 'g'), '[".' '.",-]', '', 'g')) >0");
              // $departements = DB::select("SELECT id ,name,hstore_to_json->'ref:INSEE' as ref FROM public.departements where strpos(regexp_replace(regexp_replace(lower(name), '[é,è]', 'e', 'g'), '[".' '.",-]', '', 'g'), regexp_replace(regexp_replace(lower('".$word."'), '[é,è]', 'e', 'g'), '[".' '.",-]', '', 'g')) >0");
              // $regions = DB::select("SELECT id ,name,hstore_to_json->'ref:INSEE' as ref FROM public.regions where strpos(regexp_replace(regexp_replace(lower(name), '[é,è]', 'e', 'g'), '[".' '.",-]', '', 'g'), regexp_replace(regexp_replace(lower('".$word."'), '[é,è]', 'e', 'g'), '[".' '.",-]', '', 'g')) >0");
              // $quartiers = DB::select("SELECT id ,name,hstore_to_json->'ref:INSEE' as ref FROM public.quartiers where strpos(regexp_replace(regexp_replace(lower(name), '[é,è]', 'e', 'g'), '[".' '.",-]', '', 'g'), regexp_replace(regexp_replace(lower('".$word."'), '[é,è]', 'e', 'g'), '[".' '.",-]', '', 'g')) >0");
              
              $data['status'] ='ok';
              // $data['communes'] =$communes;
              // $data['departements'] =$departements;
              // $data['quartiers'] =$quartiers;
              // $data['regions'] =$regions;

              DB::select('COMMIT;');
              return $data;
            
          }catch(\Exception $e){
              
              DB::select('ROLLBACK TO mon_pointdesauvegarde;');
                  DB::select('COMMIT;');
              return $e;
          }
  }

   public function getLimiteById(Request $Requests)
  {
          try{
      
              DB::select('BEGIN;');
              DB::select('SAVEPOINT mon_pointdesauvegarde;');

              $id = $Requests->input('id',null);
              $table = $Requests->input('table',null);

              $limites = DB::select("SELECT id ,name,hstore_to_json->'ref:INSEE' as ref,st_asgeojson(st_transform(geometry,4326)) FROM ".$table." where id =".$id);
             
              $data['status'] ='ok';
              $data['data'] =$limites[0];
             
              DB::select('COMMIT;');
              return $data;
            
          }catch(\Exception $e){
              
              DB::select('ROLLBACK TO mon_pointdesauvegarde;');
                  DB::select('COMMIT;');
              return $e;
          }
  }

  public function getZoneInteret(Request $Requests)
  {
          try{
      
              DB::select('BEGIN;');
              DB::select('SAVEPOINT mon_pointdesauvegarde;');


              $zone = DB::select("SELECT id ,st_asgeojson(st_transform(ST_SimplifyPreserveTopology(geom,".env('simplifyGeometry',0)."),4326)) as geometry FROM instances_gc where id =".$this->id_instance_gc);
             
              $data['status'] ='ok';
              $data['data'] =$zone[0];
             
              DB::select('COMMIT;');
              return $data;
            
          }catch(\Exception $e){
              
              DB::select('ROLLBACK TO mon_pointdesauvegarde;');
                  DB::select('COMMIT;');
              return $e;
          }
  }

 
  public function addCountVieuwData(Request $Requests)
  { 

    try{
      
       DB::select('BEGIN;');
       DB::select('SAVEPOINT mon_pointdesauvegarde;');

             
      $type = $Requests->input('type',null);
      $sous = $Requests->input('sous',null);
      $id_couche = $Requests->input('id_couche',null);
     
      if($type == "thematiques"){
        if ($sous) {
          $count = DB::table('couche-sous-thematique')->select('vues')
          ->where('id',$id_couche)
          ->get();

          if($count[0]->vues == null){
            $new_count = 1;
          }else{
            $new_count = $count[0]->vues + 1;
          }
          
          DB::table("couche-sous-thematique")
            ->where("id", '=',$id_couche)
            ->update(["vues"=> $new_count ]);
        } else {
          $count = DB::table('couche-thematique')->select('vues')
          ->where('id',$id_couche)
          ->get();

          if($count[0]->vues == null){
            $new_count = 1;
          }else{
            $new_count = $count[0]->vues + 1;
          }

          DB::table("couche-thematique")
            ->where("id", '=',$id_couche)
            ->update(["vues"=> $new_count ]);
        }
        
      }else if($type == "cartes"){
        if ($sous) {
          $count = DB::table('couche-sous-cartes')->select('vues')
          ->where('id',$id_couche)
          ->get();

          if($count[0]->vues == null){
            $new_count = 1;
          }else{
            $new_count = $count[0]->vues + 1;
          }

          DB::table("couche-sous-cartes")
            ->where("id", '=',$id_couche)
            ->update(["vues"=> $new_count ]);
        } else {
          $count = DB::table('couche-cartes')->select('vues')
          ->where('id',$id_couche)
          ->get();

          if($count[0]->vues == null){
            $new_count = 1;
          }else{
            $new_count = $count[0]->vues + 1;
          }

          DB::table("couche-cartes")
            ->where("id", '=',$id_couche)
            ->update(["vues"=> $new_count ]);
        }
      }else if($type == "pdf"){
        $count = DB::table('sous_cartes_pdf')->select('vues')
        ->where('id',$id_couche)
        ->get();

        if($count[0]->vues == null){
          $new_count = 1;
        }else{
          $new_count = $count[0]->vues + 1;
        }

        DB::table("sous_cartes_pdf")
          ->where("id", '=',$id_couche)
          ->update(["vues"=> $new_count ]);
      }

      DB::select('COMMIT;');
      $data['status'] ='ok';
      return $data;

    } catch(\Exception $e){
      
      DB::select('ROLLBACK TO mon_pointdesauvegarde;');
          DB::select('COMMIT;');
      return $e;
    }
    

  }

  public function getVisitiors(Request $Requests)
	{
		$couche = DB::table('couche-sous-cartes')->select('vues','nom')
        ->where('id',82)
        ->get();

        return $couche;
  }
  
  public function getFeatureFromLayerById(Request $Requests)
  {
    $sous_thematique = $Requests->input('sous_thematique',null);
    $id_thematique = $Requests->input('id_thematique',null);
    $key_couche = $Requests->input('key_couche',null);
    $id = $Requests->input('id',null);

    if ($sous_thematique) {
      
      $shema = DB::table('thematique')->select('shema','nom')
          ->where('id',$id_thematique)
          ->get();

      $table = DB::table('couche-sous-thematique')->select('id_couche','image_src','nom')
          ->where('id',$key_couche)
          ->get();

      $tab=$shema[0]->shema.'."'.$table[0]->id_couche.'"';

      $champ_principal = DB::table('catalogue_champ_principal')->select('champ','sous_thematiques','*')
      ->where([
        ['id_theme', $key_couche],
          ['sous_thematiques', 'true']
      ])
      ->get();
      
      $querry=DB::select('select *,ST_AsGeoJSON(geom) as geometry from '.$tab.' where id ='. $id);

      if (sizeof($champ_principal) == 1) {
        $dd =$champ_principal[0]->champ ;
        $nom=$querry[0] -> $dd;
      }else{
        $nom = $table[0]->nom ;
      }

      $nom_title = $shema[0]->nom.' - '.$table[0]->nom.' - '.$nom;
      $img = $table[0]->image_src;

    } else {

      $donne = DB::table('couche-thematique')->select('id-thematique as id_thematique','id_couche','image_src','nom')
          ->where('id',$key_couche)
          ->get();

      $shema = DB::table('thematique')->select('shema','nom')
          ->where('id', $id_thematique )
          ->get();

      $tab=$shema[0]->shema.'."'.$donne[0]->id_couche.'"';

      $champ_principal = DB::table('catalogue_champ_principal')->select('champ')
      ->where([
        ['id_theme', $key_couche],
            ['sous_thematiques','=', 'false'],
      ])
      ->get();

      $querry=DB::select('select *,ST_AsGeoJSON(geom) as geometry,'.$champ_principal[0]->champ.' from '.$tab.' where id ='. $id);
      if (sizeof($champ_principal) == 1) {
        $dd =$champ_principal[0]->champ ;
        $nom=$querry[0] -> $dd;
      }else{
        $nom = $donne[0]->nom ;
      }

      $nom_title = $shema[0]->nom.' - '.$donne[0]->nom.' - '.$nom;
      $img = $donne[0]->image_src;
      
    }

    $response = [];
    $response['img']=$img;
    $response['nom_title']=$nom_title;
    $response['data']= $querry[0];
    return $response;

  }
}