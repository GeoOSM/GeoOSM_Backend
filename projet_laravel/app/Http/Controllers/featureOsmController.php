<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

use Illuminate\Support\Facades\DB;

class featureOsmController extends Controller
{
	public $id_instance_gc = 1;

    /**
     * recuperer toutes les infos de BD de toutes les couches OSM
     * <code>
     *  shema:shema de la couche
     *  table:table de la couche
     *  id_couche:id de la couche
     * geometryType : Point |MultiPolygon | MultiLineString
     * </code>
     * @return Array<>
     */
    public function getAllConfBDOfOSMTLayers()
    {
        $response = [];
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
                    # code...
                    $id_cat = DB::table("categorie")->select("id_cat", "key_couche", "nom_cat", "sous_thematiques", "status", "number", "file_json", "surface", "distance", "sql_complete", "mode_sql", "select")
                        ->where("sous_thematiques", "=", true)->where("key_couche", "=", $keycouchethemetique->id)->get();
                    if (sizeOf($id_cat) > 0) {
                        # code...
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
                        $key_couche = $id_cat[0]->key_couche;
                        $res =  [
                            'shema' => $shema,
                            'table' => $table,
                            'geometryType' => $type,
                            'id_couche' => $key_couche,
                        ];
                        array_push($response, $res);
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
                    $key_couche = $id_cat[0]->key_couche;
                    $res =  [
                        'shema' => $shema,
                        'table' => $table,
                        'geometryType' => $type,
                        'id_couche' => $key_couche,
                    ];
                    array_push($response, $res);
                }

                $jj++;
            }
            $i++;
        }

        return $response;
    }

    /**
     * find feature by osm id in all layers of type osm
     */
    public function getFeatureByOSMId(Request $Requests)
    {
       $osmId = $Requests->osmId;
    //    $osmId =4691231590;
       return  DB::select("select * from layer_osmid where osmid = $osmId ");
    }

    public function createLayerOsmId()
    {
        DB::select('DROP TABLE IF EXISTS public.layer_osmid_temp ');
        DB::select("CREATE TABLE public.layer_osmid_temp (osmid bigint NOT NULL,id_couche bigint NOT NULL,geometryType text NOT NULL)");
		DB::select('DROP INDEX IF EXISTS layer_osmid_osmid ');
		DB::select('CREATE INDEX layer_osmid_osmid ON public.layer_osmid_temp (osmid) ');
        foreach ($this->getAllConfBDOfOSMTLayers() as $layer) {
            $shema = $layer['shema'];
            $table = $layer['table'];
            $id_couche = $layer['id_couche'];
            $geometryType = $layer['geometryType'];
            try {
                DB::select('INSERT INTO public.layer_osmid_temp(osmid, id_couche,geometryType) select osm_id, \''.$id_couche.'\', \''.$geometryType.'\' from ' . $shema . '."' . $table . '"');
            } catch (\Throwable $th) {
                // throw $th;
            }
        }
        DB::select('DROP TABLE IF EXISTS public.layer_osmid');
        DB::select("ALTER TABLE public.layer_osmid_temp RENAME TO layer_osmid;");

        return 'finish';
    }
}
