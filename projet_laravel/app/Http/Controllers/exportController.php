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

class exportController extends Controller
{
    public function exportDataOsm(Request $request)
    {
        $querry = $request->input('querry', []);
        $lim_adm = $request->lim_adm;
        $id_lim = $request->id_lim;

        $thematiqueController = new thematiqueController();

        $all_sql = [];
        foreach ($querry as $one_querry) {
            $sql = $thematiqueController->genrateSqlForLayer($one_querry['id_cat'], $lim_adm, $id_lim,'geometry');
            array_push($all_sql, ['index'=>$one_querry['index'],'nom' => $one_querry['nom'],'number' => $sql['number'],'nom_file' => $this->sqlToFile( $sql['sql'],$one_querry['nom'])]);
        }

        return $all_sql;
    }

    public function sqlToFile(string $sql, string $nom_fichier)
    {

        $download_path = public_path()."/download";
        $file_with_extention = strtolower(preg_replace("/[^a-zA-Z]/", "", $nom_fichier)). ".gpkg";
        $file_path = $download_path . '/' . $file_with_extention;
        if (!is_dir($download_path)) {
            mkdir($download_path, 0777, true);
        }

        if( sizeof( explode(";", $sql)) > 1 ){
            $ogr_cmd = system('ogr2ogr -f "GPKG" "' . $file_path . '" PG:"host='.env("DB_HOST").' port='.env("DB_PORT").' user='.env("DB_USERNAME").' dbname='.env("DB_DATABASE").' password='.env("DB_PASSWORD").'" ' . ' -sql "' . explode(";", $sql)[0].'"');
            $ogr_cmd = system('ogr2ogr -append -f "GPKG" "' . $file_path . '" PG:"host='.env("DB_HOST").' port='.env("DB_PORT").' user='.env("DB_USERNAME").' dbname='.env("DB_DATABASE").' password='.env("DB_PASSWORD").'" ' . ' -sql "' . explode(";", $sql)[1].'"');
            
        }else{
            $ogr_cmd = system('ogr2ogr -f "GPKG" "' . $file_path . '" PG:"host='.env("DB_HOST").' port='.env("DB_PORT").' user='.env("DB_USERNAME").' dbname='.env("DB_DATABASE").' password='.env("DB_PASSWORD").'" ' . ' -sql "' . $sql.'"');
        }

        if ($ogr_cmd != false || $ogr_cmd == "" ) {
            return 'download/'.$file_with_extention;
        } else {
            return false;
        }
    }
}
