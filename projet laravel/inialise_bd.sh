#!/bin/bash
db = mali
sudo -u postgres psql
CREATE DATABASE $db;
$db;
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;
\q
psql -U username -d $db -f ./BD/template_bd.backup --set ON_ERROR_STOP=on &&
wget http://download.geofabrik.de/africa/mali-latest.osm.pbf &&
osm2pgsql --slim -G -c -U postgres -d $db -H localhost -W --hstore-all -S ./BD/default.style mali-latest.osm.pbf &&
ogr2ogr -f "PostgreSQL" PG:"host=myserver user=postgres dbname==$db password=postgres" shapefile.shp -nln temp_table
sudo -u postgres psql
$db;
UPDATE instances_gc SET boundary = geom, true_geom = geom WHERE id = 1 FROM temp_table limit 1; 
TRUNCATE stage_table; 
# ogr2ogr -f "PostgreSQL" "PG:host=127.0.0.1 user=postgres dbname=$db password=postgres" "roi.shp" -lco GEOMETRY_NAME=the_geom -lco FID=gid -lco PRECISION=no -nlt PROMOTE_TO_MULTI -nln new_layername -overwrite