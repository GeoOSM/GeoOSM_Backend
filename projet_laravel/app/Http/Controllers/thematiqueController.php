<?php

namespace App\Http\Controllers;

ini_set('max_execution_time', '9000'); // 15 mins

use Illuminate\Http\Request;

use App\Http\Requests;

use DB;

use File;

class thematiqueController extends Controller
{
	private $id_instance_gc = 1;

	public function index()
	{
		$this->id_instance_gc = '22';
	}

	public function send_message()
	{

		echo $this->id_instance_gc;
	}

	public function addThematique(Request $Requests)
	{

		try {
			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');


			$nom = $Requests->input('nom', null);
			$image_src = $Requests->input('nom_img_modife', null);
			$sous_sous_thematique = $Requests->input('sousthematique', null);



			$schema = strtolower(str_replace(" ", "_", $nom));
			$image_src = str_replace(" ", "_", $image_src);

			$rps = array();

			$querry = DB::table('thematique')->insertGetId(
				['nom' => $nom, 'image_src' => $image_src, 'shema' => $schema, 'sous-sous-thematique' => $sous_sous_thematique, 'id_instances_gc' => $this->id_instance_gc],
				'id'
			);

			$data['id_thematique'] = $querry;
			$data['shema'] = $schema;
			$data['status'] = 'ok';

			if ($sous_sous_thematique === 'true') {

				$sous_thematique = $Requests->input('sous_thematiques', null);

				$data['sous_thematiques'] = array();

				if ($querry) {



					$querry1 = DB::select('CREATE SCHEMA ' . $schema);



					$i = 0;
					foreach ($sous_thematique as $sous_them) {
						$querry2 = DB::table('sous-thematique')->insertGetId(
							['nom' => $sous_them['nom'], 'id-thematique' => $querry],
							'id'
						);

						array_push($data['sous_thematiques'], ["key" => $querry2, "couches" => []]);
						$j = 0;
						foreach ($sous_them['couches'] as $couche) {
							$oldVariable = $sous_them['nom'] . ' ' . $couche['nom'];
							$newVariable = strtolower(str_replace(" ", "_", $oldVariable));
							$img = str_replace(" ", "_", $couche['nom_img_modife']);

							$querry3 = DB::table('couche-sous-thematique')->insertGetId(
								['type_couche' => $couche['type_couche'], 'remplir_couleur' => $couche['remplir_couleur'], 'contour_couleur' => $couche['contour_couleur'], 'opacity' => $couche['opacity'], 'nom' => $couche['nom'], 'geom' => $couche['geom'], 'id-sous-thematique' => $querry2, 'id_couche' => $newVariable, 'image_src' => $img]
							);

							array_push($data['sous_thematiques'][$i]['couches'], ["key_couche" => $querry3, "id_couche" => $newVariable]);

							$querry4 = DB::select(' CREATE TABLE ' . $schema . '.' . $newVariable . ' ()with(OIDS = FALSE)');

							$j++;
						}

						$i++;
					}

					DB::select('COMMIT;');
					array_push($rps, $querry, $querry1, $querry2, $querry3, $querry4, 'ok');
					return $data;
				} else {
					array_push($rps, $querry, 'ko');
					return $rps;
				}
			} else {
				$couches = $Requests->input('couches', null);

				$querry1 = DB::select('CREATE SCHEMA ' . $schema);
				$data['couches'] = array();

				$i = 0;

				foreach ($couches as $couche) {
					$oldVariable = $nom . ' ' . $couche['nom'];
					$newVariable = strtolower(str_replace(" ", "_", $oldVariable));
					$img = str_replace(" ", "_", $couche['nom_img_modife']);

					$querry3 = DB::table('couche-thematique')->insertGetId(
						['type_couche' => $couche['type_couche'], 'remplir_couleur' => $couche['remplir_couleur'], 'contour_couleur' => $couche['contour_couleur'], 'opacity' => $couche['opacity'], 'nom' => $couche['nom'], 'geom' => $couche['geom'], 'id-thematique' => $querry, 'id_couche' => $newVariable, 'image_src' => $img]
					);

					$querry4 = DB::select(' CREATE TABLE ' . $schema . '.' . $newVariable . ' ()with(OIDS = FALSE)');

					array_push($data['couches'], ["key_couche" => $querry3, "id_couche" => $newVariable]);

					$i++;
				}
				DB::select('COMMIT;');
				return $data;
			}
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function updateThematique(Request $Requests)
	{

		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$nom = $Requests->input('nom', null);
			$id = $Requests->input('id_thematique', null);
			$img = $Requests->input('nom_img_modife', null);
			$color = $Requests->input('color', null);

			$imgN = str_replace(" ", "_", $img);

			if ($img) {
				$querry = DB::table('thematique')
					->where('id', $id)
					->update(['nom' => $nom, 'color' => $color, 'image_src' => $imgN]);
			} else {
				$querry = DB::table('thematique')
					->where('id', $id)
					->update(['color' => $color, 'nom' => $nom]);
			}


			DB::select('COMMIT;');

			$data['status'] = 'ok';
			$data['id'] = $id;
			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function deleteThematique(Request $Requests)
	{

		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$id_thematique = $Requests->input('id_thematique', null);
			$shema = $Requests->input('shema', null);
			$couche_ids = $Requests->input('couche_ids', null);
			$sous_thematiques = $Requests->input('sous_thematiques', null);


			if ($sous_thematiques) {

				foreach ($couche_ids as $couche_id) {
					$querry0 = DB::table('droit-couche-sous-thematique')->where('id_couche_sous_thematique', $couche_id)->delete();
					$querr = DB::table('categorie')->where('key_couche', $couche_id)->delete();
				}

				foreach ($sous_thematiques as $sous_thematique_id) {
					$querry1 = DB::table('couche-sous-thematique')->where('id-sous-thematique', $sous_thematique_id)->delete();
				}

				$querry2 = DB::table('sous-thematique')->where('id-thematique', $id_thematique)->delete();
			} else {

				foreach ($couche_ids as $couche_id) {
					$querry0 = DB::table('droit-couche-thematique')->where('id_couche_thematique', $couche_id)->delete();
					$querr = DB::table('categorie')->where('key_couche', $couche_id)->delete();
				}

				$querry1 = DB::table('couche-thematique')->where('id-thematique', $id_thematique)->delete();
			}


			$querry2 = DB::table('thematique')->where('id', $id_thematique)->delete();

			$querry3 = DB::select('DROP SCHEMA ' . $shema . ' CASCADE');

			DB::select('COMMIT;');
			$data['status'] = 'ok';
			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function addSousThematique(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$id_thematique = $Requests->input('id_thematique', null);
			$nom = $Requests->input('nom', null);

			$querry = DB::table('sous-thematique')->insertGetId(
				['nom' => $nom, 'id-thematique' => $id_thematique],
				'id'
			);

			DB::select('COMMIT;');
			$data['key'] = $querry;
			$data['status'] = 'ok';
			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function updateSousThematique(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$id = $Requests->input('key', null);
			$nom = $Requests->input('nom', null);

			$querry = DB::table('sous-thematique')
				->where('id', $id)
				->update(['nom' => $nom]);

			DB::select('COMMIT;');
			$data['status'] = 'ok';
			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function deleteSousThematique(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$id_sous_thematique = $Requests->input('key', null);
			$couches = $Requests->input('couches', null);
			$shema = $Requests->input('shema', null);

			foreach ($couches as $couche) {
				$tab = $shema . '."' . $couche['id_couche'] . '"';
				$querry2 = DB::table('droit-couche-sous-thematique')->where('id_couche_sous_thematique', $couche['key_couche'])->delete();
				$querry3 = DB::select('DROP TABLE ' . $tab);
			}

			$querry0 = DB::table('couche-sous-thematique')->where('id-sous-thematique', $id_sous_thematique)->delete();

			$querry1 = DB::table('sous-thematique')->where('id', $id_sous_thematique)->delete();




			DB::select('COMMIT;');
			$data['status'] = 'ok';
			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function deleteCouche(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$sous_thematiques = $Requests->input('sous_thematiques', null);
			$id = $Requests->input('key_couche', null);
			$id_couche = $Requests->input('id_couche', null);
			$shema = $Requests->input('shema', null);
			$tab = $shema . '."' . $id_couche . '"';
			if ($sous_thematiques) {

				$querry2 = DB::select('DROP TABLE ' . $tab);

				$querry1 = DB::table('droit-couche-sous-thematique')->where('id_couche_sous_thematique', $id)->delete();

				$querry0 = DB::table('couche-sous-thematique')->where('id', $id)->delete();

				$querr = DB::table('categorie')->where([
					['key_couche', '=', $id],
					['sous_thematiques', '=', true],
				])->delete();
			} else {

				$querry2 = DB::select('DROP TABLE ' . $tab);

				$querry1 = DB::table('droit-couche-thematique')->where('id_couche_thematique', $id)->delete();

				$querry0 = DB::table('couche-thematique')->where('id', $id)->delete();

				$querr = DB::table('categorie')->where([
					['key_couche', '=', $id],
					['sous_thematiques', '=', false],
				])->delete();
			}

			DB::select('COMMIT;');
			$data['status'] = 'ok';
			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function addCouche(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$sous_thematiques = $Requests->input('sous_thematiques', null);
			$couches = $Requests->input('couches', null);
			$shema = $Requests->input('shema', null);
			$nom_thematique = $Requests->input('nom_thematique', null);
			$id_sous_thematique = $Requests->input('id_sous_thematique', null);
			$id_thematique = $Requests->input('id_thematique', null);

			$data['status'] = 'ok';
			$data['key_couches'] = array();
			$data['id_couches'] = array();

			foreach ($couches as $couche) {

				$oldVariable = $shema . ' ' . $couche['nom'];
				$newVariable = strtolower(str_replace(" ", "_", $oldVariable));


				$querry0 = DB::select(' CREATE TABLE ' . $shema . '.' . $newVariable . ' ()with(OIDS = FALSE)');

				$img = str_replace(" ", "_", $couche['nom_img_modife']);
				if ($sous_thematiques) {
					$querry1 = DB::table('couche-sous-thematique')->insertGetId(
						['type_couche' => $couche['type_couche'], 'remplir_couleur' => $couche['remplir_couleur'], 'contour_couleur' => $couche['contour_couleur'], 'opacity' => $couche['opacity'], 'nom' => $couche['nom'], 'image_src' => $img, 'geom' => $couche['geom'], 'id-sous-thematique' => $id_sous_thematique, 'id_couche' => $newVariable]
					);
				} else {

					$querry1 = DB::table('couche-thematique')->insertGetId(
						['type_couche' => $couche['type_couche'], 'remplir_couleur' => $couche['remplir_couleur'], 'contour_couleur' => $couche['contour_couleur'], 'opacity' => $couche['opacity'], 'nom' => $couche['nom'], 'image_src' => $img, 'geom' => $couche['geom'], 'id-thematique' => $id_thematique, 'id_couche' => $newVariable]
					);
				}


				array_push($data['key_couches'], $querry1);
				array_push($data['id_couches'], $newVariable);
			}

			DB::select('COMMIT;');

			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function addColumns(Request $Requests)
	{


		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$data['status'] = 'ok';


			$columns = $Requests->input('colonnes', null);
			$shema = $Requests->input('shema', null);
			$table = $Requests->input('table', null);
			$sous_thematiques = $Requests->input('sous_thematiques', null);
			$id_theme = $Requests->input('id_theme', null);

			foreach ($columns as $column) {

				$querry1 = DB::select('ALTER TABLE ' . $shema . '."' . $table . '" ADD COLUMN ' . $column['champ'] . ' text');

				DB::table('catalogue')->insert(
					['id_theme' => $id_theme, 'champ' => $column['champ'], 'aliase' => $column['aliase'], 'sous_thematiques' => $sous_thematiques]
				);
			}


			DB::select('COMMIT;');
			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function deleteColumn(Request $Requests)
	{


		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$data['status'] = 'ok';


			$column = $Requests->input('champ', null);
			$shema = $Requests->input('shema', null);
			$table = $Requests->input('table', null);
			$id_theme = $Requests->input('id_theme', null);

			DB::table('catalogue')->where([
				['id_theme', '=', $id_theme],
				['champ', '=', $column],
			])->delete();

			DB::table('catalogue_champ_principal')->where([
				['id_theme', '=', $id_theme],
				['champ', '=', $column],
			])->delete();

			$querry1 = DB::select('ALTER TABLE ' . $shema . '."' . $table . '" DROP COLUMN ' . $column);


			DB::select('COMMIT;');
			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}


	public function change_nameCouche(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$nom = $Requests->input('nom_modifier', null);
			$contour_couleur = $Requests->input('contour_couleur', null);
			$remplir_couleur = $Requests->input('remplir_couleur', null);
			$opacity = $Requests->input('opacity', null);
			$image_src = $Requests->input('nom_img_modife', null);
			$id = $Requests->input('key_couche', null);
			$sous_thematique = $Requests->input('sous_thematiques', null);
			$data['status'] = 'ok';



			if ($sous_thematique) {

				if ($image_src) {
					$imgN = str_replace(" ", "_", $image_src);
					$querry = DB::table('couche-sous-thematique')
						->where('id', $id)
						->update(['contour_couleur' => $contour_couleur, 'remplir_couleur' => $remplir_couleur, 'opacity' => $opacity, 'nom' => $nom, 'image_src' => $imgN]);
				} else {

					$querry = DB::table('couche-sous-thematique')
						->where('id', $id)
						->update(['contour_couleur' => $contour_couleur, 'remplir_couleur' => $remplir_couleur, 'opacity' => $opacity, 'nom' => $nom]);
				}
			} else {

				if ($image_src) {
					$imgN = str_replace(" ", "_", $image_src);
					$querry = DB::table('couche-thematique')
						->where('id', $id)
						->update(['contour_couleur' => $contour_couleur, 'remplir_couleur' => $remplir_couleur, 'opacity' => $opacity, 'nom' => $nom, 'image_src' => $imgN]);
				} else {

					$querry = DB::table('couche-thematique')
						->where('id', $id)
						->update(['contour_couleur' => $contour_couleur, 'remplir_couleur' => $remplir_couleur, 'opacity' => $opacity, 'nom' => $nom]);
				}
			}


			DB::select('COMMIT;');

			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}


	public function save_logo(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$nom = $Requests->input('nom_modifier', null);
			$image_src = $Requests->input('nom_logo_modife', null);
			$id = $Requests->input('key_couche', null);
			$sous_thematique = $Requests->input('sous_thematiques', null);
			$data['status'] = 'ok';



			if ($sous_thematique) {

				if ($image_src) {
					$imgN = str_replace(" ", "_", $image_src);
					$querry = DB::table('couche-sous-thematique')
						->where('id', $id)
						->update(['logo_src' => $imgN]);
				} 
			} else {

				if ($image_src) {
					$imgN = str_replace(" ", "_", $image_src);
					$querry = DB::table('couche-thematique')
						->where('id', $id)
						->update([ 'logo_src' => $imgN]);
				}
			}


			DB::select('COMMIT;');

			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function updateColumn(Request $Requests)
	{

		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$ancien_nom = $Requests->input('ancien_nom', null);
			$nouveau_nom = $Requests->input('nouveau_nom', null);
			$id_theme = $Requests->input('id_theme', null);
			$sous_thematiques = $Requests->input('sous_thematiques', null);


			$querry1 = DB::select("UPDATE catalogue SET champ= '" . $ancien_nom . "', aliase='" . $nouveau_nom . "', id_theme='" . $id_theme . "', sous_thematiques='" . $sous_thematiques . "' WHERE champ='" . $ancien_nom . "'  and id_theme = '" . $id_theme . "' ");

			$querry2 = DB::select("INSERT INTO catalogue (champ, aliase, id_theme,sous_thematiques) SELECT '" . $ancien_nom . "', '" . $nouveau_nom . "','" . $id_theme . "','" . $sous_thematiques . "' WHERE NOT EXISTS (SELECT 1 FROM catalogue WHERE champ='" . $ancien_nom . "' and id_theme = '" . $id_theme . "' )");

			//$querry1 =DB::select('ALTER TABLE '.$shema.'."'.$table.'"  RENAME COLUMN '.$ancien_nom.' TO '.$nouveau_nom);
			//$querry1 =DB::select('ALTER TABLE '.$shema.'."'.$table.'"  RENAME COLUMN '.$ancien_nom.' TO '.$nouveau_nom);

			$data['status'] = 'ok';

			DB::select('COMMIT;');

			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}


	public function definir_champ_principal(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$champ = $Requests->input('champ', null);
			$id_theme = $Requests->input('id_theme', null);
			$sous_thematiques = $Requests->input('sous_thematiques', null);
			$nouveau_nom = 	$champ;
			$ancien_nom = 	$champ;



			$querry2 = DB::select("INSERT INTO catalogue (champ, aliase, id_theme,sous_thematiques) SELECT '" . $ancien_nom . "', '" . $nouveau_nom . "','" . $id_theme . "','" . $sous_thematiques . "' WHERE NOT EXISTS (SELECT 1 FROM catalogue WHERE champ='" . $ancien_nom . "' and id_theme = '" . $id_theme . "' )");


			$querry3 = DB::select("UPDATE catalogue_champ_principal SET champ= '" . $champ . "', id_theme='" . $id_theme . "', sous_thematiques='" . $sous_thematiques . "' WHERE   id_theme = '" . $id_theme . "' ");

			$querry4 = DB::select("INSERT INTO catalogue_champ_principal (champ, id_theme,sous_thematiques) SELECT '" . $champ . "','" . $id_theme . "','" . $sous_thematiques . "' WHERE NOT EXISTS (SELECT 1 FROM catalogue_champ_principal WHERE id_theme = '" . $id_theme . "' )");


			$data['status'] = 'ok';

			DB::select('COMMIT;');

			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}


	//$sousthemetique=DB::table("thematique")
	/* ->join("sous-thematique","sous-thematique.id-thematique","=","thematique.id")
                                     ->select("sous-thematique.id","sous-thematique.nom","sous-thematique.image_src")
                                     ->where("sous-thematique.id-thematique",$keythemetique->id)->get(); */



	public function getCatalogueDonne(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$donne = [];
			$donne1 = [];

			$catalogue_sous_thematiques = DB::table('catalogue')->select('champ', 'aliase', 'id_theme', 'sous_thematiques')
				->where("sous_thematiques", "true")->get();




			$i = 0;
			foreach ($catalogue_sous_thematiques as $key) {

				$querry1 = DB::table('catalogue_champ_principal')->select('champ')
					->where([
						['champ', '=', $key->champ],
						['id_theme', '=', $key->id_theme]
					])->get();
				if (sizeof($querry1) > 0) {
					$donne[$i] = ["champ" => $key->champ, "aliase" => $key->aliase, "id_theme" => $key->id_theme, "sous_thematiques" => $key->sous_thematiques, "champ_principal" => "true"];
				} else {
					$donne[$i] = ["champ" => $key->champ, "aliase" => $key->aliase, "id_theme" => $key->id_theme, "sous_thematiques" => $key->sous_thematiques, "champ_principal" => "false"];
				}

				$i++;
			}

			$catalogue_thematiques = DB::table('catalogue')->select('champ', 'aliase', 'id_theme', 'sous_thematiques', 'principal')
				->where("sous_thematiques", "false")->get();

			$i = 0;
			foreach ($catalogue_thematiques as $key) {

				$querry1 = DB::table('catalogue_champ_principal')->select('champ')
					->where([
						['champ', '=', $key->champ],
						['id_theme', '=', $key->id_theme]
					])->get();
				if (sizeof($querry1) > 0) {
					$donne1[$i] = ["champ" => $key->champ, "aliase" => $key->aliase, "id_theme" => $key->id_theme, "sous_thematiques" => $key->sous_thematiques, "champ_principal" => "true"];
				} else {
					$donne1[$i] = ["champ" => $key->champ, "aliase" => $key->aliase, "id_theme" => $key->id_theme, "sous_thematiques" => $key->sous_thematiques, "champ_principal" => "false"];
				}

				$i++;
			}

			$data['status'] = 'ok';
			$data['catalogue_sous_thematiques'] = $donne;
			$data['catalogue_thematiques'] = $donne1;

			DB::select('COMMIT;');

			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}


	public function queryLimite(Request $Requests)
	{


		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$table = $Requests->input('table', null);
			$shema = $Requests->input('shema', null);
			$geom = $Requests->input('geom', null);
			$tab = $shema . '."' . $table . '"';


			$querry1 = DB::select("select *,ST_AsGeoJSON(geom) as geometry from " . $tab . " where  ST_Within( st_setsrid(geom,4326) ,st_setsrid(geometry('" . $geom . "'),4326)  )");

			return  (array) $querry1;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function importationDeDonnes(Request $Requests)
	{

		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');


			$table = $Requests->input('table', null);
			$shema = $Requests->input('shema', null);
			$champs = $Requests->input('champ', null);
			$donnes = $Requests->input('donne', null);
			$sous_thematiques = $Requests->input('sous_thematiques', null);
			$key_couche = $Requests->input('key_couche', null);

			$tab = $shema . '."' . $table . '"';
			// return "ALTER TABLE ".$tab." ADD COLUMN id serial";
			DB::select("ALTER TABLE " . $tab . " ADD COLUMN id serial");

			DB::select("ALTER TABLE " . $tab . " ADD PRIMARY KEY (id)");

			DB::select("ALTER TABLE " . $tab . " ADD COLUMN geom geometry");


			$tous_les_champs = '';

			foreach ($champs as $champ) {
				if (strtolower($champ) != 'id') {
					$querry = DB::select("ALTER TABLE " . $tab . " ADD COLUMN " . $champ . " text");
					if ($tous_les_champs == '') {
						$tous_les_champs = $champ;
					} else {
						$tous_les_champs = $tous_les_champs . ',' . $champ;
					}
				}
			}

			foreach ($donnes as $donne) {

				$les_donne = '';

				foreach ($champs as $champ) {
					if (strtolower($champ) != 'id') {
						if ($donne['properties'][$champ] == '') {
							$valeur = "' '";
						} else {
							$valeur = "'" . str_replace("'", ' ', $donne['properties'][$champ]) . "'";
						}

						if ($les_donne == '') {
							$les_donne = $valeur;
						} else {
							$les_donne = $les_donne . ',' . $valeur;
						}
					}
				}
				//return "INSERT INTO ".$tab." (".$tous_les_champs.",geom) VALUES (".$les_donne.",ST_GeomFromGeoJSON('".json_encode($donne['geometry'])."'))";

				$querry = DB::select("INSERT INTO " . $tab . " (" . $tous_les_champs . ",geom) VALUES (" . $les_donne . ",ST_GeomFromGeoJSON('" . json_encode($donne['geometry']) . "'))");
			}

			$datajson = DB::select('select id,' . $tous_les_champs . ' from ' . $tab);

			if ($sous_thematiques) {

				$querry0 = DB::table('couche-sous-thematique')
					->where('id', $key_couche)
					->update(['number' => sizeof($datajson)]);
			} else {
				$querry0 = DB::table('couche-thematique')
					->where('id', $key_couche)
					->update(['number' => sizeof($datajson)]);
			}


			$data['status'] = 'ok';
			$data['data'] = $datajson;
			$data['colonnes'] = $tous_les_champs;
			$data['number'] = sizeof($datajson);

			DB::select('COMMIT;');

			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function emptyTable(Request $Requests)
	{

		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');


			$table = $Requests->input('table', null);
			$shema = $Requests->input('shema', null);
			$champs = $Requests->input('champ', null);
			$tab = $shema . '."' . $table . '"';

			$cols = DB::select("select column_name as nom from information_schema.columns where table_schema = '" . $shema . "' and table_name = '" . $table . "'");



			DB::select("TRUNCATE " . $tab);




			/*foreach ($champs as $champ ) {
				$querry = DB::select("ALTER TABLE ".$tab." DROP COLUMN ".$champ );
			}*/

			foreach ($cols as $col) {
				$querry = DB::select("ALTER TABLE " . $tab . " DROP COLUMN " . $col->nom);
				//array_push($data[$i]["sous_thematiques"][$k]["couches"][$idcouche]["colonnes"],$col);
			}

			$data['status'] = 'ok';

			DB::select('COMMIT;');

			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function save_properties_couche_wms(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$sous_thematiques = $Requests->input('sous_thematiques', null);
			$id = $Requests->input('key_couche', null);

			$url = $Requests->input('url', null);
			$identifiant = $Requests->input('identifiant', null);
			$bbox = $Requests->input('bbox', null);
			$projection = $Requests->input('projection', null);
			$zmax = $Requests->input('zmax', null);
			$zmin = $Requests->input('zmin', null);


			if ($sous_thematiques) {

				$querry0 = DB::table('couche-sous-thematique')
					->where('id', $id)
					->update(['url' => $url, 'identifiant' => $identifiant, 'bbox' => $bbox, 'projection' => $projection, 'zmax' => $zmax, 'zmin' => $zmin]);
			} else {
				$querry0 = DB::table('couche-thematique')
					->where('id', $id)
					->update(['url' => $url, 'identifiant' => $identifiant, 'bbox' => $bbox, 'projection' => $projection, 'zmax' => $zmax, 'zmin' => $zmin]);
			}

			$data['status'] = 'ok';

			DB::select('COMMIT;');

			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function define_service(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$sous_thematiques = $Requests->input('sous_thematiques', null);
			$id = $Requests->input('key_couche', null);
			$service_wms = $Requests->input('service_wms');

			if ($sous_thematiques) {

				$querry0 = DB::table('couche-sous-thematique')
					->where('id', $id)
					->update(['service_wms' => $service_wms]);
			} else {
				$querry0 = DB::table('couche-thematique')
					->where('id', $id)
					->update(['service_wms' => $service_wms]);
			}

			$data['status'] = 'ok';

			DB::select('COMMIT;');

			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function save_properties_couche_api(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$sous_thematiques = $Requests->input('sous_thematiques', null);
			$id = $Requests->input('key_couche', null);

			$url = $Requests->input('url', null);


			if ($sous_thematiques) {

				$querry0 = DB::table('couche-sous-thematique')
					->where('id', $id)
					->update(['url' => $url]);
			} else {
				$querry0 = DB::table('couche-thematique')
					->where('id', $id)
					->update(['url' => $url]);
			}

			$data['status'] = 'ok';

			DB::select('COMMIT;');

			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function save_properties_couche_osm(Request $Requests)
	{

		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$sous_thematiques = $Requests->input('sous_thematiques', null);
			$id = $Requests->input('key_couche', null);
			$type_geom = $Requests->input('geom', null);
			$nom = $Requests->input('nom', null);
			$type_couche = $Requests->input('type_couche', null);

			$key_val_osm = $Requests->input('key_val_osm', null);

			$data = array();
			$data['data'] = array();

			$id_cat = DB::table("categorie")->select("id_cat", "key_couche", "sous_thematiques")
				->where("sous_thematiques", "=", $sous_thematiques)->where("key_couche", "=", $id)->get();
			if (!$id_cat) {
				$querry0 = DB::table('categorie')->insertGetId(
					['type_couche' => $type_couche, 'key_couche' => $id, 'nom_cat' => $nom, 'sous_thematiques' => $sous_thematiques],
					'id_cat'
				);
			} else {
				$querry0 = $id_cat[0]->id_cat;
			}




			foreach ($key_val_osm as $key) {



				$querry = DB::table('sous_categorie')->insertGetId(
					['id_cat' => $querry0, 'action' => $key['action'], 'type_geom' => $type_geom, 'nom' => $key['nom'], 'operateur' => $key['operateur'], 'condition' => $key['condition']]
				);

				array_push($data['data'], $querry);
			}

			$data['status'] = 'ok';
			$data['id_cat'] = $querry0;

			DB::select('COMMIT;');

			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function delete_cles_vals_osm(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$id = $Requests->input('id', null);


			$querry0 = DB::table('sous_categorie')->where('id', $id)->delete();

			$data['status'] = 'ok';

			DB::select('COMMIT;');

			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}


	public function chooseTypeWms(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$sous_thematiques = $Requests->input('sous_thematiques', null);
			$key_couche = $Requests->input('key_couche', null);
			$wms_type = $Requests->input('wms_type', null);

			if ($sous_thematiques) {

				$querry0 = DB::table('couche-sous-thematique')
					->where('id', $key_couche)
					->update(['wms_type' => $wms_type]);
			} else {
				$querry0 = DB::table('couche-thematique')
					->where('id', $key_couche)
					->update(['wms_type' => $wms_type]);
			}

			$data['status'] = 'ok';

			DB::select('COMMIT;');
			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}


	public function genrateJsonFileByCat(Request $Requests)
	{
		$id_cat = $Requests->input('id_cat', null);

		$where = '';

		$getOperateur = function ($keyO) {

			if ($keyO == 0) {
				$operateur = '=';
			} else if ($keyO == 1) {
				$operateur = '!=';
			} else if ($keyO == 2) {
				$operateur = 'is not null';
			} else if ($keyO == 3) {
				$operateur = 'is null';
			}

			return $operateur;
		};

		$file_name = DB::table("categorie")->select("nom_cat", "type_couche")
			->where("id_cat", "=", $id_cat)->get();

		$key_val_osm = DB::table("sous_categorie")->select("action", "type_geom", "nom", "operateur", "condition")
			->where("id_cat", "=", $id_cat)->get();

		$geom = $key_val_osm[0]->type_geom;

		foreach ($key_val_osm as $key) {

			if (sizeof($key_val_osm) > 1) {

				if ($key->operateur != 2 && $key->operateur != 3) {

					if ($where == '') {
						$where = $key->action . ' ' . $getOperateur($key->operateur) . " '" . $key->nom . "'";
					} else {
						$where = $where . ' ' . $key->condition . ' ' . $key->action . ' ' . $getOperateur($key->operateur) . " '" . $key->nom . "'";
					}
				} else {

					if ($where == '') {
						$where = $key->action . ' ' . $getOperateur($key->operateur);
					} else {
						$where = $where . ' ' . $key->condition . ' ' . $key->action . ' ' . $getOperateur($key->operateur);
					}
				}
			} else {

				if ($key->operateur != 2 && $key->operateur != 3) {

					$where = $key->action . ' ' . $getOperateur($key->operateur) . " '" . $key->nom . "'";
				} else {

					$where = $key->action . ' ' . $getOperateur($key->operateur);
				}
			}                               	# code...
		}

		$msg = false;
		$sql = '';
		if ($geom == 'point') {
			$nbrePt = DB::select('select count(*) from (select A.name,A.amenity,hstore_to_json(A.tags),ST_AsGeoJSON(ST_TRANSFORM(A.way,4326)) as geometry from planet_osm_point  as A ,instances_gc as B where B.id = ' . $this->id_instance_gc . ' and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) )) AND ( ' . $where . ' )  ) src');


			$nbrePl = DB::select('select count(*) from (select A.name,hstore_to_json(A.tags),ST_AsGeoJSON(ST_Centroid(ST_TRANSFORM(A.way,4326))) as geometry from planet_osm_polygon as A ,instances_gc as B where B.id = ' . $this->id_instance_gc . ' and (ST_Contains( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) )) AND ( ' . $where . ' )  ) src');

			$sql = 'select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags),ST_TRANSFORM(A.way,4326) as geometry from planet_osm_point as A ,instances_gc as B where (B.id = ' . $this->id_instance_gc . ' and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) ))) AND ( ' . $where . ' )' . ';' . 'select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags),ST_Centroid(ST_TRANSFORM(A.way,4326)) as geometry from planet_osm_polygon as A ,instances_gc as B where (B.id = ' . $this->id_instance_gc . ' and (ST_Contains( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) ))) AND ( ' . $where . ' ) ';

			$msg = true;
			$data = $nbrePt[0]->count + $nbrePl[0]->count;

			// if ( ($nbrePt[0]->count + $nbrePl[0]->count) < 20000 ) {

			// 	$d0=DB::select('select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags),ST_AsGeoJSON(ST_TRANSFORM(A.way,4326)) as geometry from planet_osm_point as A ,instances_gc as B where (B.id = '.$this->id_instance_gc.' and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) ))) AND ( '. $where .' ) '  );

			// 	$d1=DB::select('select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags),ST_AsGeoJSON(ST_Centroid(ST_TRANSFORM(A.way,4326))) as geometry from planet_osm_polygon as A ,instances_gc as B where (B.id = '.$this->id_instance_gc.' and (ST_Contains( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) ))) AND ( '. $where .' ) '  );

			// 	$r0=json_encode(array_merge( json_decode(json_encode($d0), true),json_decode(json_encode($d1), true)));
			// 	$data=json_decode($r0);

			// }else{
			// 	$msg = true;
			// 	$data = $nbrePt[0]->count + $nbrePl[0]->count;
			// 	//return $where;

			// }


		} else if ($geom == 'Polygon') {

			//$nbrePl = DB::select( 'select count(*) from (select A.name,A.amenity,hstore_to_json(A.tags),ST_AsGeoJSON( ST_TRANSFORM(A.way,4326) ) as geometry from planet_osm_polygon as A ,instances_gc as B where (B.id = '.$this->id_instance_gc.' and ST_Contains ( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) )) AND ( '. $where .' )  ) src' );

			$surface = DB::select('select count(*) as count, sum(ST_NPoints(A.way)) AS nbre_pt,sum(A.way_area)/1000000 as surface from planet_osm_polygon  as A ,instances_gc as B where  (B.id = ' . $this->id_instance_gc . ' and (ST_Contains ( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) ))) AND ( ' . $where . ' )');

			$nbrePl = $surface[0]->nbre_pt;

			$sql = 'select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags), ST_TRANSFORM(A.way,4326) as geometry from planet_osm_polygon  as A ,instances_gc as B where  (B.id = ' . $this->id_instance_gc . ' and (ST_Contains ( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) ))) AND ( ' . $where . ' )';

			$msg = true;
			$data = $surface[0]->count;

			// if ($nbrePl < 20000) {

			// 	$d0=DB::select('select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags),ST_AsGeoJSON( ST_TRANSFORM(A.way,4326) ) as geometry from planet_osm_polygon  as A ,instances_gc as B where  (B.id = '.$this->id_instance_gc.' and (ST_Contains ( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) ))) AND ( '. $where .' )');
			// 	$data=$d0;

			// } else {

			// 	$msg = true;
			// 	$data = $surface[0]->count;
			// }


		} else if ($geom == 'LineString') {

			//$nbreL = DB::select( 'select count(*) from (select A.name,A.amenity,hstore_to_json(A.tags),ST_AsGeoJSON(ST_TRANSFORM(A.way,4326)) as geometry from planet_osm_roads as A ,instances_gc as B where (B.id = '.$this->id_instance_gc.' and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) ))) AND ( '. $where .' )  ) src' );

			$distance = DB::select('select count(*) as count, sum(ST_NPoints(A.way)) AS nbre_pt, sum(ST_length( geography(ST_TRANSFORM(A.way,4326)) )) / 1000 as distance from planet_osm_line  as A ,instances_gc as B where  (B.id = ' . $this->id_instance_gc . ' and (ST_Intersects ( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) ))) AND ( ' . $where . ' )');

			$nbreL = $distance[0]->nbre_pt;

			$sql = 'select A.osm_id,A.highway,A.bridge,A.name,A.oneway,A.junction,A.amenity,hstore_to_json(A.tags),ST_TRANSFORM(A.way,4326) as geometry from planet_osm_line as A ,instances_gc as B where (B.id = ' . $this->id_instance_gc . ' and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) ))) AND ( ' . $where . ' ) ';

			$msg = true;
			$data = $distance[0]->count;

			// if ($nbreL < 20000) {

			// 	$d0=DB::select('select A.osm_id,A.highway,A.bridge,A.name,A.oneway,A.junction,A.amenity,hstore_to_json(A.tags),ST_AsGeoJSON(ST_TRANSFORM(A.way,4326)) as geometry from planet_osm_line as A ,instances_gc as B where (B.id = '.$this->id_instance_gc.' and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) ))) AND ( '. $where .' ) ');
			// 	$data=$d0;

			// } else {
			// 	$msg = true;
			// 	$data = $distance[0]->count;
			// }

		}

		if ($msg || $file_name[0]->type_couche == 'wms') {

			$surface_totale = null;
			$distance_totale = null;

			if ($geom == 'Polygon') {
				$surface_totale = $surface[0]->surface;
				$reponse['surface'] = $surface_totale;
			} else if ($geom == 'LineString') {
				$distance_totale = $distance[0]->distance;
				$reponse['distance'] = $distance_totale;
			}


			if (!is_numeric($data)) {
				$data = sizeof($data);
			}

			$querry = DB::table('categorie')
				->where('id_cat', $id_cat)
				->update(['sql' => $sql, 'file_json' => null, 'status' => false, 'number' => $data, 'surface' => $surface_totale, 'distance' => $distance_totale]);

			$reponse['status'] = 'ok';
			$reponse['number'] = $data;
			$reponse['statut'] = false;
			return $reponse;
		} else {

			$surface_totale = null;
			$distance_totale = null;

			if ($geom == 'Polygon') {
				$surface_totale = $surface[0]->surface;
				$reponse['surface'] = $surface_totale;
			} else if ($geom == 'LineString') {
				$distance_totale = $distance[0]->distance;
				$reponse['distance'] = $distance_totale;
			}

			$r = json_encode($data);
			$file = strtolower(str_replace(" ", "_", $file_name[0]->nom_cat)) . '.json';
			$destinationPath = public_path() . "/upload/json/";

			if (!is_dir($destinationPath)) {
				mkdir($destinationPath, 0777, true);
			}

			File::put($destinationPath . $file, $r);

			$querry = DB::table('categorie')
				->where('id_cat', $id_cat)
				->update(['sql' => null, 'file_json' => $file, 'status' => true, 'number' => sizeof($data), 'surface' => $surface_totale, 'distance' => $distance_totale]);

			$reponse['status'] = 'ok';
			$reponse['number'] = sizeof($data);
			$reponse['statut'] = true;
			$reponse['file_json'] = $file;
			return $reponse;
		}
	}

	public function genrateAutomaticJsonFileByCat()
	{
		$getOperateur = function ($keyO) {

			if ($keyO == 0) {
				$operateur = '=';
			} else if ($keyO == 1) {
				$operateur = '!=';
			} else if ($keyO == 2) {
				$operateur = 'is not null';
			} else if ($keyO == 3) {
				$operateur = 'is null';
			}

			return $operateur;
		};

		$categories = DB::table("categorie")->select("id_cat", "nom_cat", "type_couche")->get();

		foreach ($categories as $categorie) {

			$where = '';

			$id_cat = $categorie->id_cat;

			$file_name = $categorie->nom_cat;

			$type_couche = $categorie->type_couche;

			$key_val_osm = DB::table("sous_categorie")->select("action", "type_geom", "nom", "operateur", "condition")
				->where("id_cat", "=", $id_cat)->get();

			if (sizeof($key_val_osm) > 0) {

				$geom = $key_val_osm[0]->type_geom;

				foreach ($key_val_osm as $key) {

					if (sizeof($key_val_osm) > 1) {

						if ($key->operateur != 2 && $key->operateur != 3) {

							if ($where == '') {
								$where = $key->action . ' ' . $getOperateur($key->operateur) . " '" . $key->nom . "'";
							} else {
								$where = $where . ' ' . $key->condition . ' ' . $key->action . ' ' . $getOperateur($key->operateur) . " '" . $key->nom . "'";
							}
						} else {

							if ($where == '') {
								$where = $key->action . ' ' . $getOperateur($key->operateur);
							} else {
								$where = $where . ' ' . $key->condition . ' ' . $key->action . ' ' . $getOperateur($key->operateur);
							}
						}
					} else {

						if ($key->operateur != 2 && $key->operateur != 3) {

							$where = $key->action . ' ' . $getOperateur($key->operateur) . " '" . $key->nom . "'";
						} else {

							$where = $key->action . ' ' . $getOperateur($key->operateur);
						}
					}                               	# code...
				}

				$msg = false;
				$sql = '';
				if ($geom == 'point') {
					$nbrePt = DB::select('select count(*) from (select A.name,A.amenity,hstore_to_json(A.tags),ST_AsGeoJSON(ST_TRANSFORM(A.way,4326)) as geometry from planet_osm_point  as A ,instances_gc as B where B.id = ' . $this->id_instance_gc . ' and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) )) AND ( ' . $where . ' )  ) src');


					$nbrePl = DB::select('select count(*) from (select A.name,hstore_to_json(A.tags),ST_AsGeoJSON(ST_Centroid(ST_TRANSFORM(A.way,4326))) as geometry from planet_osm_polygon as A ,instances_gc as B where B.id = ' . $this->id_instance_gc . ' and (ST_Contains( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) )) AND ( ' . $where . ' )  ) src');

					$sql = 'select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags),ST_TRANSFORM(A.way,4326) as geometry from planet_osm_point as A ,instances_gc as B where (B.id = ' . $this->id_instance_gc . ' and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) ))) AND ( ' . $where . ' )' . ';' . 'select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags),ST_Centroid(ST_TRANSFORM(A.way,4326)) as geometry from planet_osm_polygon as A ,instances_gc as B where (B.id = ' . $this->id_instance_gc . ' and (ST_Contains( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) ))) AND ( ' . $where . ' ) ';

					$msg = true;
					$data = $nbrePt[0]->count + $nbrePl[0]->count;

					// if ( ($nbrePt[0]->count + $nbrePl[0]->count) < 20000 ) {

					// 	$d0=DB::select('select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags),ST_AsGeoJSON(ST_TRANSFORM(A.way,4326)) as geometry from planet_osm_point as A ,instances_gc as B where (B.id = '.$this->id_instance_gc.' and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) ))) AND ( '. $where .' ) '  );



					// 	$d1=DB::select('select A.osm_id,A.name,hstore_to_json(A.tags),ST_AsGeoJSON(ST_Centroid(ST_TRANSFORM(A.way,4326))) as geometry from planet_osm_polygon as A ,instances_gc as B where (B.id = '.$this->id_instance_gc.' and (ST_Contains( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) ))) AND ( '. $where .' ) '  );

					// 	$r0=json_encode(array_merge( json_decode(json_encode($d0), true),json_decode(json_encode($d1), true)));
					// 	$data=json_decode($r0);

					// }else{
					// 	$msg = true;
					// 	$data = $nbrePt[0]->count + $nbrePl[0]->count;
					// 	//return $where;

					// }


				} else if ($geom == 'Polygon') {

					//$nbrePl = DB::select( 'select count(*) from (select A.name,A.amenity,hstore_to_json(A.tags),ST_AsGeoJSON( ST_TRANSFORM(A.way,4326) ) as geometry from planet_osm_polygon as A ,instances_gc as B where (B.id = '.$this->id_instance_gc.' and ST_Contains ( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) )) AND ( '. $where .' )  ) src' );

					$surface = DB::select('select count(*) as count,sum(ST_NPoints(A.way)) AS nbre_pt,sum(A.way_area)/1000000 as surface from planet_osm_polygon  as A ,instances_gc as B where  (B.id = ' . $this->id_instance_gc . ' and (ST_Contains ( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) ))) AND ( ' . $where . ' )');

					$nbrePl = $surface[0]->nbre_pt;

					$sql = 'select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags), ST_TRANSFORM(A.way,4326) as geometry from planet_osm_polygon  as A ,instances_gc as B where  (B.id = ' . $this->id_instance_gc . ' and (ST_Contains ( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) ))) AND ( ' . $where . ' )';

					$msg = true;
					$data = $surface[0]->count;

					// if ($nbrePl < 20000) {

					// 	$d0=DB::select('select A.osm_id,A.name,A.amenity,hstore_to_json(A.tags),ST_AsGeoJSON( ST_TRANSFORM(A.way,4326) ) as geometry from planet_osm_polygon  as A ,instances_gc as B where  (B.id = '.$this->id_instance_gc.' and (ST_Contains ( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) ))) AND ( '. $where .' )');
					// 	$data=$d0;

					// } else {

					// 	$msg = true;
					// 	$data = $surface[0]->count;
					// }


				} else if ($geom == 'LineString') {

					//$nbreL = DB::select( 'select count(*) from (select A.name,A.amenity,hstore_to_json(A.tags),ST_AsGeoJSON(ST_TRANSFORM(A.way,4326)) as geometry from planet_osm_roads as A ,instances_gc as B where (B.id = '.$this->id_instance_gc.' and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) ))) AND ( '. $where .' )  ) src' );

					$distance = DB::select('select count(*) as count,sum(ST_NPoints(A.way)) AS nbre_pt, sum(ST_length( geography(ST_TRANSFORM(A.way,4326)) )) / 1000 as distance from planet_osm_line  as A ,instances_gc as B where  (B.id = ' . $this->id_instance_gc . ' and (ST_Intersects ( ST_TRANSFORM(B.geom,4326), ST_TRANSFORM(A.way,4326) ))) AND ( ' . $where . ' )');

					$nbreL = $distance[0]->nbre_pt;

					$sql = 'select A.osm_id,A.highway,A.bridge,A.name,A.oneway,A.junction,A.amenity,hstore_to_json(A.tags),ST_TRANSFORM(A.way,4326) as geometry from planet_osm_line as A ,instances_gc as B where (B.id = ' . $this->id_instance_gc . ' and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) ))) AND ( ' . $where . ' ) ';

					$msg = true;
					$data = $distance[0]->count;

					// if ($nbreL < 20000) {

					// 	$d0=DB::select('select A.osm_id,A.highway,A.bridge,A.name,A.oneway,A.junction,A.amenity,hstore_to_json(A.tags),ST_AsGeoJSON(ST_TRANSFORM(A.way,4326)) as geometry from planet_osm_line as A ,instances_gc as B where (B.id = '.$this->id_instance_gc.' and (ST_Intersects( ST_TRANSFORM(A.way,4326), ST_TRANSFORM(B.geom,4326) ))) AND ( '. $where .' ) ');
					// 	$data=$d0;

					// } else {
					// 	$msg = true;
					// 	$data = $distance[0]->count;
					// }

				}

				if ($msg || $type_couche == 'wms') {

					$surface_totale = null;
					$distance_totale = null;

					if (!is_numeric($data)) {
						$data = sizeof($data);
					}

					if ($geom == 'Polygon') {
						$surface_totale = $surface[0]->surface;
						$reponse['surface'] = $surface_totale;
					} else if ($geom == 'LineString') {
						$distance_totale = $distance[0]->distance;
						$reponse['distance'] = $distance_totale;
					}

					$querry = DB::table('categorie')
						->where('id_cat', $id_cat)
						->update(['sql' => $sql, 'file_json' => null, 'status' => false, 'number' => $data, 'surface' => $surface_totale, 'distance' => $distance_totale]);
				} else {

					$surface_totale = null;
					$distance_totale = null;



					if ($geom == 'Polygon') {
						$surface_totale = $surface[0]->surface;
						$reponse['surface'] = $surface_totale;
					} else if ($geom == 'LineString') {
						$distance_totale = $distance[0]->distance;
						$reponse['distance'] = $distance_totale;
					}

					$r = json_encode($data);
					$file = strtolower(str_replace(" ", "_", $file_name)) . '.json';
					$destinationPath = public_path() . "/upload/json/";

					if (!is_dir($destinationPath)) {
						mkdir($destinationPath, 0777, true);
					}

					File::put($destinationPath . $file, $r);

					$querry = DB::table('categorie')
						->where('id_cat', $id_cat)
						->update(['sql' => null, 'file_json' => $file, 'status' => true, 'number' => sizeof($data), 'surface' => $surface_totale, 'distance' => $distance_totale]);

					//var_dump($querry);
				}
			}
		}

		$re['status'] = 'ok';

		DB::select('COMMIT;');

		return $re;
	}

	public function addMetadata(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$resume = $Requests->input('resume', null);
			$description = $Requests->input('description', null);
			$zone = $Requests->input('zone', null);
			$date_creation = $Requests->input('date_creation', null);
			$update = $Requests->input('update', null);
			$epsg = $Requests->input('epsg', null);
			$langue = $Requests->input('langue', null);
			$echelle = $Requests->input('echelle', null);
			$licence = $Requests->input('licence', null);
			$sous_thematiques = $Requests->input('sous', null);
			$id_referent = $Requests->input('id_referent', null);
			$tags = $Requests->input('tags', null);
			$partenaires = $Requests->input('partenaire', null);

			$querry1 = DB::table('metadata_thematiques')->insertGetId(
				[
					'licence' => $licence, 'resume' => $resume, 'description' => $description, 'zone' => $zone, 'date_creation' => $date_creation, 'update' => $update,
					'epsg' => $epsg, 'langue' => $langue, 'echelle' => $echelle, 'sous_thematiques' => $sous_thematiques, 'id_referent' => $id_referent
				]
			);

			if ($tags) {
				foreach ($tags as $tag) {
					$querry = DB::table('tags')->insertGetId(['tags' => $tag, 'id_referent' => $querry1, 'sous' => $sous_thematiques, 'type' => 'thematiques']);
				}
			}

			if ($partenaires) {
				foreach ($partenaires as $partenaire) {
					$querry = DB::table('partenaire')->insertGetId(['id_user' => $partenaire['id_user'], 'id_referent' => $querry1, 'sous' => $sous_thematiques, 'type' => 'thematiques']);
				}
			}

			DB::select('COMMIT;');
			$data['status'] = 'ok';
			$data['id'] = $querry1;
			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}

	public function editMetadata(Request $Requests)
	{
		try {

			DB::select('BEGIN;');
			DB::select('SAVEPOINT mon_pointdesauvegarde;');

			$id_metadata = $Requests->input('id_metadata', null);
			$resume = $Requests->input('resume', null);
			$licence = $Requests->input('licence', null);
			$description = $Requests->input('description', null);
			$zone = $Requests->input('zone', null);
			$date_creation = $Requests->input('date_creation', null);
			$update = $Requests->input('update', null);
			$epsg = $Requests->input('epsg', null);
			$langue = $Requests->input('langue', null);
			$echelle = $Requests->input('echelle', null);
			$sous_thematiques = $Requests->input('sous', null);
			$id_referent = $Requests->input('id_referent', null);
			$tags = $Requests->input('tags', null);
			$partenaires = $Requests->input('partenaire', null);

			$querry = DB::table('metadata_thematiques')
				->where('id', $id_metadata)
				->update([
					'licence' => $licence, 'resume' => $resume, 'description' => $description, 'zone' => $zone, 'date_creation' => $date_creation, 'update' => $update,
					'epsg' => $epsg, 'langue' => $langue, 'echelle' => $echelle
				]);

			$querry0 = DB::table('tags')->where('id_referent', $id_metadata)->where('sous', $sous_thematiques)->where('type', 'thematiques')->delete();
			$querry0 = DB::table('partenaire')->where('id_referent', $id_metadata)->where('sous', $sous_thematiques)->where('type', 'thematiques')->delete();

			if ($tags) {
				foreach ($tags as $tag) {
					$querry = DB::table('tags')->insertGetId(['tags' => $tag, 'id_referent' => $id_metadata, 'sous' => $sous_thematiques, 'type' => 'thematiques']);
				}
			}

			if ($partenaires) {
				foreach ($partenaires as $partenaire) {
					$querry = DB::table('partenaire')->insertGetId(['id_user' => $partenaire['id_user'], 'id_referent' => $id_metadata, 'sous' => $sous_thematiques, 'type' => 'thematiques']);
				}
			}

			DB::select('COMMIT;');
			$data['status'] = 'ok';
			return $data;
		} catch (\Exception $e) {

			DB::select('ROLLBACK TO mon_pointdesauvegarde;');
			DB::select('COMMIT;');
			return $e;
		}
	}
}
