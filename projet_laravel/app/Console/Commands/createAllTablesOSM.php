<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\thematiqueController;
use App\Http\Controllers\featureOsmController;
use Illuminate\Support\Facades\DB;

ini_set('max_execution_time', '-1'); 

class createAllTablesOSM extends Command
{
    public $id_instance_gc = 1;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'createAllTablesOSM';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Creation / re - creation de toutes les tables OSM';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
        $thematiqueController = new thematiqueController();
        $this->id_instance_gc = $thematiqueController->id_instance_gc;
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $thematiqueController = new thematiqueController();
        $themetique = DB::table("thematique")->select("id", "nom", "image_src", "shema", "color", "ordre")
            ->where("sous-sous-thematique", "=", true)->where("id_instances_gc", "=", $this->id_instance_gc)->get();

        $i = 0;
        foreach ($themetique as $keythemetique) {

            $sousthemetique = DB::table("thematique")
                ->join("sous-thematique", "sous-thematique.id-thematique", "=", "thematique.id")
                ->select("sous-thematique.id", "sous-thematique.nom", "sous-thematique.image_src")
                ->where("sous-thematique.id-thematique", $keythemetique->id)->get();
            $k = 0;
            foreach ($sousthemetique as $keysousthematique) {

                $couchethemetique = DB::table("sous-thematique")
                    ->join("couche-sous-thematique", "couche-sous-thematique.id-sous-thematique", "=", "sous-thematique.id")
                    ->select("couche-sous-thematique.logo_src", "couche-sous-thematique.service_wms", "couche-sous-thematique.number", "couche-sous-thematique.wms_type", "couche-sous-thematique.url", "couche-sous-thematique.identifiant", "couche-sous-thematique.bbox", "couche-sous-thematique.projection", "couche-sous-thematique.zmax", "couche-sous-thematique.zmin", "couche-sous-thematique.type_couche", "couche-sous-thematique.remplir_couleur", "couche-sous-thematique.contour_couleur", "couche-sous-thematique.opacity", "couche-sous-thematique.id", "couche-sous-thematique.nom", "couche-sous-thematique.image_src", "couche-sous-thematique.id_couche", "couche-sous-thematique.geom")
                    ->where("couche-sous-thematique.id-sous-thematique", $keysousthematique->id)->get();

                $jj = 0;
                foreach ($couchethemetique as $keycouchethemetique) {
                    $id_cat = DB::table("categorie")->select("id_cat", "key_couche", "sql", "nom_cat", "sous_thematiques", "status", "number", "file_json", "surface", "distance", "sql_complete", "mode_sql", "select")
                        ->where("sous_thematiques", "=", true)->where("key_couche", "=", $keycouchethemetique->id)->get();
                    if (sizeOf($id_cat) > 0) {
                        # code...
                        if (isset($id_cat[0]->sql)) {
                            $shema = $keythemetique->shema;
                            $table = $keycouchethemetique->id_couche;
                            $type = $keycouchethemetique->geom;
                            if ($type == 'point') {
                                $type = 'Point';
                            } else if ($type == 'Polygon') {
                                $type = 'MultiPolygon';
                            } else if ($type == 'LineString') {
                                $type = 'MultiLineString';
                            }
                            $sql = $id_cat[0]->sql;
                            $res = $thematiqueController->createOSMTable($shema, $table, $sql, $type);
                            if ($res==false) {
                                $this->error("Impossible de creer la table $shema . '.' . $table surement un problème de sa requète OSM");
                            }else{
                                $this->info($shema . '.' . $table . " => $res");
                            }
                            
                        }
                    }else{
                        $this->error("$keycouchethemetique->nom Couche non definit completement");
                    }

                    $jj++;
                }
                $k++;
            }

            $i++;
        }

        $themetique = DB::table("thematique")->select("id", "nom", "image_src", "shema", "color", "ordre")
            ->where("sous-sous-thematique", "=", false)->where("id_instances_gc", "=", $this->id_instance_gc)->get();

        $i = 0;
        foreach ($themetique as $keythemetique) {

            $couchethemetique = DB::table("thematique")
                ->join("couche-thematique", "couche-thematique.id-thematique", "=", "thematique.id")
                ->select("couche-thematique.logo_src", "couche-thematique.service_wms", "couche-thematique.number", "couche-thematique.wms_type", "couche-thematique.url", "couche-thematique.identifiant", "couche-thematique.bbox", "couche-thematique.projection", "couche-thematique.zmax", "couche-thematique.zmin", "couche-thematique.type_couche", "couche-thematique.remplir_couleur", "couche-thematique.contour_couleur", "couche-thematique.opacity", "couche-thematique.id", "couche-thematique.nom", "couche-thematique.image_src", "couche-thematique.id_couche", "couche-thematique.geom")
                ->where("couche-thematique.id-thematique", $keythemetique->id)->get();

            $jj = 0;
            foreach ($couchethemetique as $keycouchethematique) {
                $id_cat = DB::table("categorie")->select("id_cat", "key_couche", "nom_cat", "sql", "sous_thematiques", "status", "number", "file_json", "surface", "distance", "sql_complete", "mode_sql", "select")
                    ->where("sous_thematiques", "=", false)->where("key_couche", "=", $keycouchethematique->id)->get();
                if (sizeOf($id_cat) > 0) {

                    if (isset($id_cat[0]->sql)) {
                        $shema = $keythemetique->shema;
                        $table = $keycouchethematique->id_couche;
                        $sql = $id_cat[0]->sql;
                        $type = $keycouchethematique->geom;
                        if ($type == 'point') {
                            $type = 'Point';
                        } else if ($type == 'Polygon') {
                            $type = 'MultiPolygon';
                        } else if ($type == 'LineString') {
                            $type = 'MultiLineString';
                        }
                        $res = $thematiqueController->createOSMTable($shema, $table, $sql, $type);
                        if ($res==false) {
                            $this->error("Impossible de creer la table $shema . '.' . $table surement un problème de sa requète OSM");
                        }else{
                            $this->info($shema . '.' . $table . " => $res");
                        }
                       
                    }
                }else{
                    $this->error("$keycouchethemetique->nom Couche non definit completement");
                }

                $jj++;
            }
            $i++;
        }

        $featureOsmController = new featureOsmController();
        $this->info("start creating layer osmid - id_couche");
        $featureOsmController->createLayerOsmId();
        $this->info("finish creating layer osmid - id_couche");

    }
}
