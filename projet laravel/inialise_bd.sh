#!/bin/bash
db="mali"
roi="../mali.shp"
path_pbf="http://download.geofabrik.de/africa/mali-latest.osm.pbf"
list_projet='/var/www/backend_nodejs/projet.json'


mkdir -m 777 -p /var/www/geosm/$db/gpkg/
mkdir -m 777 -p /var/www/geosm/$db/style/

svn checkout  https://github.com/GeoOSM/backend_nodejs/trunk/python_script/style_default
cp ./style_default/*.qml /var/www/geosm/$db/style/
rm -r style_default

node > out_${list_projet} <<EOF
//Read data
var data = require('./${list_projet}');

//Manipulate data 
data[$db]={};
data[$db]['destination_style']='/var/www/geosm/$db/style/';
data[$db]['destination']='/var/www/geosm/$db/gpkg/';
data[$db]['database']='$db';

//Output data
# console.log(JSON.stringify(data));
EOF
exit

psql -c "CREATE DATABASE $db"
echo "db created"
psql -d  $db -c "CREATE EXTENSION postgis"
psql -d $db -c "CREATE EXTENSION hstore"
#psql CREATE EXTENSION postgis_topology
echo "extention created"
pg_restore -U postgres -d $db  ./BD/template_bd.backup --verbose
wget $path_pbf -O osm.pbf
echo "import termine et telechargement du osm.pbf"
osm2pgsql --slim -G -c -U postgres -d $db -H localhost -W --hstore-all -S ./BD/default.style osm.pbf
echo "import du osm.pbf termine"
ogr2ogr -f "PostgreSQL" PG:"host=localhost user=postgres dbname=$db password=postgres"  $roi -nln temp_table -lco GEOMETRY_NAME=geom
psql -d $db -c "UPDATE instances_gc SET geom = st_transform(limite.geom,4326), true_geom = st_transform(limite.geom,4326) FROM (SELECT * from temp_table limit 1) as limite WHERE instances_gc.id = 1;"
psql -d $db -c "TRUNCATE temp_table;"
echo "termne !!!!! !!! !"
exit


# sudo apt-get install php7.3-xml
# sudo apt-get install php-mbstring
# composer install
# sudo add-apt-repository ppa:ubuntugis/ppa && sudo apt-get update
# sudo apt-get install gdal-bin

#vim /etc/apt/sources.list
# deb     https://qgis.org/debian buster main
# deb-src https://qgis.org/debian buster main
# wget -O - https://qgis.org/downloads/qgis-2019.gpg.key | gpg --import
# gpg --fingerprint 51F523511C7028C3
# gpg --export --armor 51F523511C7028C3 | sudo apt-key add -
# apt install qgis-server

#sudo apt-get install subversion
# 2a01:e0d:1:c:58bf
# @2a01:e0d:1:c:58bf:fac1:8000:167

# http://[2a01:e0d:1:c:58bf:fac1:8000:167]

# [2607:f0d0:1002:11::4:80]