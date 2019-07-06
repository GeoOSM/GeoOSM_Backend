# GeoOSM Backend
GeoOSM coté serveur est une infrastructure contenant plusieurs logiciels interconnectés par des langages de programmation pour manipuler, stocker et distribuer l’information géographique par QIS Serveur (WMS, WFS, WMTS). Tout ceci avec une interface. Il a la particularité d’offrir la possibilité de manipuler les données OpenStreetMap de manière très aisée sans beaucoup de connaissances techniques.

## Fonctionnalités
A partir de l'interface d'administration il est possible principalement de :
  - Créer d'utilisateurs qui pourront acceder à l'administration.
  - Créer d'enssembles ou de sous-enssembles de couches
  - Créer des couches en construisant une requète avec les [tags OSM](https://wiki.openstreetmap.org/wiki/FR:%C3%89l%C3%A9ments_cartographiques) 
  - Choisir le mode de diffusion d'une donées WFS ou WMS.
  - Appliquer un style QGIS à une couche
  - Télécharger de données. 
  - Métadonnées très basiques
 
## Langages
GeoOSM est écrit avec [Node JS](http://nodejs.org), Python 3 et PHP ( [Laravel](https://laravel.com/)):
  - PHP: il assure surtout la communication entre les utilisateurs et la base de données. C’est lui qui permet de créer une nouvelle couche, un enssemble ou sous-enssemble, un utilisateur ou encore former une requête SQL sur les données OSM en fonction des entrées de l’utilisateur  etc….
  - Python: c'est lui qui manipule les projets QGIS pour QGIS SERVEUR. On peut citer entre autre créer un nouveau WMS ou supprimer un existant, appliquer un style QGIS sur une couche, téléchargement de données sur une emprise etc...
  - Node JS : Communication entre la base de données et python, et aussi entre un utilisateur et python
 
## Pour installer
Pour une meilleure compréhesion et une installation pas à pas, on a séparé le projet en deux et à suivre dans l'odre suivant:
- **Python+nodejs** : Les projets python et Node JS
- **Projet Laravel**  : tout le projet PHP avec la base de donées

**NB :** pour chaque porjet GeoOSM, il faut répliquer juste **Projet Laravel** car **Python+nodejs** peut ètre utilisé pour plusieurs autres projets
