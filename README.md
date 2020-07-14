# GeOsm Backend
En termes de serveur, GeOsm est une infrastructure contenant plusieurs logiciels interconnectés afin de manipuler, stocker et distribuer l’information géographique par QGIS Server (WMS, WFS, WMTS) dans le but d’y accéder sur une interface commune.
La caractéristique principale de GeOsm est d’offrir la possibilité de manipuler, valoriser et récupérer les données OpenStreetMap de façon simple et sans que cela ne nécessite de compétences avancées en développement informatique.


## Fonctionnalités
A partir de l'interface d'administration, il est notamment possible de :
  - Créer des comptes d’utilisateurs qui pourront acceder à l'administration.
  - Créer groupes et des sous-groupes de couches.
  - Créer des couches en construisant une requète avec les [tags OSM](https://wiki.openstreetmap.org/wiki/FR:%C3%89l%C3%A9ments_cartographiques) 
  - Choisir le mode de diffusion d'une donées WFS ou WMS.
  - Appliquer un style QGIS à une couche
  - Télécharger de données. 
  - Appliquer des métadonnées
 
## Langages
GeoOSM est écrit avec [Node JS](http://nodejs.org), Python 3 et PHP ( [Laravel](https://laravel.com/)):
- Node JS : Communication entre la base de données et python, et aussi entre un utilisateur et python
- Python : Manipulation des projets QGIS pour QGIS SERVEUR. Permet notamment de créer un nouveau WMS ou supprimer un existant, appliquer un style QGIS sur une couche, téléchargement de données sur une emprise, etc.
- PHP : Assure principalement la communication entre les utilisateurs et la base de données. Permet de créer une nouvelle couche, un groupe ou sous-groupe de couches, de créer un compte d’utilisateur ou encore former une requête SQL sur les données OSM en fonction des entrées de l’utilisateur, etc.

 
## Pour installer
Pour une meilleure compréhesion et une installation pas à pas, on a séparé le projet en deux et à suivre dans l'odre suivant:
- **Python+nodejs** : Les projets python et Node JS
- **Projet Laravel**  : tout le projet PHP avec la base de donées

**NB :** Dans le cadre de chaque projet GeOsm, il s’agit de répliquer uniquement **Projet Laravel** car **Python+nodejs** est notamment composé de librairies pouvant être utilisé dans d’autres projets GeOsm
