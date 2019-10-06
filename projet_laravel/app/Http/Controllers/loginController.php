<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

use DB;

use Session;


class loginController extends Controller
{
    
 public function checklogin(Request $request)
 {
 	try{

   $post=$request->all();

    $account=DB::table("utilisateur")->select("super","droit","nom","prenom","src_photo","id_utilisateur")->where('email',$post['email'])->where("mot_de_passe",$post["mdp"])->get();

    if(sizeof($account)==0){
      
      return "non";

    }else{
     
    foreach ( $account as $key) {

      session::put('id',$key->id_utilisateur);
    	session::put('nom',$key->nom);
    	session::put('super',$key->super);
      session::put('prenom',$key->prenom);
    	session::put('src_photo',$key->src_photo);
      session::put('droit',$key->droit);
      
    }
     
    session::put('session',true);

    return "ok"; 

    }

 	 }catch(\Exception $e){
         
         return $e;
      }
 }


  public function loginAdmin(Request $request)
 {
   try{

   $post=$request->all();

    $account=DB::table("utilisateur")->select("super","droit","nom","prenom","src_photo","id_utilisateur")->where('email',$post['email'])->where("mot_de_passe",$post["mdp"])->get();

    if(sizeof($account)==0){
      
      return "non";

    }else{
     
      foreach ( $account as $key) {
        
        if ($key->droit == 'administrateur') {

              session::put('id',$key->id_utilisateur);
              session::put('nom',$key->nom);
              session::put('super',$key->super);
              session::put('prenom',$key->prenom);
              session::put('src_photo',$key->src_photo);
              session::put('droit',$key->droit);
           
              session::put('session',true);
        }   

      }
      
    $data['status'] ='ok';
    $data['data'] =$account;
      return $data;

    }

   }catch(\Exception $e){
         
         return $e;
      }
 }
 

function deconnect(){

  \Session::forget('session');
  \Session::forget('id');
  \Session::forget('nom');
  \Session::forget('super');
  \Session::forget('prenom');
  \Session::forget('src_photo');
  \Session::forget('droit');
    return "";
}
}
