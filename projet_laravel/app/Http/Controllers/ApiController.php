<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

use DB;

class ApiController extends Controller
{



public function column_name($sh,$table)
{

$column_name=DB::table("information_schema.columns")->select("column_name","data_type")
                                       ->where("table_schema","=",$sh)
                                       ->where("table_name","=",$table)
                                       ->get();


return $column_name;
}


public function Catalog($s,$t)
{
   try{
    
$data=[];

$id_table=DB::table("table")->select("id")
                  ->where("id_table","=",$t)
                  ->get();

                  
foreach ($id_table as $value) {
 
$data=DB::table('catalogue')
            ->join('catalogue-table', 'catalogue.id', '=', 'catalogue-table.id_catalogue')
             ->join('table', 'table.id', '=', 'catalogue-table.id_table')
            ->where('table.id', '=', $value->id)
            ->select('catalogue.champ','catalogue.aliase')
            ->get();
}
return $data;

 }catch(\Exception $e){
         return $e;
      }
}
    public function DataCatalog()
    {
  
    $data=[];
    $i=0;

     try{
     

    $themetique=DB::table("thematique")->select("id","nom","image_src","shema")
                                       ->where("sous-sous-thematique","=",true)->get();

    foreach ($themetique as $keythemetique) {
    

    $sousthemetique=DB::table("thematique")
                         ->join("sous-thematique","sous-thematique.id-thematique","=","thematique.id")
                         ->select("sous-thematique.id","sous-thematique.nom","sous-thematique.image_src")
                         ->where("sous-thematique.id-thematique",$keythemetique->id)->get();


    $data[$i]=["id"=>$i,"nom"=>$keythemetique->nom,"images_theme"=>$keythemetique->image_src,"shema"=>$keythemetique->shema,"sous_thematiques"=>[]];
    
 
    $k=0;
     foreach ($sousthemetique as $keysousthematique) {

     
     array_push($data[$i]["sous_thematiques"], ["id"=>$k,"key"=>$keysousthematique->id,"nom"=>$keysousthematique->nom,"images_theme"=>$keysousthematique->image_src,"active"=>false,"couches"=>[]]);

     
     $couchethemetique=DB::table("sous-thematique")
                         ->join("couche-sous-thematique","couche-sous-thematique.id-sous-thematique","=","sous-thematique.id")
                         ->select("couche-sous-thematique.id","couche-sous-thematique.nom","couche-sous-thematique.image_src","couche-sous-thematique.id_couche","couche-sous-thematique.geom","couche-sous-thematique.remplir_couleur","couche-sous-thematique.contour_couleur","couche-sous-thematique.opacity")
                         ->where("couche-sous-thematique.id-sous-thematique",$keysousthematique->id)->get();                 
    $idcouche=0;
     foreach ( $couchethemetique as $keycouchethemetique) {
  

      array_push($data[$i]["sous_thematiques"][$k]["couches"],["id"=>$idcouche,"key_couche"=>$keycouchethemetique->id,"nom"=>$keycouchethemetique->nom,"images_theme"=>$keycouchethemetique->image_src,"check"=>false,"id_couche"=>$keycouchethemetique->id_couche,"geom"=>$keycouchethemetique->geom,"remplir_couleur"=>$keycouchethemetique->remplir_couleur,"contour_couleur"=>$keycouchethemetique->contour_couleur,"opacity"=>$keycouchethemetique->opacity,"colonnes"=>array()]);

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


$themetique=DB::table("thematique")->select("id","nom","image_src","shema")
                                       ->where("sous-sous-thematique","=",false)->get();


    foreach ($themetique as $keythemetique) {

    $couchethemetiques=DB::table("thematique")
                         ->join("couche-thematique","couche-thematique.id-thematique","=","thematique.id")
                         ->select("couche-thematique.id","couche-thematique.nom","couche-thematique.image_src","couche-thematique.id_couche","couche-thematique.geom")
                         ->where("couche-thematique.id-thematique",$keythemetique->id)->get();
    
    $data[$i]=["id"=>$i,"nom"=>$keythemetique->nom,"images_theme"=>$keythemetique->image_src,"shema"=>$keythemetique->shema,"sous_thematiques"=>false,"couches"=>[]];
    $idcouche=0;
    foreach ($couchethemetiques as $keycouchethematique) {

       array_push($data[$i]["couches"],["nom"=>$keycouchethematique->nom,"key_couche"=>$keycouchethematique->id,"images_theme"=>$keycouchethematique->image_src,"check"=>false,"id_couche"=>$keycouchethematique->id_couche,"geom"=>$keycouchethematique->geom,"colonnes"=>array()]);

       $cols=DB::select("select column_name as nom ,column_name as champ from information_schema.columns where table_schema = '".$keythemetique->shema."' and table_name = '".$keycouchethematique->id_couche."'");
                  
         foreach ($cols as $col) {
               array_push($data[$i]["couches"][$idcouche]["colonnes"],$col);
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

        $table='"'.$exp.'"';
        $bool = false;
        $cols=DB::select("select column_name as nom ,column_name as champ from information_schema.columns where table_schema = '".$shema."' and table_name = '".$exp."'");

        foreach ($cols as $col) {
          
              if($col->nom == 'geom'){
                $bool = true;
              }
        }

        if($bool){
          $datajson=DB::select('select *,ST_AsGeoJSON(geom) as geometry from '.$shema.".".$table.'');
        }else{
          $datajson = [];
        }
        
         return $datajson;


      }catch(\Exception $e){
         
         return $e;
      }
  }

  public function DataJsonApi($shema,$exp){


      try{


        $getPrincipal = function ($val,$principal){

            foreach ($principal as $keyPrincipal ) {
                        
                if ($keyPrincipal->champ == $val) {
                    $rps = true;
                }else{
                   $rps = false;
                }

            }

            return $rps;
        };


        $getAlias = function($key,$catalogue){

            foreach ($catalogue as $keycatalogue ) {
                        
                if ($keycatalogue->champ == $key) {
                    $rps = $keycatalogue->aliase;
                }else{
                   $rps = false;
                }

            }

            return $rps;
        };

        $table='"'.$exp.'"';

        $themetique=DB::table("thematique")->select("id","nom","image_src","shema","sous-sous-thematique as sous_thematiques")
                ->where("shema","=",$shema)->get();

        $sous_thematiques = $themetique[0]->sous_thematiques;

        if ($sous_thematiques) {
               $couche=DB::table("couche-sous-thematique")->select("id","nom")
                ->where("id_couche","=",$exp)->get();   

                $id_couche = $couche[0]->id;

        } else {
              $couche=DB::table("couche-thematique")->select("id","nom")
                ->where("id_couche","=",$exp)->get();   

                $id_couche = $couche[0]->id;
        }

         if ($sous_thematiques) {
            $sous_thematiques = 'true';
          } else {
            $sous_thematiques = 'false';
          }

        $catalogue =  $couche=DB::table("catalogue")->select("aliase","champ")
                ->where("sous_thematiques","=",$sous_thematiques)->where("id_theme","=",$id_couche)->get();

        $principal = DB::table('catalogue_champ_principal')->select('champ')
                            ->where([
                                ['id_theme', '=',$id_couche]
                              ])->get();  
                        
        //return $principal;

        $bool = false;
        $cols=DB::select("select column_name as nom ,column_name as champ from information_schema.columns where table_schema = '".$shema."' and table_name = '".$exp."'");

        foreach ($cols as $col) {
          
              if($col->nom == 'geom'){
                $bool = true;
              }
        }
        $reponse = [];

        if($bool){
          $datajson=DB::select('select *,ST_AsGeoJSON(geom) as geometry from '.$shema.".".$table.'');

          $i = 0;
          foreach ($datajson as $data ) {
              $reponse[$i] = array();

               $j = 0;
              foreach ($data as $key => $val ) {

                array_push($reponse[$i],["index"=>$key,"val"=>$val]);

                if (sizeof($catalogue) > 0 ) {

                    $aliase = $getAlias($key,$catalogue);
                     if ( $aliase == false) {
                        
                     }else {
                       $reponse[$i][$j]["aliase"] = $aliase;
                     }

                }
                
                
                if (sizeof($principal) > 0 ) {

                  if ($getPrincipal($key,$principal)) {
                    $reponse[$i][$j]["champ_principal"] = true;
                  } 
                  
                }
                
                 $j++;
              }

              $i++;
          }

          $datajson = $reponse;

        }else{
          $datajson = [];
        }


        
         return $datajson;


      }catch(\Exception $e){
         
         return $e;
      }
  }

public function LayerNameEdit($id)
{


$data=[];
    $i=0;

     try{
     
   /*droits couche sous thematique*/
     $droitcouchesousthematique=DB::table("droit-couche-sous-thematique")
                                    ->select("droit-couche-sous-thematique.id_couche_sous_thematique")
                                    ->where("droit-couche-sous-thematique.id_utilisateur",$id)->get();

     /*droits couche  thematique*/
     $droitcouchethematique=DB::table("droit-couche-thematique")
                                    ->select("droit-couche-thematique.id_couche_thematique")
                                    ->where("droit-couche-thematique.id_utilisateur",$id)->get();



    $themetique=DB::table("thematique")->select("id","nom","image_src","shema")
                                       ->where("sous-sous-thematique","=",true)->get();

    foreach ($themetique as $keythemetique) {
    

    
    $sousthemetique=DB::table("thematique")
                         ->join("sous-thematique","sous-thematique.id-thematique","=","thematique.id")
                         ->select("thematique.id as key","sous-thematique.id","sous-thematique.nom","sous-thematique.image_src","thematique.shema")
                         ->where("sous-thematique.id-thematique",$keythemetique->id)->get();


    $data[$i]=["key"=>$keythemetique->id,"id"=>$i,"nom"=>$keythemetique->nom,"images_theme"=>$keythemetique->image_src,"shema"=>$keythemetique->shema,"sous_thematiques"=>[]];
    
 
    $k=0;
     foreach ($sousthemetique as $keysousthematique) {

     
     array_push($data[$i]["sous_thematiques"], ["id"=>$k,"key"=>$keysousthematique->id,"nom"=>$keysousthematique->nom,"images_theme"=>$keysousthematique->image_src,"active"=>false,"couches"=>[]]);

    
     $couchethemetique=DB::table("sous-thematique")
                         ->join("couche-sous-thematique","couche-sous-thematique.id-sous-thematique","=","sous-thematique.id")
                         ->select("couche-sous-thematique.id","couche-sous-thematique.nom","couche-sous-thematique.image_src","couche-sous-thematique.id_couche","couche-sous-thematique.geom","couche-sous-thematique.remplir_couleur","couche-sous-thematique.contour_couleur","couche-sous-thematique.opacity")
                         ->where("couche-sous-thematique.id-sous-thematique",$keysousthematique->id)->get();                 
    $idcouche=0;
     foreach ( $couchethemetique as $keycouchethemetique) {

  if($this->check_roll($keycouchethemetique->id,$droitcouchesousthematique)==true){

array_push($data[$i]["sous_thematiques"][$k]["couches"],["shema"=>$keysousthematique->shema,"id"=>$idcouche,"droit_couche"=>true,"key_couche"=>$keycouchethemetique->id,"nom"=>$keycouchethemetique->nom,"image_src"=>$keycouchethemetique->image_src,"check"=>false,"id_couche"=>$keycouchethemetique->id_couche,"geom"=>$keycouchethemetique->geom,"remplir"=>$keycouchethemetique->remplir_couleur,"contour"=>$keycouchethemetique->contour_couleur,"opacity"=>$keycouchethemetique->opacity]);

  }else{

    //array_push($data[$i]["sous_thematiques"][$k]["couches"],["id"=>$idcouche,"droit_couche"=>false,"key_couche"=>$keycouchethemetique->id,"nom"=>$keycouchethemetique->nom,"images_theme"=>$keycouchethemetique->image_src,"check"=>false,"id_couche"=>$keycouchethemetique->id_couche,"geom"=>$keycouchethemetique->geom,"remplir_couleur"=>$keycouchethemetique->remplir_couleur,"contour_couleur"=>$keycouchethemetique->contour_couleur,"opacity"=>$keycouchethemetique->opacity]);
  }


    $idcouche++;

     }  

     $k++;  

        }

         $i++;
        
           }


$themetique=DB::table("thematique")->select("id","nom","image_src","shema")
                                       ->where("sous-sous-thematique","=",false)->get();


    foreach ($themetique as $keythemetique) {

    $couchethemetique=DB::table("thematique")
                         ->join("couche-thematique","couche-thematique.id-thematique","=","thematique.id")
                         ->select("couche-thematique.id","couche-thematique.nom","couche-thematique.image_src","couche-thematique.id_couche","couche-thematique.geom","couche-thematique.remplir_couleur","couche-thematique.contour_couleur","couche-thematique.opacity","thematique.shema")
                         ->where("couche-thematique.id-thematique",$keythemetique->id)->get();
    
    $data[$i]=["key"=>$keythemetique->id,"id"=>$i,"nom"=>$keythemetique->nom,"images_theme"=>$keythemetique->image_src,"shema"=>$keythemetique->shema,"sous_thematiques"=>false,"couches"=>[]];
    $idcouche=0;
    foreach ($couchethemetique as $keycouchethematique) {

if($this->check_rolls($keycouchethematique->id,$droitcouchethematique)==true){

       array_push($data[$i]["couches"],["shema"=>$keycouchethematique->shema,"nom"=>$keycouchethematique->nom,"droit_couche"=>true,"key_couche"=>$keycouchethematique->id,"image_src"=>$keycouchethematique->image_src,"check"=>false,"id_couche"=>$keycouchethematique->id_couche,"geom"=>$keycouchethematique->geom,"remplir"=>$keycouchethematique->remplir_couleur,"contour"=>$keycouchethematique->contour_couleur,"opacity"=>$keycouchethematique->opacity]);

}

    $idcouche++;
    }

    $i++;
        }

 return $data;

     }catch(\Exception $e){
         
         return $e;
      }

 /* $data=[];
$i=0;
 try{

     
     $droitcouchesousthematique=DB::table("droit-couche-sous-thematique")
                                    ->select("droit-couche-sous-thematique.id_couche_sous_thematique")
                                    ->where("droit-couche-sous-thematique.id_utilisateur",$id)->get();

     
     $droitcouchethematique=DB::table("droit-couche-thematique")
                                    ->select("droit-couche-thematique.id_couche_thematique")
                                    ->where("droit-couche-thematique.id_utilisateur",$id)->get();


       foreach ($droitcouchesousthematique as $keycouche) {

  $couchesousthematique=DB::table("sous-thematique")
                         ->join("thematique","thematique.id","=","sous-thematique.id-thematique")
                         ->join("couche-sous-thematique","couche-sous-thematique.id-sous-thematique","=","sous-thematique.id")
                         ->select("sous-thematique.id as id_sous_thematique","thematique.id as id_thematique","couche-sous-thematique.id","couche-sous-thematique.nom","couche-sous-thematique.id_couche","couche-sous-thematique.image_src","couche-sous-thematique.geom","couche-sous-thematique.remplir_couleur","couche-sous-thematique.contour_couleur","couche-sous-thematique.opacity","thematique.shema")
                         ->where("couche-sous-thematique.id",$keycouche->id_couche_sous_thematique)->get();

foreach ($couchesousthematique as $couche) {

        $data[$i]= ["id_sous_thematique"=>$couche->id_sous_thematique,"id_thematique"=>$couche->id_thematique,"id"=>$couche->id,"nom"=>$couche->nom,"id_couche"=>$couche->id_couche,"shema"=>$couche->shema,"geom"=>$couche->geom,"remplir"=>$couche->remplir_couleur,"contour"=>$couche->contour_couleur,"opacity"=>$couche->opacity,"image_src"=>$couche->image_src];
  
  $i++;
}

}


 foreach ($droitcouchethematique as $keycouche) {

  $couchethematique=DB::table("couche-thematique")
                         ->join("thematique","thematique.id","=","couche-thematique.id-thematique")
                         ->select("thematique.id as id_thematique","couche-thematique.id","couche-thematique.nom","couche-thematique.id_couche","couche-thematique.image_src","couche-thematique.geom","couche-thematique.remplir_couleur","couche-thematique.contour_couleur","couche-thematique.opacity","thematique.shema")
                         ->where("couche-thematique.id",$keycouche->id_couche_thematique)->get();

foreach ($couchethematique as $couche) {

        $data[$i]= ["id_thematique"=>$couche->id_thematique,"id"=>$couche->id,"nom"=>$couche->nom,"id_couche"=>$couche->id_couche,"shema"=>$couche->shema,"geom"=>$couche->geom,"remplir"=>$couche->remplir_couleur,"contour"=>$couche->contour_couleur,"opacity"=>$couche->opacity,"image_src"=>$couche->image_src];
  
  $i++;
}

}


return  $data;

 }catch(\Exception $e){
         
         return $e;
      }

*/
}

public function RollesLayers($id)
{
    


$data=[];
    $i=0;

     try{
     
   /*droits couche sous thematique*/
     $droitcouchesousthematique=DB::table("droit-couche-sous-thematique")
                                    ->select("droit-couche-sous-thematique.id_couche_sous_thematique")
                                    ->where("droit-couche-sous-thematique.id_utilisateur",$id)->get();

     /*droits couche  thematique*/
     $droitcouchethematique=DB::table("droit-couche-thematique")
                                    ->select("droit-couche-thematique.id_couche_thematique")
                                    ->where("droit-couche-thematique.id_utilisateur",$id)->get();



    $themetique=DB::table("thematique")->select("id","nom","image_src","shema")
                                       ->where("sous-sous-thematique","=",true)->get();

    foreach ($themetique as $keythemetique) {
    

    
    $sousthemetique=DB::table("thematique")
                         ->join("sous-thematique","sous-thematique.id-thematique","=","thematique.id")
                         ->select("thematique.id as key","sous-thematique.id","sous-thematique.nom","sous-thematique.image_src")
                         ->where("sous-thematique.id-thematique",$keythemetique->id)->get();


    $data[$i]=["key"=>$keythemetique->id,"id"=>$i,"nom"=>$keythemetique->nom,"images_theme"=>$keythemetique->image_src,"shema"=>$keythemetique->shema,"sous_thematiques"=>[]];
    
 
    $k=0;
     foreach ($sousthemetique as $keysousthematique) {

     
     array_push($data[$i]["sous_thematiques"], ["id"=>$k,"key"=>$keysousthematique->id,"nom"=>$keysousthematique->nom,"images_theme"=>$keysousthematique->image_src,"active"=>false,"couches"=>[]]);

    
     $couchethemetique=DB::table("sous-thematique")
                         ->join("couche-sous-thematique","couche-sous-thematique.id-sous-thematique","=","sous-thematique.id")
                         ->select("couche-sous-thematique.id","couche-sous-thematique.nom","couche-sous-thematique.image_src","couche-sous-thematique.id_couche","couche-sous-thematique.geom","couche-sous-thematique.remplir_couleur","couche-sous-thematique.contour_couleur","couche-sous-thematique.opacity")
                         ->where("couche-sous-thematique.id-sous-thematique",$keysousthematique->id)->get();                 
    $idcouche=0;
     foreach ( $couchethemetique as $keycouchethemetique) {

  if($this->check_roll($keycouchethemetique->id,$droitcouchesousthematique)==true){

array_push($data[$i]["sous_thematiques"][$k]["couches"],["id"=>$idcouche,"droit_couche"=>true,"key_couche"=>$keycouchethemetique->id,"nom"=>$keycouchethemetique->nom,"images_theme"=>$keycouchethemetique->image_src,"check"=>false,"id_couche"=>$keycouchethemetique->id_couche,"geom"=>$keycouchethemetique->geom,"remplir_couleur"=>$keycouchethemetique->remplir_couleur,"contour_couleur"=>$keycouchethemetique->contour_couleur,"opacity"=>$keycouchethemetique->opacity]);

  }else{

    array_push($data[$i]["sous_thematiques"][$k]["couches"],["id"=>$idcouche,"droit_couche"=>false,"key_couche"=>$keycouchethemetique->id,"nom"=>$keycouchethemetique->nom,"images_theme"=>$keycouchethemetique->image_src,"check"=>false,"id_couche"=>$keycouchethemetique->id_couche,"geom"=>$keycouchethemetique->geom,"remplir_couleur"=>$keycouchethemetique->remplir_couleur,"contour_couleur"=>$keycouchethemetique->contour_couleur,"opacity"=>$keycouchethemetique->opacity]);
  }


    $idcouche++;

     }  

     $k++;  

        }

         $i++;
        
           }


$themetique=DB::table("thematique")->select("id","nom","image_src","shema")
                                       ->where("sous-sous-thematique","=",false)->get();


    foreach ($themetique as $keythemetique) {

    $couchethemetique=DB::table("thematique")
                         ->join("couche-thematique","couche-thematique.id-thematique","=","thematique.id")
                         ->select("couche-thematique.id","couche-thematique.nom","couche-thematique.image_src","couche-thematique.id_couche","couche-thematique.geom","couche-thematique.remplir_couleur","couche-thematique.contour_couleur","couche-thematique.opacity")
                         ->where("couche-thematique.id-thematique",$keythemetique->id)->get();
    
    $data[$i]=["key"=>$keythemetique->id,"id"=>$i,"nom"=>$keythemetique->nom,"images_theme"=>$keythemetique->image_src,"shema"=>$keythemetique->shema,"sous_thematiques"=>false,"couches"=>[]];
    $idcouche=0;
    foreach ($couchethemetique as $keycouchethematique) {

if($this->check_rolls($keycouchethematique->id,$droitcouchethematique)==true){

       array_push($data[$i]["couches"],["nom"=>$keycouchethematique->nom,"droit_couche"=>true,"key_couche"=>$keycouchethematique->id,"images_theme"=>$keycouchethematique->image_src,"check"=>false,"id_couche"=>$keycouchethematique->id_couche,"geom"=>$keycouchethematique->geom,"remplir_couleur"=>$keycouchethematique->remplir_couleur,"contour_couleur"=>$keycouchethematique->contour_couleur,"opacity"=>$keycouchethematique->opacity]);

}else{


array_push($data[$i]["couches"],["nom"=>$keycouchethematique->nom,"droit_couche"=>false,"key_couche"=>$keycouchethematique->id,"images_theme"=>$keycouchethematique->image_src,"check"=>false,"id_couche"=>$keycouchethematique->id_couche,"geom"=>$keycouchethematique->geom,"remplir_couleur"=>$keycouchethematique->remplir_couleur,"contour_couleur"=>$keycouchethematique->contour_couleur,"opacity"=>$keycouchethematique->opacity]);

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


function check_roll($id,$layerid){

$bool=false;

foreach ($layerid as $keythemetique) {

if($keythemetique->id_couche_sous_thematique==$id){
   
   $bool=true;

  }
}

return $bool;

  }




function check_rolls($id,$layerid){

$bool=false;

foreach ($layerid as $keythemetique) {

if($keythemetique->id_couche_thematique==$id){
   
   $bool=true;

  }
}

return $bool;

  }


}
