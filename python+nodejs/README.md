# Projet Python + Node JS GeOsm

## Pré requis
Avant de continuer, vous devez avoir installé:
- Qgis server >= 3
- Qgis Python
- Node JS
- OGR2OGR et GDAL

## Installation
Le bon fonctionnement de GeOsm nécessite le respect des étapes suivantes..

##### 1. Déploiement du projet Node JS

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
- Remplissez la variable **bd_access** pour la connexion à la Base de donée GeOsm
- Modifiee la variable **path_nodejs** avec le chemin absolu vers le dossier **python+nodejs**
##### 3. Configurer Apache ou Nginx pour associer un nom de domaine au projet node js
On appellera ce nom de domaine par la suite **www.serveur_nodejs+python.geoosm**
##### 4. Remplir toutes les couches par défaut de GeOsm
Il suffit de lancer la fonction **generateAllShapeFromOsmBuilderCreate** en entrant dans un navigateur l'url **www.serveur_nodejs+python.geoosm/nom du projet**. Remplacer **nom du projet** par le nom de votre projet, car c'est le nom qui sera utilisé pour le nom du projet QGIS qui sera créee.

**NB:** Bien conserver le nom du projet que vous avez utilisé