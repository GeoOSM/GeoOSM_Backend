<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

use DB;

class newinstancesController extends Controller
{
    

    public function create_Model_thematiques_standard_instances(Request $request)
    {

        try{

            DB::select('BEGIN;');
            DB::select('SAVEPOINT mon_pointdesauvegarde;');

            $id_instance_gc=$request->input('id_instance_gc',null);

            $thematiques_models = DB::table("model_standard_instance.thematique")
            ->select("id","nom","image_src","shema","id_instances_gc","sous-sous-thematique")->get();

            foreach ($thematiques_models as $one_thematiques_models) {

                $schema = strtolower(str_replace(" ", "_", $one_thematiques_models['nom']));
                $image_src =  $one_thematiques_models['image_src'];

                $create_schema=DB::select('CREATE SCHEMA '.$schema);

                //// insertion et recuperation du id de la thematique crée
                $insert_thematiques_models=DB::table('thematique')->insertGetId(
                    ['nom' => $one_thematiques_models['nom'], 'image_src' => $image_src,'shema' => $schema, 'sous-sous-thematique' => $one_thematiques_models['sous-sous-thematique'],'id_instances_gc' => $id_instance_gc],'id'
                );

                if ($one_thematiques_models['sous-sous-thematique'] === 'true') {
                    /// recuperation de tous les sous-thematiques du modele 
                    $sous_thematiques_models = DB::table("model_standard_instance.sous-thematique")->select("id","nom","id-thematique")
                        ->where("id-thematique","=",$one_thematiques_models['id'])->get();

                    foreach ($sous_thematiques_models as $one_sous_thematiques_models ) {

                         //// insertion et recuperation du id de la sous-thematique crée
                        $insert_sous_thematiques_models=DB::table('sous-thematique')->insertGetId(
                            ['nom' => $one_sous_thematiques_models['nom'], 'id-thematique' => $insert_thematiques_models],'id'
                        );
                        /// recuperation de tous les couche-sous-thematiques du modele 
                        $couche_sous_thematiques_models = DB::table("model_standard_instance.couche-sous-thematique")->select("url","identifiant","bbox","projection","zmax","zmin","type_couche","remplir_couleur","contour_couleur","opacity","id","nom","image_src","id_couche","geom")
                                ->where("id-sous-thematique","=",$one_sous_thematiques_models['id'])->get();

                        foreach ( $couche_sous_thematiques_models as $one_couche_sous_thematiques_models ) {

                            $oldVariable = $sous_them['nom'].' '.$one_couche_sous_thematiques_models['nom'];
                            $newVariable = strtolower(str_replace(" ", "_", $oldVariable));
                            
                            //// insertion et recuperation du id de de toutes les couches-sous-thematiques

                            $insert_couches_sous_thematiques_models=DB::table('couche-sous-thematique')->insertGetId(
                                ['nom' => $one_couche_sous_thematiques_models['nom'], 'id-sous-thematique' => $insert_sous_thematiques_models,
                                "url" => $one_couche_sous_thematiques_models['url'],"identifiant" => $one_couche_sous_thematiques_models['identifiant'],"bbox" => $one_couche_sous_thematiques_models['bbox'],"projection" => $one_couche_sous_thematiques_models['projection'],
                                "zmax" => $one_couche_sous_thematiques_models['zmax'],"zmin" => $one_couche_sous_thematiques_models['zmin'],"type_couche" => $one_couche_sous_thematiques_models['type_couche'],"remplir_couleur" => $one_couche_sous_thematiques_models['remplir_couleur'],
                                "contour_couleur" => $one_couche_sous_thematiques_models['contour_couleur'],"opacity" => $one_couche_sous_thematiques_models['opacity'],"id" => $one_couche_sous_thematiques_models['id'],"nom" => $one_couche_sous_thematiques_models['nom'],
                                "image_src" => $one_couche_sous_thematiques_models['image_src'],"id_couche" => $newVariable,"geom"=> $one_couche_sous_thematiques_models['geom']],
                                'id'
                            );

                            if ($one_couche_sous_thematiques_models['type_couche'] == 'couche') {
                                $create_table=DB::select(' CREATE TABLE '.$schema.'.'.$newVariable.' ()with(OIDS = FALSE)');
                            }

                        }

                    }
                    
                }elseif ($one_thematiques_models['sous-sous-thematique'] === 'false') {
                    
                    /// recuperation de tous les couche-sous-thematiques du modele 
                    $couche_thematiques_models = DB::table("model_standard_instance.couche-thematique")->select("url","identifiant","bbox","projection","zmax","zmin","type_couche","remplir_couleur","contour_couleur","opacity","id","nom","image_src","id_couche","geom")
                    ->where("id-thematique","=",$one_thematiques_models['id'])->get();

                    foreach ($couche_thematiques_models as $one_couche_thematiques_models) {
                        
                        $oldVariable = $sous_them['nom'].' '.$one_couche_thematiques_models['nom'];
                        $newVariable = strtolower(str_replace(" ", "_", $oldVariable));
                        
                        //// insertion et recuperation du id de de toutes les couches-thematiques

                        $insert_couches_sous_thematiques_models=DB::table('couche-sous-thematique')->insertGetId(
                            ['nom' => $one_couche_thematiques_models['nom'], 'id-sous-thematique' => $insert_sous_thematiques_models,
                            "url" => $one_couche_thematiques_models['url'],"identifiant" => $one_couche_thematiques_models['identifiant'],"bbox" => $one_couche_thematiques_models['bbox'],"projection" => $one_couche_thematiques_models['projection'],
                            "zmax" => $one_couche_thematiques_models['zmax'],"zmin" => $one_couche_thematiques_models['zmin'],"type_couche" => $one_couche_thematiques_models['type_couche'],"remplir_couleur" => $one_couche_thematiques_models['remplir_couleur'],
                            "contour_couleur" => $one_couche_thematiques_models['contour_couleur'],"opacity" => $one_couche_thematiques_models['opacity'],"id" => $one_couche_thematiques_models['id'],"nom" => $one_couche_thematiques_models['nom'],
                            "image_src" => $one_couche_thematiques_models['image_src'],"id_couche" => $newVariable,"geom"=> $one_couche_thematiques_models['geom']],
                            'id'
                        );

                        if ($one_couche_thematiques_models['type_couche'] == 'couche') {
                            $create_table=DB::select(' CREATE TABLE '.$schema.'.'.$newVariable.' ()with(OIDS = FALSE)');
                        }

                    }

                }
            }
            

        }catch(Exception $e){
            DB::select('COMMIT;');
            DB::select('ROLLBACK TO mon_pointdesauvegarde;');
            DB::select('COMMIT;');
            return $e;

        }
    } 
}