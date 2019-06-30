<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

use DB;

class AdminController extends Controller
{
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


                $data[$i]=["id"=>$i,"id_thematique"=>$keythemetique->id,"nom"=>$keythemetique->nom,"img"=>$keythemetique->image_src,"shema"=>$keythemetique->shema,"sous_thematiques"=>[]];
                
             
                $k=0;
                 foreach ($sousthemetique as $keysousthematique) {

                 
                 array_push($data[$i]["sous_thematiques"], ["id"=>$k,"key"=>$keysousthematique->id,"nom"=>$keysousthematique->nom,"img"=>$keysousthematique->image_src,"active"=>false,"couches"=>[]]);

                 
                 $couchethemetique=DB::table("sous-thematique")
                                     ->join("couche-sous-thematique","couche-sous-thematique.id-sous-thematique","=","sous-thematique.id")
                                     ->select("couche-sous-thematique.id","couche-sous-thematique.nom","couche-sous-thematique.image_src","couche-sous-thematique.id_couche","couche-sous-thematique.geom")
                                     ->where("couche-sous-thematique.id-sous-thematique",$keysousthematique->id)->get();                 
                $idcouche=0;
                 foreach ( $couchethemetique as $keycouchethemetique) {
              
                  array_push($data[$i]["sous_thematiques"][$k]["couches"],["id"=>$idcouche,"nom"=>$keycouchethemetique->nom,"img"=>$keycouchethemetique->image_src,"check"=>false,"id_couche"=>$keycouchethemetique->id_couche,"key_couche"=>$keycouchethemetique->id ,"geom"=>$keycouchethemetique->geom,"colonnes"=>array()]);

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

                $couchethemetique=DB::table("thematique")
                                     ->join("couche-thematique","couche-thematique.id-thematique","=","thematique.id")
                                     ->select("couche-thematique.id","couche-thematique.nom","couche-thematique.image_src","couche-thematique.id_couche","couche-thematique.geom")
                                     ->where("couche-thematique.id-thematique",$keythemetique->id)->get();
                
                $data[$i]=["id"=>$i,"id_thematique"=>$keythemetique->id,"nom"=>$keythemetique->nom,"img"=>$keythemetique->image_src,"shema"=>$keythemetique->shema,"sous_thematiques"=>false,"couches"=>[]];
                $idcouche=0;
                foreach ($couchethemetique as $keycouchethematique) {

                   array_push($data[$i]["couches"],["nom"=>$keycouchethematique->nom,"key_couche"=>$keycouchethematique->id,"img"=>$keycouchethematique->image_src,"check"=>false,"id_couche"=>$keycouchethemetique->id_couche,"geom"=>$keycouchethemetique->geom,"colonnes"=>array()]);

                   $cols=DB::select("select column_name from information_schema.columns where table_schema = '".$keythemetique->shema."' and table_name = '".$keycouchethemetique->id_couche."'");
                   /*return "select column_name from information_schema.columns where table_schema = '".$keythemetique->shema."' and table_name = '".$keycouchethemetique->id_couche."'";*/
                   foreach ($cols as $col) {
                       array_push($data[$i]["couches"]["colonnes"],["nom"=>$col,"champ"=>$col]);
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

   public function users()
   {
        $data=[];
        $i=0;
       try{

            $users = DB::table('utilisateur')->select('nom', 'src_photo','email','telephone','mot_de_passe','id_utilisateur')->get();

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

                $data[$i]=["id_utilisateur"=>$user->id_utilisateur,"nom"=>$user->nom,"img"=>$user->src_photo,"email"=>$user->email,"numero"=>$user->telephone,"mot_passe"=>$user->mot_de_passe,"droits_sous_thematique"=>[],
                "droits_thematique"=>[]];

////////////////////////////////////remplissage des droits des couches sous thematiques///////////////////////////////////////////////////////////////////
                $j=0;

                foreach ($droits_sous_thematique as $droit) {
                   
                    $couches = DB::table('couche-sous-thematique')
                     ->select("couche-sous-thematique.image_src","couche-sous-thematique.nom","couche-sous-thematique.id")
                     ->where("couche-sous-thematique.id",$droit->id_couche)->get();

                    $k=0;  

                    foreach ($couches as $couche) {

                         array_push($data[$i]["droits_sous_thematique"], ["img"=>$couche->image_src,"nom"=>$couche->nom,"key_couche"=>$couche->id]);

                         $k++;
                    }

                    $j++;
                }

////////////////////////////////////remplissage des droits des thematiques///////////////////////////////////////////////////////////////////
                
                $z=0;

                foreach ($droits_thematique as $droit) {
                   
                    $couches = DB::table('couche-thematique')
                     ->select("couche-thematique.image_src","couche-thematique.nom","couche-thematique.id")
                     ->where("couche-thematique.id",$droit->id_couche)->get();

                    $y=0;  

                    foreach ($couches as $couche) {

                         array_push($data[$i]["droits_thematique"], ["img"=>$couche->image_src,"nom"=>$couche->nom,"key_couche"=>$couche->id]);

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

}
