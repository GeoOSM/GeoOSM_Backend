# Projet Laravel GeOsm
## Pré requis
Avant de continuer vous devez déjà avoir:
- PostgreSQL PostGIS installée. Si ce n’est pas le cas, nous vous invitons à suivre ce [tutoriel](https://learnosm.org/it/osm-data/setting-up-postgresql/)
- PHP (version égale ou supérieure à la 7.1.3)
- [Composer](https://getcomposer.org/)

## Intallation
Le bon fonctionnement de GeOsm nécessite le respect des étapes suivantes.
### I) La base de données
Elle contiendra l'architecture des données. \
Dans le dossier **BD**, se trouve un ficher **template_bd.backup** permettant de créer une base données avec le modèle de GeOsm.
La procédure est la suivante :
##### 1. Créer une base de données avec l'extension Postgis

##### 2. Importer le fichier **template_bd.backup** dans la base de données créée précédemment:


```sh
$ psql -U username -d database_name -f template_bd.backup --set ON_ERROR_STOP=on
```
[Documentation pour en savoir plus](http://www.postgresqltutorial.com/postgresql-restore-database/)

##### 3. On télécharge le fichier PBF qui nous intéresse sur [geofabrik](http://download.geofabrik.de/)
A titre d’exemple, nous allons télécharger sur GeoFabrik les fichiers PBF relatifs au Cameroun et à la nouvelle région Occitanie (composée des anciennes régions du Languedoc-Roussillon et Midi-Pyrénées):
```sh
$ wget https://download.geofabrik.de/africa/cameroon-latest.osm.pbf
$ wget https://download.geofabrik.de/europe/france/languedoc-roussillon-latest.osm.pbf
$ wget https://download.geofabrik.de/europe/france/midi-pyrenees-latest.osm.pbf
```
##### 4. Importer les données OSM 

Il s’agit d’abord d’installer OSM2PGSQL, dont la documentation est disponible sur les pages dédiées de [Wikipedia](https://wiki.openstreetmap.org/wiki/Osm2pgsql) ou [LearnOSM](https://learnosm.org/en/osm-data/osm2pgsql/)
```sh
$ apt-get install osm2pgsql
```
On récupère le fichier de style pour la base de données: **default.style** toujours dans le dossier **BD** \
Puis on importe le PBF téléchargé dans la base de données :\

- Pour le Cameroun qui contient un seul fichier pbf 
```sh
$ osm2pgsql --slim -G -c -U username -d database_name -H localhost -W --hstore-all -S default.style cameroon-latest.osm.pbf
```
- Pour Occitanie qui contient deux fichiers, il est nécessaire de les jumeler dans un premier temps; On se sert alors du logiciel [osmconvert](https://wiki.openstreetmap.org/wiki/Osmconvert):
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

Exemple: pour le Cameroun ce sont les limites du Pays, pour Occitanie, ce sont les limites de la région.\
Pour l'instant, il s’agit de connecter QGIS sur la base de données et on tente de remplir la table par une requête OSM. \
La base de données étant prête, on peut passer au projet PHP

### II) Projt PHP: Laravel

##### 1.  Déploiement du projet:
[Documentation officielle ici](https://laravel.com/docs/5.8)
```sh
$ cd ../projet laravel
$ composer install
```
Créer un fichier **.env** à la racine de votre dossier **projet laravel**, copiez y le texte ci-dessous en remplaçant les valeurs **database_name**, **username** et **database_password** :
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
Changer l'adresse du serveur **python+nodejs**, qu'on aura définit; on l'appellera "**www.serveur_python+nodejs.geosm**" \
Changer la variable **$scope.urlNodejs** qui se trouve dans le fichier **/projet laravel/public/assets/admin/js/app.js**\
```js
$scope.urlNodejs = 'http://service.geocameroun.cm/importation/' (à enlever)
$scope.urlNodejs = '**www.serveur_python+nodejs.geosm**' (à mettre)
```
Le projet Laravel est prêt !
##### 3.  Configurer Apache ou Nginx

Faire une configuration apache ou nginx pour lier un nom de domaine au projet Laravel qui pointe vers le dossier **/projet laravel/public** \
Par la suite, on appellera nom de domaine "**www.serveur_php.geosm**"\
Après vous pouvez tester dans votre navigateur **www.serveur_php.geosm/admin**, les identifiants de connexion par défaut sont\
 - login : admin@geocameroun.cm
 - mot de passe : 1234
 
##### 4.  Chargez les couches par défaut de GeOsm
Par défault, GeOsm vient avec 112 couches, mais qui ne sont définies que par leurs requêtes OSM; Il faut maintenant exécuter ces requêtes et créer des couches. Elle se fait en deux phases:
- **Etape 1 :** Vérification que toutes les requêtes sont bonnes, calcul du nombre d'entités trouvées et calcul des surfaces et distances totales.\
Dans l'interface d'administration, menu "Tableau de bord", cliquer sur le bouton "Mettre à jour le serveur de fichiers OSM". **ca peut prendre plus de 15 minutes**
- **Etape 2:** Remplissage des couches, elle se fait dans le projet **python+Nodejs**

## Brève description du modèle de données
On n'est partit surtout du fait qu'une couche peut être contenu dans un groupe ou un sous-groupe.\
Cette donnée pouvant elle-même ètre vecteur ou raster et de sources différentes.\

On a 4 tables principales qui les gèrent:
- **Thematiques** : elle contient tous les groupes
- **Sous-thematiques**: elle contient tous les sous-groupes qui sont lié à un groupe par la clé étrangère **id-thematiques** de la table **thématiques**
- **couches-sous-thématiques**: elle contient toutes les couches qui sont liés à un sous-groupe par la clé étrangère **id-sous-thematiques** de la table **sous-thematiques**
- **couche-thematiques**: elle contient toutes les couches qui sont liés directement à une thématique par la clé étrangère **id-thematiques** de la table **thematiques**
 ![4 tables](https://raw.githubusercontent.com/GeoOSM/GeoOSM_Backend/master/thematiques.PNG)

Pour lier toutes ces couches aux données OSM, on a 2 tables en plus:
- **Catégorie**: elle contient la requête sql d'une couche OSM, et est lié à cette couche par la clé étrangère **key_couche**.
- **sous-categorie**: qui contient toutes les clauses d'une requête. Si une requête a deux conditions, cette requête aura deux lignes dans la table. Elle est liée à la table catégorie par la clé étrangère **id_cat** de la table **categorie**
 ![](https://raw.githubusercontent.com/GeoOSM/GeoOSM_Backend/master/osm.PNG)

un apercu de la table **sous-categorie**:
 ![4 tables](https://raw.githubusercontent.com/GeoOSM/GeoOSM_Backend/master/requete.PNG)