# Projet Python + Node JS GeoOSM

## Pré requis
Avant de continuer vous devez déja avoir:
- Qgis server >= 3
- Qgis Python
- Node JS

## Installation
Il vaut mieux suivre les étapes en ordre.

##### 1. Déployement du projet Node JS

```sh
$ cd ./python+nodejs
$ npm i
```
Le projet Node JS est prèt ! \
Pour le tester il suffit de :
```sh
$ node server.js
```
Et il sera sur l'adresse **localhost:3000**
##### 2. Modification du projet Node JS
- Remplisser la variable **bd_access** pour la connexion à la Base de donée GeoOSM
- Modifier la variable **path_nodejs** avec le chemin absolu vers le votre dossier **python+nodejs**
##### 3. Configurer Apache ou Nginx pour associer un nom de domaine au projet node js
On appelera ce nom de domaine par la suite **www.serveur_nodejs+python.geoosm**
##### 4. Remplir toutes les couches par défault de GeoOSM
Il suffit de lancer la fonction **generateAllShapeFromOsmBuilderCreate** en entrant dans un navigateur l'url **www.serveur_nodejs+python.geoosm/nom du projet**. Remplacer **nom du projet** par le nom de votre projet, car c'est le nom qui sera utilisé pour le nom du projet QGIS qui sera crée.

**NB:** Bien conserver le nom du projet que vous avez utilisé