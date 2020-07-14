<?php

namespace App\Http\Controllers;
ini_set('max_execution_time', '900'); // 1.5 mins

use Illuminate\Http\Request;

use App\Http\Requests;

use DB;
use File;
use SimpleXMLElement;
class AdminController extends Controller
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

    public function DataCatalog()
    {
  
        $data=[];
        $i=0;
        try{

            $themetique=DB::table("thematique")->select("id","nom","image_src","shema","color","ordre")
                                               ->where("sous-sous-thematique","=",true)->where("id_instances_gc","=",$this->id_instance_gc)->get();

            foreach ($themetique as $keythemetique) {

                $sousthemetique=DB::table("thematique")
                                     ->join("sous-thematique","sous-thematique.id-thematique","=","thematique.id")
                                     ->select("sous-thematique.id","sous-thematique.nom","sous-thematique.image_src")
                                     ->where("sous-thematique.id-thematique",$keythemetique->id)->get(); 


                $data[$i]=["ordre"=>$keythemetique->ordre,"id"=>$i,"id_thematique"=>$keythemetique->id,"nom"=>$keythemetique->nom,"color"=>$keythemetique->color,"img"=>$keythemetique->image_src,"shema"=>$keythemetique->shema,"sous_thematiques"=>[]];
                
             
                $k=0;
                 foreach ($sousthemetique as $keysousthematique) {

                 
                 array_push($data[$i]["sous_thematiques"], ["id"=>$k,"key"=>$keysousthematique->id,"nom"=>$keysousthematique->nom,"img"=>$keysousthematique->image_src,"active"=>false,"couches"=>[]]);


                 $couchethemetique=DB::table("sous-thematique") 
                                     ->join("couche-sous-thematique","couche-sous-thematique.id-sous-thematique","=","sous-thematique.id")
                                     ->select("couche-sous-thematique.logo_src","couche-sous-thematique.service_wms","couche-sous-thematique.number","couche-sous-thematique.wms_type","couche-sous-thematique.url","couche-sous-thematique.identifiant","couche-sous-thematique.bbox","couche-sous-thematique.projection","couche-sous-thematique.zmax","couche-sous-thematique.zmin","couche-sous-thematique.type_couche","couche-sous-thematique.remplir_couleur","couche-sous-thematique.contour_couleur","couche-sous-thematique.opacity","couche-sous-thematique.id","couche-sous-thematique.nom","couche-sous-thematique.image_src","couche-sous-thematique.id_couche","couche-sous-thematique.geom")
                                     ->where("couche-sous-thematique.id-sous-thematique",$keysousthematique->id)->get();

                $idcouche=0;
                 foreach ( $couchethemetique as $keycouchethemetique) {
                    


                  array_push($data[$i]["sous_thematiques"][$k]["couches"],["logo_src"=>$keycouchethemetique->logo_src,"service_wms"=>$keycouchethemetique->service_wms,"number"=>$keycouchethemetique->number,"wms_type"=>$keycouchethemetique->wms_type,"url"=>$keycouchethemetique->url,"identifiant"=>$keycouchethemetique->identifiant,"bbox"=>$keycouchethemetique->bbox,"projection"=>$keycouchethemetique->projection,"zmax"=>$keycouchethemetique->zmax,"zmin"=>$keycouchethemetique->zmin,"type_couche"=>$keycouchethemetique->type_couche,"remplir_couleur"=>$keycouchethemetique->remplir_couleur,"contour_couleur"=>$keycouchethemetique->contour_couleur,"opacity"=>$keycouchethemetique->opacity,"id"=>$idcouche,"nom"=>$keycouchethemetique->nom,"img"=>$keycouchethemetique->image_src,"check"=>false,"id_couche"=>$keycouchethemetique->id_couche,"key_couche"=>$keycouchethemetique->id ,"geom"=>$keycouchethemetique->geom,"colonnes"=>array()]);

                    ////////////// metadata metadata metadata metadata metadata metadata //////////////////////////////
                     
                      
                    $metadata=DB::table("metadata_thematiques")->select("resume","licence","description","zone","date_creation","update","epsg","langue",
                    "echelle","sous_thematiques","id_referent","id")
                        ->where("sous_thematiques","=",true)
                        ->where("id_referent","=",$keycouchethemetique->id)->get();
                    
                    $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['metadata'] = array();
                    
                    if (sizeof($metadata) > 0 ) {
                         
                        $tags =  DB::table("tags")->select("tags","id_referent","sous","type")
                        ->where("id_referent","=",$metadata[0]->id)->where("sous","=",true)->where("type","=","thematiques")->get();

                        $partenaire =  DB::table("partenaire")->select("id_user","id_referent","sous","type")
                        ->where("id_referent","=",$metadata[0]->id)->where("sous","=",true)->where("type","=","thematiques")->get();
                       
                        $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['metadata'] = $metadata[0];
                      
                       $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['metadata']->tags =  $tags;
                       $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['metadata']->partenaire =  $partenaire;

                     }

                  if ($keycouchethemetique->type_couche == 'requete' || $keycouchethemetique->wms_type == 'osm') {

                         $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['cles_vals_osm'] = array();

                        $id_cat=DB::table("categorie")->select("id_cat","key_couche","nom_cat","sous_thematiques","status","number","file_json","surface","distance", "sql_complete", "mode_sql", "select")
                                               ->where("sous_thematiques","=",true)->where("key_couche","=",$keycouchethemetique->id)->get();
                                               
                         $sous_categorie = false;                 
                        if ($id_cat) {

                           $sous_categorie=DB::table("sous_categorie")->select("id_cat","action","operateur","nom",'id','condition')
                                               ->where("id_cat","=",$id_cat[0]->id_cat)->get();
                        }


                        if ($sous_categorie || ($id_cat && $id_cat[0]->mode_sql)) {

                            $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['cles_vals_osm'] = $sous_categorie;
                            $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['status'] =$id_cat[0]->status;
                            $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['number'] =$id_cat[0]->number;
                            $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['surface_totale'] =$id_cat[0]->surface;
                            $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['distance_totale'] =$id_cat[0]->distance;
                            $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['id_cat'] =$id_cat[0]->id_cat;
                            $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['categorie'] = ["select"=>$id_cat[0]->select,"mode_sql"=>$id_cat[0]->mode_sql,"sql_complete"=>$id_cat[0]->sql_complete];
                            $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['file_json'] =$id_cat[0]->file_json;
                            $data[$i]["sous_thematiques"][$k]["couches"][$idcouche]['params_files'] =[
                                "nom_cat"=>$id_cat[0]->nom_cat,
                                "sous_thematiques"=>$id_cat[0]->sous_thematiques,
                                "key_couche"=>$id_cat[0]->key_couche,
                                "id_cat"=>$id_cat[0]->id_cat,
                            ];
                        }
                    }
                  

                  $cols=DB::select("select column_name as nom ,column_name as champ from information_schema.columns where table_schema = '".$keythemetique->shema."' and table_name = '".$keycouchethemetique->id_couche."'");
                  
                  foreach ($cols as $col) {
                       array_push($data[$i]["sous_thematiques"][$k]["couches"][$idcouche]["colonnes"],$col);
                   }
                    $idcouche++;
                 }  

                 $k++;  

                    }

                     $i++;
                
            }


            $themetique=DB::table("thematique")->select("id","nom","image_src","shema","color","ordre")
                                               ->where("sous-sous-thematique","=",false)->where("id_instances_gc","=",$this->id_instance_gc)->get();


            foreach ($themetique as $keythemetique) {

                $couchethemetique=DB::table("thematique")
                                     ->join("couche-thematique","couche-thematique.id-thematique","=","thematique.id")
                                     ->select("couche-thematique.logo_src","couche-thematique.service_wms","couche-thematique.number","couche-thematique.wms_type","couche-thematique.url","couche-thematique.identifiant","couche-thematique.bbox","couche-thematique.projection","couche-thematique.zmax","couche-thematique.zmin","couche-thematique.type_couche","couche-thematique.remplir_couleur","couche-thematique.contour_couleur","couche-thematique.opacity","couche-thematique.id","couche-thematique.nom","couche-thematique.image_src","couche-thematique.id_couche","couche-thematique.geom")
                                     ->where("couche-thematique.id-thematique",$keythemetique->id)->get();
                
                $data[$i]=["ordre"=>$keythemetique->ordre,"id"=>$i,"id_thematique"=>$keythemetique->id,"nom"=>$keythemetique->nom,"color"=>$keythemetique->color,"img"=>$keythemetique->image_src,"shema"=>$keythemetique->shema,"sous_thematiques"=>false,"couches"=>[]];
                $idcouche=0;
                foreach ($couchethemetique as $keycouchethematique) {


                   array_push($data[$i]["couches"],["logo_src"=>$keycouchethematique->logo_src,"service_wms"=>$keycouchethematique->service_wms,"number"=>$keycouchethematique->number,"wms_type"=>$keycouchethematique->wms_type,"url"=>$keycouchethematique->url,"identifiant"=>$keycouchethematique->identifiant,"bbox"=>$keycouchethematique->bbox,"projection"=>$keycouchethematique->projection,"zmax"=>$keycouchethematique->zmax,"zmin"=>$keycouchethematique->zmin,"type_couche"=>$keycouchethematique->type_couche,"remplir_couleur"=>$keycouchethematique->remplir_couleur,"contour_couleur"=>$keycouchethematique->contour_couleur,"opacity"=>$keycouchethematique->opacity,"nom"=>$keycouchethematique->nom,"key_couche"=>$keycouchethematique->id,"img"=>$keycouchethematique->image_src,"check"=>false,"id_couche"=>$keycouchethematique->id_couche,"geom"=>$keycouchethematique->geom,"colonnes"=>array()]);

                       ////////////// metadata metadata metadata metadata metadata metadata //////////////////////////////
                     
                       $metadata=DB::table("metadata_thematiques")->select("resume","licence","description","zone","date_creation","update","epsg","langue",
                       "echelle","sous_thematiques","id_referent","id")
                            ->where("sous_thematiques","=",false)
                           ->where("id_referent","=",$keycouchethematique->id)->get();
                            $data[$i]["couches"][$idcouche]['metadata'] = array();
                        if (sizeof($metadata) > 0 ) {
                            
                           $tags =  DB::table("tags")->select("tags","id_referent","sous","type")
                           ->where("id_referent","=",$metadata[0]->id)->where("sous","=",false)->where("type","=","thematiques")->get();

                           $partenaire =  DB::table("partenaire")->select("id_user","id_referent","sous","type")
                           ->where("id_referent","=",$metadata[0]->id)->where("sous","=",false)->where("type","=","thematiques")->get();
                          
                            $data[$i]["couches"][$idcouche]['metadata'] = $metadata[0];
                         
                           $data[$i]["couches"][$idcouche]['metadata']->tags =  $tags;
                           $data[$i]["couches"][$idcouche]['metadata']->partenaire =  $partenaire;

                        }

                   if ($keycouchethematique->type_couche == 'requete' || $keycouchethematique->wms_type == 'osm') {
                        $data[$i]["couches"][$idcouche]['cles_vals_osm'] = array();
                        $id_cat=DB::table("categorie")->select("id_cat","key_couche","nom_cat","sous_thematiques","status","number","file_json","surface","distance", "sql_complete", "mode_sql","select")
                                               ->where("sous_thematiques","=",false)->where("key_couche","=",$keycouchethematique->id)->get();
                          $sous_categorie = false;                          
                        if ($id_cat) {

                           $sous_categorie=DB::table("sous_categorie")->select("id_cat","action","operateur","nom",'id','condition')
                                               ->where("id_cat","=",$id_cat[0]->id_cat)->get();
                        }


                        if ($sous_categorie || ($id_cat && $id_cat[0]->mode_sql)) {

                             $data[$i]["couches"][$idcouche]['cles_vals_osm'] = $sous_categorie;
                             $data[$i]["couches"][$idcouche]['status'] =$id_cat[0]->status;
                             $data[$i]["couches"][$idcouche]['number'] =$id_cat[0]->number;
                             $data[$i]["couches"][$idcouche]['surface_totale'] =$id_cat[0]->surface;
                             $data[$i]["couches"][$idcouche]['distance_totale'] =$id_cat[0]->distance;
                             $data[$i]["couches"][$idcouche]['id_cat'] =$id_cat[0]->id_cat;
                             $data[$i]["couches"][$idcouche]['categorie'] = [];
                             $data[$i]["couches"][$idcouche]['categorie'] = ["select"=>$id_cat[0]->select,"mode_sql"=>$id_cat[0]->mode_sql,"sql_complete"=>$id_cat[0]->sql_complete];
                             $data[$i]["couches"][$idcouche]['file_json'] =$id_cat[0]->file_json;
                             $data[$i]["couches"][$idcouche]['params_files'] =[
                                 "nom_cat"=>$id_cat[0]->nom_cat,
                                 "sous_thematiques"=>$id_cat[0]->sous_thematiques,
                                 "key_couche"=>$id_cat[0]->key_couche,
                                 "id_cat"=>$id_cat[0]->id_cat,
                             ];
                          }
                  
                    }

                   $cols=DB::select("select column_name as nom ,column_name as champ from information_schema.columns where table_schema = '".$keythemetique->shema."' and table_name = '".$keycouchethematique->id_couche."'");
                  
                   foreach ($cols as $col) {
                       array_push($data[$i]["couches"][$idcouche]["colonnes"],$col);
                   }

                   
                $idcouche++;
                }

                $i++;
            }

            $r = json_encode($data);
            return $data;
            $file = 'catalogue.json';
            $destinationPath=public_path()."/upload/";

            if (!is_dir($destinationPath)) {  
                mkdir($destinationPath,0777,true);
            }

            File::put($destinationPath.$file,$r);
            
            return 'ok';

        }catch(\Exception $e){
         
         return $e;
        }
    	
    }

    public function DataCatalogCartes()
    {
       $data=[]; 
        $i=0;

        try{

            $cartes=DB::table("cartes")->select("id","nom","sous-sous-cartes","color","image_src")
                                               ->where("sous-sous-cartes","=",true)->where("id_instances_gc","=",$this->id_instance_gc)->get();


            foreach ($cartes as $carte) {

                $souscartes=DB::table("cartes") 
                                     ->join("sous-cartes","sous-cartes.id-cartes","=","cartes.id")
                                     ->select("sous-cartes.id","sous-cartes.nom")
                                     ->where("sous-cartes.id-cartes",$carte->id)->get(); 


                $data[$i]=["id"=>$i,"id_cartes"=>$carte->id,"nom"=>$carte->nom,"color"=>$carte->color,"img"=>$carte->image_src,"sous_cartes"=>[],"principal"=>false];

                $k=0;

                foreach ($souscartes as $souscarte) {

                       
                        array_push($data[$i]["sous_cartes"], ["id"=>$k,"key"=>$souscarte->id,"nom"=>$souscarte->nom,"active"=>false,"couches"=>[]]);


                    $couchecartes=DB::table("sous-cartes")
                                     ->join("couche-sous-cartes","couche-sous-cartes.id-sous-cartes","=","sous-cartes.id")
                                     ->select("couche-sous-cartes.interrogeable","couche-sous-cartes.commentaire","couche-sous-cartes.principal","couche-sous-cartes.geom","couche-sous-cartes.url","couche-sous-cartes.identifiant","couche-sous-cartes.bbox","couche-sous-cartes.projection","couche-sous-cartes.zmax","couche-sous-cartes.zmin","couche-sous-cartes.id","couche-sous-cartes.nom","couche-sous-cartes.type","couche-sous-cartes.image_src")
                                     ->where("couche-sous-cartes.id-sous-cartes",$souscarte->id)->get(); 

                    $idcouche=0;

                    foreach ( $couchecartes as $couchecarte) {

              
                        array_push($data[$i]["sous_cartes"][$k]["couches"],["interrogeable"=>$couchecarte->interrogeable,"commentaire"=>$couchecarte->commentaire,"geom"=>$couchecarte->geom,"principal"=>$couchecarte->principal,"url"=>$couchecarte->url,"identifiant"=>$couchecarte->identifiant,"bbox"=>$couchecarte->bbox,"projection"=>$couchecarte->projection,"zmax"=>$couchecarte->zmax,"zmin"=>$couchecarte->zmin,"type"=>$couchecarte->type,"image_src"=>$couchecarte->image_src,"id"=>$idcouche,"nom"=>$couchecarte->nom,"check"=>false,"key_couche"=>$couchecarte->id ]);
                        if ($couchecarte->principal) {
                            $data[$i]["principal"]=$couchecarte->principal;
                        }

                        if ($couchecarte->type =='pdf') {
                          $data[$i]["sous_cartes"][$k]["couches"][$idcouche ]['cartes_pdf'] = [];

                           $cartes_pdf=DB::table("sous_cartes_pdf")->select("url_raster","id","pdf_public","name","url","image_src","id_referent","url_tile","description","bbox","zmax","zmin","type","identifiant")
                                               ->where("id_referent","=",$couchecarte->id)->get();

                           $data[$i]["sous_cartes"][$k]["couches"][$idcouche]['cartes_pdf'] = $cartes_pdf;

                            ////////////// metadata metadata metadata metadata metadata metadata //////////////////////////////
                            $index_pdf = 0;
                            foreach ($cartes_pdf as $carte_pdf) {
                               

                                $data[$i]["sous_cartes"][$k]["couches"][$idcouche ]['cartes_pdf'][$index_pdf]->metadata = array();
                                //var_dump ($data[$i]["sous_cartes"][$k]["couches"][$idcouche ]['cartes_pdf'][$index_pdf] );
                                    
                                $metadata=DB::table("metadata_cartes")->select("resume","licence","description","zone","date_creation","update","epsg","langue",
                                    "echelle","sous_cartes","id_referent","id")
                                    ->where("sous_cartes","=",true)
                                    ->where("id_referent","=",$carte_pdf->id)->get();
        
                                if (sizeof($metadata) > 0 ) { 
                                    $tags =  DB::table("tags")->select("tags","id_referent","sous","type")
                                        ->where("id_referent","=",$metadata[0]->id)->where("sous","=",true)->where("type","=","cartes")->get();
        
                                    $partenaire =  DB::table("partenaire")->select("id_user","id_referent","sous","type")
                                        ->where("id_referent","=",$metadata[0]->id)->where("sous","=",true)->where("type","=","cartes")->get();
                                  
                                    $data[$i]["sous_cartes"][$k]["couches"][$idcouche ]['cartes_pdf'][$index_pdf]->metadata = $metadata[0];
                                    $data[$i]["sous_cartes"][$k]["couches"][$idcouche ]['cartes_pdf'][$index_pdf]->metadata->tags =  $tags;
                                    $data[$i]["sous_cartes"][$k]["couches"][$idcouche ]['cartes_pdf'][$index_pdf]->metadata->partenaire =  $partenaire;
                                        
                                }

                                $index_pdf++;
                            } 

                        }else{
                             ////////////// metadata metadata metadata metadata metadata metadata //////////////////////////////
                            $data[$i]["sous_cartes"][$k]["couches"][$idcouche ]['metadata'] =array();
                           
                            $metadata=DB::table("metadata_cartes")->select("resume","licence","description","zone","date_creation","update","epsg","langue",
                            "echelle","sous_cartes","id_referent","id")
                            ->where("sous_cartes","=",true)
                                ->where("id_referent","=",$couchecarte->id)->get();
                                
                             if (sizeof($metadata) > 0 ) {
                               
                                $tags =  DB::table("tags")->select("tags","id_referent","sous","type")
                                ->where("id_referent","=",$metadata[0]->id)->where("sous","=",true)->where("type","=","cartes")->get();

                                $partenaire =  DB::table("partenaire")->select("id_user","id_referent","sous","type")
                                ->where("id_referent","=",$metadata[0]->id)->where("sous","=",true)->where("type","=","cartes")->get();
                               
                               $data[$i]["sous_cartes"][$k]["couches"][$idcouche ]['metadata'] = $metadata[0];
                              
                                $data[$i]["sous_cartes"][$k]["couches"][$idcouche ]['metadata']->tags =  $tags;
                                $data[$i]["sous_cartes"][$k]["couches"][$idcouche ]['metadata']->partenaire =  $partenaire;

                             }   
                           
                        }


                        $idcouche++; 
                    }

                    $k++;  
                }
                 $i++;
            } 

            $cartes=DB::table("cartes")->select("id","nom","sous-sous-cartes","color","image_src")
                                               ->where("sous-sous-cartes","=",false)->where("id_instances_gc","=",$this->id_instance_gc)->get();


            foreach ($cartes as $carte) {

                $couchecartes=DB::table("cartes")
                                     ->join("couche-cartes","couche-cartes.id-cartes","=","cartes.id")
                                     ->select("couche-cartes.interrogeable","couche-cartes.commentaire","couche-cartes.principal","couche-cartes.geom","couche-cartes.url","couche-cartes.identifiant","couche-cartes.bbox","couche-cartes.projection","couche-cartes.zmax","couche-cartes.zmin","couche-cartes.id","couche-cartes.nom","couche-cartes.type","couche-cartes.image_src")
                                     ->where("couche-cartes.id-cartes",$carte->id)->get();
                

                
                 $data[$i]=["id"=>$i,"id_cartes"=>$carte->id,"nom"=>$carte->nom,"color"=>$carte->color,"img"=>$carte->image_src,"sous_cartes"=>false,"couches"=>[],"principal"=>false];

                

                $idcouche=0;
                foreach ($couchecartes as $couchecarte) {

                   array_push($data[$i]["couches"],["interrogeable"=>$couchecarte->interrogeable,"geom"=>$couchecarte->geom,"principal"=>$couchecarte->principal,"url"=>$couchecarte->url,"identifiant"=>$couchecarte->identifiant,"bbox"=>$couchecarte->bbox,"projection"=>$couchecarte->projection,"zmax"=>$couchecarte->zmax,"zmin"=>$couchecarte->zmin,"type"=>$couchecarte->type,"image_src"=>$couchecarte->image_src,"nom"=>$couchecarte->nom,"key_couche"=>$couchecarte->id,"check"=>false]);
                   
                   if ($couchecarte->principal) {
                    $data[$i]["principal"]=$couchecarte->principal;
                   }

                   if ($couchecarte->type =='pdf') {
                           $data[$i]["couches"][$idcouche ]['cartes_pdf'] = [ ];

                           $cartes_pdf=DB::table("cartes_pdf")->select("url_raster","id","pdf_public","name","url","image_src","id_referent","url_tile","description","bbox","zmax","zmin","type","identifiant")
                                               ->where("id_referent","=",$couchecarte->id)->get();

                            $data[$i]["couches"][$idcouche ]['cartes_pdf'] = $cartes_pdf;

                             ////////////// metadata metadata metadata metadata metadata metadata //////////////////////////////
                             $index_pdf = 0;
                             foreach ($cartes_pdf as $carte_pdf) {
                                
 
                                 $data[$i]["couches"][$idcouche ]['cartes_pdf'][$index_pdf]->metadata = [];
                                 //var_dump ($data[$i]["couches"][$idcouche ]['cartes_pdf'][$index_pdf] );
                                     
                                 $metadata=DB::table("metadata_cartes")->select("resume","description","zone","date_creation","update","epsg","langue",
                                     "echelle","sous_cartes","id_referent","id")
                                     ->where("id_referent","=",$carte_pdf->id)->get();
         
                                 if (sizeof($metadata) > 0 ) {
                                     $tags =  DB::table("tags")->select("tags","id_referent","sous","type")
                                         ->where("id_referent","=",$metadata[0]->id)->where("sous","=",true)->where("type","=","cartes")->get();
         
                                     $partenaire =  DB::table("partenaire")->select("id_user","id_referent","sous","type")
                                         ->where("id_referent","=",$metadata[0]->id)->where("sous","=",true)->where("type","=","cartes")->get();
         
                                     $data[$i]["couches"][$idcouche ]['cartes_pdf'][$index_pdf]->metadata = $metadata[0];
                                     $data[$i]["couches"][$idcouche ]['cartes_pdf'][$index_pdf]->metadata->tags =  $tags;
                                     $data[$i]["couches"][$idcouche ]['cartes_pdf'][$index_pdf]->metadata->partenaire =  $partenaire;
                                         
                                 }
 
                                 $index_pdf++;
                             }
                    }else{
                        ////////////// metadata metadata metadata metadata metadata metadata //////////////////////////////
                      $data[$i]["couches"][$idcouche ]['metadata'] =array();
                      
                       $metadata=DB::table("metadata_cartes")->select("resume","description","zone","date_creation","update","epsg","langue",
                       "echelle","sous_cartes","id_referent","id")
                           ->where("id_referent","=",$couchecarte->id)->get();
                           
                        if (sizeof($metadata) > 0 ) {
                          
                           $tags =  DB::table("tags")->select("tags","id_referent","sous","type")
                           ->where("id_referent","=",$metadata[0]->id)->where("sous","=",true)->where("type","=","cartes")->get();

                           $partenaire =  DB::table("partenaire")->select("id_user","id_referent","sous","type")
                           ->where("id_referent","=",$metadata[0]->id)->where("sous","=",true)->where("type","=","cartes")->get();
                          
                         $data[$i]["couches"][$idcouche ]['metadata'] = $metadata[0];
                         
                          $data[$i]["couches"][$idcouche ]['metadata']->tags =  $tags;
                          $data[$i]["couches"][$idcouche ]['metadata']->partenaire =  $partenaire;

                        }   
                      
                   }

                    $idcouche++;
                }

                $i++;
            }

             return $data;   

        }catch(\Exception $e){
         
            return $e;
        }
    }

    public function DataJson($shema,$exp){


        try{

            $exp='"'.$exp.'"';

             $datajson=DB::select('select *,ST_AsGeoJSON(geom) as geometry from '.$shema.".".$exp.'');
                
            return $datajson;


        }catch(\Exception $e){
             
             return $e;
        }

   }

   public function add_limite_administrative(Request $Requests)
   {
    try{
        DB::select('BEGIN;');
        DB::select('SAVEPOINT mon_pointdesauvegarde;'); 


        $nom = $Requests->input('nom');
        $key_couche = $Requests->input('key_couche');
        $sous_thematiques = $Requests->input('sous_thematiques');

        $nom_table = strtolower(preg_replace("/[^a-zA-Z]/", "", $nom));
        

        $categorie = DB::table('categorie')->select('sql')->where(
            [
                ["key_couche","=",$key_couche],
                ["sous_thematiques","=",$sous_thematiques]
            ]
        )->get();

        $sql = $categorie[0]->sql;
        // return 'create table '.$nom_table.' as '.$sql;
        $querry = DB::select('create table '.$nom_table.' as '.$sql);
        DB::select("ALTER TABLE ".$nom_table." ADD COLUMN id serial");
        DB::select("ALTER TABLE ".$nom_table." ADD PRIMARY KEY (id)");

        DB::select("DROP INDEX IF EXISTS ".$nom_table."_geometry_idx ");
        DB::select("CREATE INDEX ".$nom_table."_geometry_idx ON $nom_table  USING GIST(geometry)");
        
        $id_limite = DB::table('limite_admin')->insertGetId(
            ['nom_table' => $nom_table,'nom' => $nom, 'sous_thematiques' => $sous_thematiques,'key_couche'=>$key_couche],'id_limite'
        );

        DB::select('COMMIT;');
        $data['status'] ='ok';
        $data['id_limite'] =$id_limite;
        $data['nom_table'] =$nom_table;

        return $data;

    }catch(\Exception $e){
        
        DB::select('ROLLBACK TO mon_pointdesauvegarde;');
        DB::select('COMMIT;');
                return $e;
        }
   }

   public function config_bd_projet(Request $Requests)
   {
        $limites = DB::table('limite_admin')->select('nom_table','nom','sous_thematiques','key_couche','id_limite')->get();
        $extent =DB::select("select min(ST_XMin(st_transform(geom,3857))) as a,min(ST_YMin(st_transform(geom,3857))) as b,max(ST_XMax(st_transform(geom,3857))) as c,max(ST_YMax(st_transform(geom,3857))) as d from instances_gc where id='".$this->id_instance_gc."'");
        
         $data['status'] ='ok';
         $data['bbox'] =[];
         if (sizeof($extent) >0 ) {
            $bbox =  array(floatval($extent[0]->a),floatval($extent[0]->b),floatval($extent[0]->c),floatval($extent[0]->d));
            // "[".$extent[0]->a.",".$extent[0]->b.",".$extent[0]->c.",".$extent[0]->d."]";
            $data['bbox'] = $bbox;
        }
         $data['limites'] =$limites;
        return $data;
   }

   public function delete_limite_administrative(Request $Requests)
   {
    try{
        DB::select('BEGIN;');
        DB::select('SAVEPOINT mon_pointdesauvegarde;'); 

        $id_limite = $Requests->input('id_limite');

        $nom_table = DB::table('limite_admin')->select('nom_table')->where("id_limite","=",$id_limite)->get();

        if (sizeof($nom_table)>0) {
            DB::select("DROP TABLE ".$nom_table[0]->nom_table);
            DB::table('limite_admin')->where("id_limite","=",$id_limite)->delete();
            DB::select("DROP INDEX IF EXISTS ".$nom_table[0]->nom_table."_geometry_idx ");
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

   public function getAllExtents(Request $Requests)
   {
    $zone = DB::select("SELECT id,CASE when id=2 then true else false end as active,nom,st_asgeojson(ST_SetSRID(ST_Extent(st_transform(geom,4326)),4326)) as geometry FROM instances_gc where id > 1 and id !=4 group by id,nom order by nom");
    return $zone;     
   }

   public function users()
   {
        $data=[];
        $i=0;
       try{

            $users = DB::table('utilisateur')->select('nom', 'src_photo','email','telephone','mot_de_passe','id_utilisateur','droit')
                                                ->where("id_instances_gc","=",$this->id_instance_gc)->get();

            foreach ($users as $user ) {

////////////////////////////////////trouvons tous les id des couches sous thematiques ou l'utilisateur i a les droits///////////////////////////////////////////////////////////////////

                $droits_sous_thematique=DB::table("utilisateur")
                                     ->join("droit-couche-sous-thematique","droit-couche-sous-thematique.id_utilisateur","=","utilisateur.id_utilisateur")
                                     ->select("droit-couche-sous-thematique.id_couche_sous_thematique as id_couche","utilisateur.id_utilisateur")
                                     ->where("droit-couche-sous-thematique.id_utilisateur",$user->id_utilisateur)->get();

////////////////////////////////////trouvons tous les id des couches  thematiques ou l'utilisateur i a les droits///////////////////////////////////////////////////////////////////

                $droits_thematique=DB::table("utilisateur")
                                     ->join("droit-couche-thematique","droit-couche-thematique.id_utilisateur","=","utilisateur.id_utilisateur")
                                     ->select("droit-couche-thematique.id_couche_thematique as id_couche","utilisateur.id_utilisateur")
                                     ->where("droit-couche-thematique.id_utilisateur",$user->id_utilisateur)->get();

////////////////////////////////////definition du model de données///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

                $data[$i]=["id_utilisateur"=>$user->id_utilisateur,"nom"=>$user->nom,"img"=>$user->src_photo,"email"=>$user->email,"numero"=>$user->telephone,"mot_passe"=>$user->mot_de_passe,"droits_sous_thematique"=>[],"statut"=>$user->droit,"droits_thematique"=>[]];

////////////////////////////////////remplissage des droits des couches sous thematiques///////////////////////////////////////////////////////////////////
                $j=0;

                foreach ($droits_sous_thematique as $droit) {
                   
                    $couches = DB::table('couche-sous-thematique')
                     ->select("couche-sous-thematique.contour_couleur","couche-sous-thematique.remplir_couleur","couche-sous-thematique.opacity","couche-sous-thematique.image_src","couche-sous-thematique.geom","couche-sous-thematique.nom","couche-sous-thematique.id")
                     ->where("couche-sous-thematique.id",$droit->id_couche)->get();

                    $k=0;  

                    foreach ($couches as $couche) {

                         array_push($data[$i]["droits_sous_thematique"], ["contour_couleur"=>$couche->contour_couleur,"remplir_couleur"=>$couche->remplir_couleur,"opacity"=>$couche->opacity,"img"=>$couche->image_src,"geom"=>$couche->geom,"nom"=>$couche->nom,"key_couche"=>$couche->id]);

                         $k++;
                    }

                    $j++;
                }

////////////////////////////////////remplissage des droits des thematiques///////////////////////////////////////////////////////////////////
                
                $z=0;

                foreach ($droits_thematique as $droit) {
                   
                    $couches = DB::table('couche-thematique')
                     ->select("couche-thematique.contour_couleur","couche-thematique.remplir_couleur","couche-thematique.geom","couche-thematique.opacity","couche-thematique.image_src","couche-thematique.nom","couche-thematique.id")
                     ->where("couche-thematique.id",$droit->id_couche)->get();

                    $y=0;  

                    foreach ($couches as $couche) {

                         array_push($data[$i]["droits_thematique"], ["contour_couleur"=>$couche->contour_couleur,"remplir_couleur"=>$couche->remplir_couleur,"opacity"=>$couche->opacity,"img"=>$couche->image_src,"geom"=>$couche->geom,"nom"=>$couche->nom,"key_couche"=>$couche->id]);

                         $y++;
                    }

                    $z++;
                }


                $i++;
            }

            return $data;

        }catch(\Exception $e){
             
             return $e;
        }
   }

   public function whriteSvg(Request $Requests)
   {
       $svg = $Requests->svg;
       $file = 'icons.svg';
       $destinationPath=public_path().'/';

       if (!is_dir($destinationPath)) {  
           mkdir($destinationPath,0777,true);
       }

       File::put($destinationPath.$file,$svg);
       return 'ok';
   }

   public function whriteMultipleSvg(Request $Requests)
   {
        $data = $Requests->data;
        foreach ($data as $icone) {
            $svg = $icone['svg'];
            $nom_file = $icone['nom'];
            $destinationPath=public_path().'/'.$icone['path'];
            File::put($destinationPath.$nom_file,$svg);
        }

        return response()->json(['errors' => [],'status' => true], 200);
   }

}
