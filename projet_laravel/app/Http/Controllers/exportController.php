<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesResources;
use App\Http\Requests;
use Illuminate\Http\Request;
use App\Http\Controllers\thematiqueController;
use DB;

class exportController extends Controller
{
    public function exportDataOsm(Request $request)
    {
        $querry = $request->input('querry', []);
        $lim_adm = $request->lim_adm;
        $id_lim = $request->id_lim;

        $thematiqueController = new thematiqueController();

        $all_sql = [];
        // foreach ($querry as $one_querry) {
        //     $sql = $thematiqueController->genrateSqlForLayer($one_querry['id_cat'], $lim_adm, $id_lim, 'geometry', true);
        //     array_push($all_sql, ['index' => $one_querry['index'], 'nom' => $one_querry['nom'], 'number' => $sql['number'], 'nom_file' => $this->sqlToFile($sql['sql'], $one_querry['nom'])]);
        // }

        foreach ($querry as $one_querry) {
            $thematique = DB::table("thematique")->select("id", "nom", "sous-sous-thematique AS sous")
                ->where("id", "=", $one_querry['id_them'])->get();
            $sous = $thematique[0]->sous;
            $params_table = $thematiqueController->getShemaTableCategorieFromIdCouche($one_querry['key_couche'], $sous);
            if ($params_table) {
                $shema = $params_table['shema'];
                $table = $params_table['table'];
                $sql = $params_table['sql'];
                $type = $params_table['type'];
                if ($type == 'Point') {
                    $sql_count = DB::select('select count(A.*) as count from ' . $shema . '."' . $table . '" as A , ' . $lim_adm . ' as B where B.id =' . $id_lim . ' and ST_Contains(B.geometry,A.geom)');
                    $sql_contains = 'select A.* from ' . $shema . '."' . $table . '" as A , ' . $lim_adm . ' as B where B.id =' . $id_lim . ' and ST_Contains(B.geometry,A.geom)';
                } else {
                    $sql_count = DB::select('select count(A.*) as count  from ' . $shema . '."' . $table . '" as A , ' . $lim_adm . ' as B where B.id =' . $id_lim . ' and ST_Contains(B.geometry,ST_Centroid(A.geom))');
                    $sql_contains = 'select A.* from ' . $shema . '."' . $table . '" as A , ' . $lim_adm . ' as B where B.id =' . $id_lim . ' and ST_Contains(B.geometry,ST_Centroid(A.geom))';
                }
            }

            array_push($all_sql, ['index' => $one_querry['index'], 'nom' => $one_querry['nom'], 'number' => $sql_count[0]->count, 'nom_file' => $this->sqlToFile($sql_contains, $one_querry['nom'])]);
        }

        return $all_sql;
    }

    public function sqlToFile(string $sql, string $nom_fichier)
    {

        $download_path = public_path() . "/download";
        $file_with_extention = strtolower(preg_replace("/[^a-zA-Z]/", "", $nom_fichier)) . ".gpkg";
        $file_path = $download_path . '/' . $file_with_extention;
        if (!is_dir($download_path)) {
            mkdir($download_path, 0777, true);
        }

        if (sizeof(explode(";", $sql)) > 1) {
            $requete =  explode(";", $sql)[0] . " union all " . explode(";", $sql)[1];
            $ogr_cmd = system('ogr2ogr -f "GPKG" "' . $file_path . '" PG:"host=' . env("DB_HOST") . ' port=' . env("DB_PORT") . ' user=' . env("DB_USERNAME") . ' dbname=' . env("DB_DATABASE") . ' password=' . env("DB_PASSWORD") . '" ' . ' -sql "' . $requete . '"');
            // $ogr_cmd = system('ogr2ogr -append -f "GPKG" "' . $file_path . '" PG:"host='.env("DB_HOST").' port='.env("DB_PORT").' user='.env("DB_USERNAME").' dbname='.env("DB_DATABASE").' password='.env("DB_PASSWORD").'" ' . ' -sql "' . explode(";", $sql)[1].'"');

        } else {
            $ogr_cmd = system('ogr2ogr -f "GPKG" "' . $file_path . '" PG:"host=' . env("DB_HOST") . ' port=' . env("DB_PORT") . ' user=' . env("DB_USERNAME") . ' dbname=' . env("DB_DATABASE") . ' password=' . env("DB_PASSWORD") . '" ' . ' -sql "' . $sql . '"');
        }

        if ($ogr_cmd != false || $ogr_cmd == "") {
            return 'download/' . $file_with_extention;
        } else {
            return false;
        }
    }
}
