# Projet Laravel GeoOSM
## Pré requis
Avant de continuer vous devez déja avoir:
- PostgreSQL avec la cartouche Postgis installé: si non vous pouvez suivre ce [tutoriel](https://learnosm.org/it/osm-data/setting-up-postgresql/)
- PHP >= 7.1.3
- [Composer](https://getcomposer.org/)

## Intallation
Il vaut mieux suivre les étapes en ordre.
### I) La base de données
Elle contiendra l'architecture des données. \
Dans le dossier **BD**, il y'a un ficher **template_bd.backup** qui permet de créer une base données avec le modèle de GeoOSM.
##### 1. Créer une base de données avec l'extension Postgis

##### 2. Importer le fichier **template_bd.backup** dans la base de données créee précedement:


```sh
$ psql -U username -d database_name -f template_bd.backup --set ON_ERROR_STOP=on
```
[Documentation pour en savoir plus](http://www.postgresqltutorial.com/postgresql-restore-database/)

##### 3. On télécharge le fichier PBF qui nous intéresse sur [geofabrik](http://download.geofabrik.de/)
Pour le Cameroun et la région Occitanie (France) qui est composée de deux PBF dans geofabrik
```sh
$ wget https://download.geofabrik.de/africa/cameroon-latest.osm.pbf
$ wget https://download.geofabrik.de/europe/france/languedoc-roussillon-latest.osm.pbf
$ wget https://download.geofabrik.de/europe/france/midi-pyrenees-latest.osm.pbf
```
##### 4. Importer les données OSM 

Pour cela on installe le logiciel OSM2PGSQL, [DOc wiki](https://wiki.openstreetmap.org/wiki/Osm2pgsql) ou [Doc LearnOSM](https://learnosm.org/en/osm-data/osm2pgsql/)
```sh
$ apt-get install osm2pgsql
```
On récupere le fichier de style pour la base données: **default.style** toujours dans le dossier **BD** \
Puis on importe le PBF téléchargé dans la base de données :\
pour le Cameroun qui contient un seul fichier pbf \
```sh
$ osm2pgsql --slim -G -c -U username -d database_name -H localhost -W --hstore-all -S default.style cameroon-latest.osm.pbf
```
Pour Occitanie qui contient deux fichiers, il faut d'abord les jumeler avant; On se sert alors du logiciel [osmconvert](https://wiki.openstreetmap.org/wiki/Osmconvert):
```sh
$ sudo apt-get install osmctools
$ osmconvert midi-pyrenees-latest.osm.pbf -o=midi-pyrenees.o5m
$ osmconvert languedoc-roussillon-latest.osm.pbf -o=languedouc.o5m
$ osmconvert midi-pyrenees.o5m languedouc.o5m -o=merged_occitanie.osm.pbf
```
Maintenant qu'on a le ficher **merged_occitanie.osm.pbf** qui contient les deux fichiers PBF téléchargés en (3) on peut l'importer en base de données:
```sh
$ osm2pgsql --slim -G -c -U username -d database_name -H localhost -W --hstore-all -S default.style merged_occitanie.osm.pbf
```
##### 5.  Il faut remplir la géométrie de la table **instances_gc** qui sera la limite de tout notre projet.

Exemple: pour le Cameroun ce sont les limites du Pays, pour Occitanie, ce sont les limites du de la région.\
Pour l'instant, on branche QGIS sur la base de données et on éssaie de remplir la table par une requète OSM. \
La base de données étant prète, on peut passer au projet PHP\

### II) Projt PHP: Laravel

##### 1.  Déployement du projet:
[Documentation officielle ici](https://laravel.com/docs/5.8)
```sh
$ cd ../projet laravel
$ composer install
```
Créer un fichier **.env** à la racine de votre dossier **projet laravel**, copiez y le texte ci dessous en remplacant les valeurs **database_name**, **username** et **database_password** :
```sh
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:zeQYaS0N+qX1iO+OZ3RFEmv4+hlO4M5yyHJVhx1SGuU=
APP_URL=http://localhost
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=database_name
DB_USERNAME=username
DB_PASSWORD=database_password*database_password**
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_DRIVER=sync
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
MAIL_DRIVER=smtp
MAIL_HOST=mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
API_PREFIX=api
```

##### 2.  Modification du projet Laravel
Changer l'adresse du serveur **python+nodejs**, qu'on aura définit; on l'appelera "**www.serveur_python+nodejs.geoosm**" \
Changer la variable **$scope.urlNodejs** qui se trouve dans le fichier **/projet laravel/public/assets/admin/js/app.js**\
```js
$scope.urlNodejs = 'http://service.geocameroun.cm/importation/' (à enlever)
$scope.urlNodejs = '**www.serveur_python+nodejs.geoosm**' (à mettre)
```
Le projet Laravel est prèt !
##### 3.  Configurer Apache ou Nginx

Faire une configuration apache ou nginx pour lier un nom de domaine au projet Laravel qui pointe vers le dossier **/projet laravel/public** \
Dans la suite on appelera ce nom de domaine "**www.serveur_php.geoosm**"\
Après vous pouvez tester dans votre navigateur **www.serveur_php.geoosm/admin**, les identifiants de connexion par défault sont\
 - login : admin
 - mot de passe : 1234
 
##### 4.  Chargez les couches par défault de GeoOSM
Par défault, GeoOSM vient avec 112 couches, mais qui ne sont définient que par leurs requètes OSM; Il faut maintenant exécuter ces requètes et créer des couches. Elle se fait en deux phases:
- **Etape 1 :** Vérification que toutes les requètes sont bonnes, calcul du nombre d'entités trouvées et calcul des surfaces et distances totales.\
Dans l'interface d'administration, ménu "Tableau de bord", cliquer sur le boutton "Mettre à jour le serveur de fichiers OSM". **ca peut prendre plus de 15 minutes**
- **Etape 2:** Remplissage des couches, elle se fait dans le projet **python+Nodejs**

## Brève description du modèle de données
On n'est partit surtout du fait qu'une couche peut ètre contenu dans un enssemble ou un sous-enssemble.\\
Cette donnée pouvant elle mème ètre vecteur ou raster et de sources différentes.\

on a 4 tables principales qui les gèrent:
- Thematiques : elle contient tous les enssembles
- Sous-thematiques: elle contient tous les sous-enssembles qui sont lié à un enssemble par la clé étrangère **id-thematiques** de la table **thématiques**
- couches-sous-thématiques: elle contient toutes les couches qui sont liés à un sous-enssemble par la clé étrangère **id-sous-thematiques** de la table **sous-thematiques**
- couche-thematiques: elle contient toutes les couches qui sont liés directement à une thématique par la clé étrangère **id-thematiques** de la table **thematiques**
 ![4 tables](https://raw.githubusercontent.com/GeoOSM/GeoOSM_Backend/master/thematiques.PNG)

Pour lier toutes ces couches aux données OSM, on a 2 tables en plus:
- Catégorie: elle contient la requète sql d'une couche OSM, et est lié à cette couche par la clé étrangère **key_couche**.
- sous-categorie: qui contient toutes les clauses d'une requète. Si une requète a deux conditions, cette requète aura deux lignes dans la table. Elle est lié à la table categorie par la clé étrangère **id_cat** de la table **categorie**
 ![](https://raw.githubusercontent.com/GeoOSM/GeoOSM_Backend/master/osm.PNG)

un apercu de la table **sous-categorie**:
 ![4 tables](https://raw.githubusercontent.com/GeoOSM/GeoOSM_Backend/master/requete.PNG)