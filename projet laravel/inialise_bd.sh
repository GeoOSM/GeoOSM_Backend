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