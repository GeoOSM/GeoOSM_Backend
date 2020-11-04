var app = angular.module('monapp', ['ui.bootstrap', 'ngRoute', 'color.picker', 'openlayers-directive', 'ngAnimate', 'ngSanitize', 'textAngular'], ['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.headers.post['X-CSRF-TOKEN'] = $('meta[name=csrf-token]').attr('content');
}]);



app.config(function ($routeProvider) {
    $routeProvider
        .when('/admin', {
            templateUrl: 'assets/admin/views/main.html'
        })
        .when('/login', {
            templateUrl: 'assets/admin/views/login.html'
        })
        .otherwise({
            redirectTo: '/login'
        })
})

// app.controller('mainCtrl', function ($scope, $uibModal,myfactory,$rootScope,fileUpload,$http,$window) {

// })
app.controller('mainCtrl', function ($location, $scope, $uibModal, myfactory, $rootScope, fileUpload, $http, $window, olData) {

    ////////////////////////////////////////////////////////////////////////////

    for (var key in config_projet) {
        $scope[key] = config_projet[key]
    }


    $rootScope.$on('$locationChangeStart', function (event, next, current) {
        myfactory.get_data("check").then(function (resp) {

            if (resp.session == true) {
                $scope._user = resp
                console.log(resp)
                $location.path('/admin');
                // $window.location.href = 'http://localhost:8000/admin#/admin'
            } else {
                $location.path('/login');
                // $window.location.href = 'http://localhost:8000/admin#/login'
            }

        }, function (msg) {

        })
    });

    $scope.updateFtpOsm = function () {

        $('#spinner').show()


        myfactory.get_data("/thematique/genrateAutomaticJsonFileByCat/").then(function (resp) {

            if (requete_reussi(resp)) {
                $('#spinner').hide()
                // myfactory.get_data($scope.urlNodejs_backend+"/generateAllShapeFromOsmBuilder/"+$scope.projet_qgis_server).then(function (resp) {
                //     toogle_information("Operation reussi")
                //     $('#spinner').hide()


                // },
                // function (msg) {
                //     toogle_information('une erreur : code updateFtpOsm_1  ')
                //     $('#spinner').hide()
                // })

            } else {
                $('#spinner').hide()
                toogle_information('une erreur : Verifier toutes les requetes osm pour chercher l erreur ou contacter Appo ')
            }

        }, function (msg) {
            alert('une erreur : Verifier toutes les requetes osm pour chercher l erreur ou contacter Appo ')
            $('#spinner').hide()
        })
    }

    var view = new ol.View({
        center: ol.proj.transform([2.680664062500000, 43.7115642466585], 'EPSG:4326', 'EPSG:3857'),
        zoom: 8,
    })

    olData.getMap().then(function (map) {


        map.setView(view)

        map.addInteraction(new ol.interaction.MouseWheelZoom())

        map.getLayers().forEach(function (layer) {
            layer.setVisible(false)
            layer.set("name", "osm");
        })


        $scope.map = map

        $scope.map.on('moveend', function () {
            $('#textZoom').text(map.getView().getZoom())
        })

        /////////////////////Mapillary///////////////////////////

        var strokestyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(53, 175, 109,0.7)',
                width: 4
            })
        });

        layer = new ol.layer.VectorTile({
            source: new ol.source.VectorTile({
                format: new ol.format.MVT(),
                tileGrid: ol.tilegrid.createXYZ({
                    maxZoom: 22
                }),
                tilePixelRatio: 16,
                opacity: 0.7,
                url: 'https://d25uarhxywzl1j.cloudfront.net/v0.1/{z}/{x}/{y}.mvt'
            }),
            style: strokestyle
        })
        //map.addLayer(layer)
        /////////////////////Mapillary///////////////////////////


    })


    $scope.errors = [];

    $scope.files = [];

    $scope.filess = [];

    $scope.login = function (user) {
        $('#spinner').show()

        myfactory.post_data("loginAdmin", {
            "email": user.email,
            "mdp": user.password
        }).then(function (resp) {
            console.log(resp)
            if (resp.status == "ok") {
                if (resp.data[0].droit == "utilisateur") {
                    toogle_information("Votre compte n'a pas de droit pour l'administration")
                } else {
                    $window.location.reload();
                }


            } else {
                toogle_information("E-mail ou mot de passe incorrect")
            }

            $('#spinner').hide()

        }, function (msg) {
            toogle_information("Verifier votre connexion")
            $('#spinner').hide()

        })
    }

    $scope.menu_deconexion = function () {
        if ($('#user_connect').css('display') == 'none') {
            $('#user_connect').show()
        } else {
            $('#user_connect').hide()
        }

    }

    $scope.deconnect = function () {

        myfactory.get_data("deconnect").then(function (resp) {
            $window.location.reload()

        }, function (msg) {

            alert("service non disponible")


        })


    }



    $scope.limites_administratives = []
    $scope.bbox_projet = []
    myfactory.get_data('config_bd_projet').then(
        function (data) {
            if (data.status == "ok") {
                $scope.limites_administratives = data['limites']
                $scope.bbox_projet = data['bbox']
                console.log(data)
                if ($scope.bbox_projet.length != 0) {
                    // view.fit([-1362582.12638531,1135601.87320162,475042.880315974,2875877.76991498])
                }

            }

        },
        function (err) {
            toogle_information("Verifier votre connexion")
        }
    )


    $scope.nouvelles_limites_administratives = []

    $scope.get_couche_thematique = function (key_couche, sous_thematique) {
        var data = $scope.thematiques
        for (var i = 0; i < data.length; i++) {
            if (sous_thematique) {
                for (var j = 0; j < data[i].sous_thematiques.length; j++) {
                    for (var k = 0; k < data[i].sous_thematiques[j].couches.length; k++) {
                        if (data[i].sous_thematiques[j].couches[k].key_couche == key_couche) {
                            return data[i].sous_thematiques[j].couches[k]
                        }
                    }

                }
            } else {
                for (var k = 0; k < data[i].couches.length; k++) {

                    if (data[i].couches[k].key_couche == key_couche) {
                        return data[i].couches[k]
                    }
                }

            }
        }

    }

    $scope.couches_thematiques_by_type_geom = function (type_geom) {
        var data = $scope.thematiques
        var result = []

        for (var i = 0; i < data.length; i++) {
            if (data[i].sous_thematiques != false) {
                for (var j = 0; j < data[i].sous_thematiques.length; j++) {
                    for (var k = 0; k < data[i].sous_thematiques[j].couches.length; k++) {
                        if (data[i].sous_thematiques[j].couches[k].geom == type_geom) {
                            data[i].sous_thematiques[j].couches[k].sous_thematiques = true
                            result.push(data[i].sous_thematiques[j].couches[k])
                        }
                    }
                }
            } else {
                for (var k = 0; k < data[i].couches.length; k++) {
                    if (data[i].couches[k].geom == type_geom) {
                        data[i].couches[k].sous_thematiques = false
                        result.push(data[i].couches[k])
                    }
                }
            }
        }
        return result

    }
    $scope.supprimer_limite_adm = function (limite) {
        $('#spinner').show()

        myfactory.post_data("delete_limite_administrative", limite).then(
            function (resp) {
                $('#spinner').hide()

                if (resp.status == "ok") {
                    var index_limite = undefined
                    for (var index = 0; index < $scope.limites_administratives.length; index++) {
                        var element = $scope.limites_administratives[index];
                        if (element.id_limite == limite.id_limite) {
                            index_limite = index
                        }
                    }

                    if (index_limite != undefined) {
                        $scope.limites_administratives.splice(index_limite, 1)
                    }

                    toogle_information("La limite a bien été supprimé")

                } else {
                    toogle_information("Un problème est survenu")
                }
            },
            function (msg) {
                toogle_information("Verifier votre connexion")
                $('#spinner').hide()

            }
        )
    }


    $scope.add_limite_administrative = function () {
        var data = $scope.nouvelles_limites_administratives[0]
        if (data.nom && data.couche) {
            var donne = {
                'key_couche': JSON.parse(data.couche).key_couche,
                'sous_thematiques': JSON.parse(data.couche).sous_thematiques,
                'nom': data.nom
            }

            $('#spinner').show()

            myfactory.post_data("add_limite_administrative", donne).then(
                function (resp) {
                    console.log(resp)
                    if (resp.status == "ok") {

                        donne.nom_table = resp.nom_table
                        donne.id_limite = resp.id_limite
                        console.log(donne)
                        $scope.limites_administratives.push(donne)
                        $scope.nouvelles_limites_administratives = []

                    } else {
                        toogle_information("Un problème est survenu")
                    }

                    $scope.toogle_confirmation('false')
                    $('#spinner').hide()

                },
                function (msg) {
                    toogle_information("Verifier votre connexion")
                    $scope.toogle_confirmation('false')
                    $('#spinner').hide()

                })


        } else {
            toogle_information('Renseignez toutes les informations')
        }
    }

    $scope.nombre_couches = function (data) {
        var nombre = 0
        for (var i = 0; i < data.length; i++) {
            if (data[i].sous_thematiques != false) {
                for (var j = 0; j < data[i].sous_thematiques.length; j++) {
                    if (data[i].sous_thematiques[j].couches) {
                        nombre = nombre + data[i].sous_thematiques[j].couches.length
                    }
                    // Array.isArray(data[i].sous_thematiques)

                }
            } else {
                if (data[i].couches) {
                    nombre = nombre + data[i].couches.length
                }

            }
        }

        return nombre
    }

    $scope.nombre_cartes = function (data) {
        if (data) {

            var nombre = 0
            for (var i = 0; i < data.length; i++) {

                if (Array.isArray(data[i].sous_cartes)) {
                    for (var j = 0; j < data[i].sous_cartes.length; j++) {
                        for (var index = 0; index < data[i].sous_cartes[j].couches.length; index++) {
                            if (data[i].sous_cartes[j].couches[index].type == "pdf") {
                                nombre = nombre + data[i].sous_cartes[j].couches[index].cartes_pdf.length
                            } else {
                                nombre = nombre + 1
                            }

                        }

                    }
                } else {

                    // nombre = nombre + data[i].couches.length
                    for (var index = 0; index < data[i].couches.length; index++) {
                        if (data[i].couches[index].type == "pdf") {
                            nombre = nombre + data[i].couches[index].cartes_pdf.length
                        } else {
                            nombre = nombre + 1
                        }

                    }
                }
            }

            return nombre
        } else {
            return "Calcul en cours"
        }
    }

    $scope.listFiles = function () {
        var request = {
            method: 'GET',
            url: '/file/list',
            headers: {
                'Content-Type': undefined
            }
        };

        $http(request)
            .then(function success(e) {

                $scope.files = e.data.files;

            }, function error(e) {

            });
    };

    //$scope.listFiles();

    var formData = new FormData();

    $scope.uploadFile = function () {

        var request = {
            method: 'POST',
            url: '/upload/file',
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        };
        $http(request)
            .then(function success(e) {

                //var fileElement = $('#image_file');
                //fileElement.value = '';
                console.log(e.data.status)
                return e
            }, function error(e) {
                alert(e.data.errors);
            });
    };

    $scope.setTheFiles = function ($files, couche) {
        couche.file = $files[0]
        console.log($files)
        /*formData = new FormData();;
        angular.forEach($files, function (value, key) {
            formData.append('image_file', value);
        });
        $scope.files.push(1)*/
    };

    $scope.setMultipleFiles = function ($files, couche) {
        couche.file = $files[0]

        console.log(couche)

        /*$scope.filess.push(1)
        angular.forEach($files, function (value, key) {
            formDatas.append('image_file'+$scope.filess.length, value);
            formDatas.append('nombre', $scope.filess.length);
        });*/

    };

    $scope.deleteFile = function (index) {
        var conf = confirm("Do you really want to delete this file?");

        if (conf == true) {
            var request = {
                method: 'POST',
                url: '/delete/file',
                data: $scope.files[index]
            };

            $http(request)
                .then(function success(e) {
                    $scope.errors = [];

                    $scope.files.splice(index, 1);

                }, function error(e) {
                    $scope.errors = e.data.errors;
                });
        }
    };









    /////////////////////////////////////////////////////////////////////////////////////
    $scope.menu = {
        'bord': true,
        'utilisateur': false,
        'thematique': false,
        'cartes': false
    }

    $scope.nouveau_utilisateur = {
        'img_temp': 'assets/admin/images/user.svg',
        'nom_img_modife': 'assets/admin/images/user.svg'
    }

    $scope.undescore2space = function (donne) {

        return donne.replace(/_/g, ' ')
    }

    var space2underscore = function (donne) {
        return donne.replace(/ /g, '_')
    }

    var slash2underscore = function (donne) {
        return donne.replace(/ /g, '_')
    }

    function requete_reussi(reponse) {
        if (reponse.status == 'ok') {
            return true
        } else {
            $scope.toogle_confirmation('false')
            toogle_information('Un probl�me est survenu, veillez reesayer')
            return false
        }
    }

    function toogle_information(information) {
        $scope.information = information
        $('.information').css('top', '0px')

        setTimeout(function () {
            $scope.information = ''
            $('.information').css('top', '-62px')
        }, 5000);
    }

    $scope.confirmation = {
        'active': false
    }

    $scope.toogle_confirmation = function (texte, data, data1) {

        if (texte == 'utilisateur') {
            msg = "supprimer l'utilisateur : " + data.nom + ' ?'
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'active': true,
                'type': texte
            }
        } else if (texte == 'droit') {
            msg = "supprimer le droit : " + data.nom + ' ?'
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'active': true,
                'type': texte
            }
        } else if (texte == 'thematique') {
            msg = "supprimer la thematique : " + data.nom + ' ?'
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'active': true,
                'type': texte
            }
        } else if (texte == 'couche_supprimer') {
            msg = "supprimer la couche : " + data.nom + ' ?'
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'active': true,
                'type': texte
            }
        } else if (texte == 'supprimer_colomne') {
            msg = "supprimer le champ : " + data.nom + ' ?'
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'data1': data1,
                'active': true,
                'type': texte
            }
        } else if (texte == 'supprimer_sous_thematique') {
            msg = "supprimer la sous thematique : " + data.nom + ' ?'
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'data1': data1,
                'active': true,
                'type': texte
            }
        } else if (texte == 'utilisateur_droits_sur_couche_supprimer') {
            msg = "supprimer le droit de : " + data.nom + ' ?'
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'active': true,
                'type': texte
            }
        } else if (texte == 'cartes') {
            msg = "supprimer la carte : " + data.nom + ' ?'
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'active': true,
                'type': texte
            }
        } else if (texte == 'supprimer_sous_cartes') {
            msg = "supprimer le sous groupe : " + data.nom + ' ?'
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'data1': data1,
                'active': true,
                'type': texte
            }
        } else if (texte == 'couche_supprimer_cartes') {
            msg = "supprimer la carte : " + data.nom + ' ?'
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'active': true,
                'type': texte
            }
        } else if (texte == 'sequence_supprimer') {
            msg = "supprimer la sequence : " + data.nom + ' ?'
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'active': true,
                'type': texte
            }
        } else if (texte == 'delete_cles_vals_osm') {
            msg = "supprimer cette clause ?"
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'data1': data1,
                'active': true,
                'type': texte
            }
        } else if (texte == 'delete_pdf_carte') {
            msg = "Supprimer la carte " + data.name + " ?"
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'data1': data1,
                'active': true,
                'type': texte
            }
        } else if (texte == 'supprimer_limite_adm') {
            msg = "Supprimer la limite administrative " + data.nom + " ?"
            $scope.confirmation = {
                'msg': msg,
                'data': data,
                'active': true,
                'type': texte
            }
        } else if (texte === 'false') {
            $scope.confirmation.active = false
        }

    }

    $scope.action_confirmation = function (type, data, data1) {

        if (type == 'utilisateur') {
            $scope.supprimerUtilisateur(data)
        } else if (type == 'thematique') {
            $scope.supprimer_thematique(data)
        } else if (type == 'droit') {
            $scope.supprimerdroit(data)
        } else if (type == 'couche_supprimer') {
            $scope.delete_couche(data)
        } else if (type == 'supprimer_colomne') {
            $scope.supprimer_colomne(data, data1)
        } else if (type == 'supprimer_sous_thematique') {
            $scope.supprimer_sous_thematique(data, data1)
        } else if (type == 'utilisateur_droits_sur_couche_supprimer') {
            $scope.supprimer_utilisateur_couche(data)
        } else if (type == 'cartes') {
            $scope.supprimer_cartes(data)
        } else if (type == 'supprimer_sous_cartes') {
            $scope.supprimer_sous_cartes(data, data1)
        } else if (type == 'couche_supprimer_cartes') {
            $scope.delete_couche_cartes(data)
        } else if (type == 'sequence_supprimer') {
            $scope.delete_sequence_cartes(data)
        } else if (type == 'delete_cles_vals_osm') {
            $scope.delete_cles_vals_osm(data, data1)
        } else if (type == 'delete_pdf_carte') {
            $scope.delete_doc_pdf(data, data1)
        } else if (type == 'supprimer_limite_adm') {
            $scope.supprimer_limite_adm(data)
        }

    }

    $scope.changer_menu = function (menu) {

        for (var key in $scope.menu) {
            if (key == menu) {
                $scope.menu[key] = true
            } else {
                $scope.menu[key] = false
            }
        }

    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour recuperer les utilisateurs
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    formatusers = function (user) {
        for (var i = 0; i < user.length; i++) {

            user[i].id = i
            var a = []
            var b = []

            for (var j = 0; j < user[i].droits_sous_thematique.length; j++) {
                a.push(user[i].droits_sous_thematique[j].key_couche)
            }

            for (var k = 0; k < user[i].droits_thematique.length; k++) {
                b.push(user[i].droits_thematique[k].key_couche)
            }

            user[i].les_id_droits_sous = a

            user[i].les_id_droits_thematiques = b
        }
    }

    function getUser() {
        myfactory.get_data('/api/v1/RestFull/getUsers').then(
            function (data) {


                $scope.utilisateurs = data

                formatusers($scope.utilisateurs)
                console.log($scope.utilisateurs)

            },
            function (err) {
                alert(err)
            }
        )
    }

    getUser()
    $scope.page_principale_utilisateur = true

    $scope.getNameUser = function (id) {
        for (var index = 0; index < $scope.utilisateurs.length; index++) {
            if ($scope.utilisateurs[index].id_utilisateur == id) {
                return $scope.utilisateurs[index].nom
            }

        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour avoir le catalogue de donnee
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function getCatalogueDonne() {
        myfactory.get_data('/thematique/getCatalogueDonne/').then(
            function (data) {

                data_catalogue_sous_thematiques = data.catalogue_sous_thematiques
                data_catalogue_thematiques = data.catalogue_thematiques

                catalogue_sous_thematiques = []
                catalogue_thematiques = []

                for (var i = 0; i < data_catalogue_sous_thematiques.length; i++) {

                    catalogue_sous_thematiques[data_catalogue_sous_thematiques[i].id_theme] = []

                    for (var j = 0; j < data_catalogue_sous_thematiques.length; j++) {
                        if (data_catalogue_sous_thematiques[i].id_theme == data_catalogue_sous_thematiques[j].id_theme) {

                            catalogue_sous_thematiques[data_catalogue_sous_thematiques[i].id_theme].push(data_catalogue_sous_thematiques[j])
                        }
                    }

                }

                for (var i = 0; i < data_catalogue_thematiques.length; i++) {

                    catalogue_thematiques[data_catalogue_thematiques[i].id_theme] = []

                    for (var j = 0; j < data_catalogue_thematiques.length; j++) {
                        if (data_catalogue_thematiques[i].id_theme == data_catalogue_thematiques[j].id_theme) {

                            catalogue_thematiques[data_catalogue_thematiques[i].id_theme].push(data_catalogue_thematiques[j])
                        }
                    }

                }

                $scope.catalogueDonne = {
                    "catalogue_sous_thematiques": catalogue_sous_thematiques,
                    "catalogue_thematiques": catalogue_thematiques
                }

                if ($scope.theme_non_catalogue) {
                    $scope.thematiques = cataloguerColones($scope.theme_non_catalogue)
                }



            },
            function (err) {
                alert(err)
            }
        )
    }

    getCatalogueDonne()

    function cataloguerColones(data) {

        for (var i = 0; i < data.length; i++) {

            if (Array.isArray(data[i].sous_thematiques)) {
                for (var j = 0; j < data[i].sous_thematiques.length; j++) {

                    for (var k = 0; k < data[i].sous_thematiques[j].couches.length; k++) {

                        angular.forEach($scope.catalogueDonne.catalogue_sous_thematiques, function (item, y) {

                            if (data[i].sous_thematiques[j].couches[k].key_couche == y) {
                                for (var z = 0; z < data[i].sous_thematiques[j].couches[k].colonnes.length; z++) {
                                    for (var x = 0; x < item.length; x++) {
                                        if (data[i].sous_thematiques[j].couches[k].colonnes[z].nom == item[x].champ) {

                                            data[i].sous_thematiques[j].couches[k].colonnes[z].nom = item[x].aliase

                                            data[i].sous_thematiques[j].couches[k].colonnes[z].champ_principal = item[x].champ_principal
                                        }
                                    }

                                }
                            }
                        })

                    }

                }
            } else {

                for (var k = 0; k < data[i].couches.length; k++) {

                    angular.forEach($scope.catalogueDonne.catalogue_thematiques, function (item, y) {

                        if (data[i].couches[k].key_couche == y) {
                            for (var z = 0; z < data[i].couches[k].colonnes.length; z++) {
                                for (var x = 0; x < item.length; x++) {
                                    if (data[i].couches[k].colonnes[z].nom == item[x].champ) {

                                        data[i].couches[k].colonnes[z].nom = item[x].aliase
                                        data[i].couches[k].colonnes[z].champ_principal = item[x].champ_principal
                                    }
                                }
                            }
                        }
                    })

                }

            }
        }

        return data
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour ajouter un nouvel utilisateur
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function uploadfiles(url) {
        console.log(url)
        fileUpload.uploadFileToUrl(url);
    }


    $scope.getFileNode = function (couche) {
        var params_files = couche['params_files']
        var url = $scope.urlNodejs_backend + '/var/www/geosm/' + $scope.projet_qgis_server + '/gpkg/' + params_files.nom_cat.replace(/[^a-zA-Z0-9]/g, '_') + '_' + params_files.sous_thematiques + '_' + params_files.key_couche + '_' + params_files.id_cat + '.gpkg'

        window.open(url, '_blank');
        // myfactory.get_data($scope.urlNodejs_backend + '/get_source_file/' + $scope.projet_qgis_server + '/' + couche.identifiant).then(
        //     function (data) {
        //         if (data.status == 'ok') {
        //             alert(data.url)
        //         } else {
        //             toogle_information('Un probleme est survenu')
        //         }
        //         $('#spinner').hide()
        //     }
        // )
    }


    $scope.file = function (id, couche, propertie, type_data = "") {
        console.log(couche, id.indexOf('raster_modifier_cartes_pdf'))
        // $("#"+id)[0].files=[]
        var evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        var canceled = document.getElementById(id).dispatchEvent(evt);

        $("#" + id).on('change', function (e) {
            couche.generateIcons = null
            if (type_data == "logo") {
                couche.fileLogoImg = couche.file
                if (!couche.fileLogoImg) {
                    couche.fileLogoImg = $("#" + id)[0].files[0]
                }

                var objectURL = window.URL.createObjectURL($("#" + id)[0].files[0]);
                couche[propertie] = objectURL

            } else if (id.indexOf('raster_modifier_cartes_pdf') == -1 && id.indexOf('doc_modifier_cartes_pdf') == -1 && id.indexOf('doc_modifier_cartes_new_pdf') == -1 && id != 'style_importation' && id != 'couche_importation' && ($("#" + id)[0].files[0].size / 1048576) < 7.5) {

                couche.fileImg = couche.file
                if (!couche.fileImg) {
                    couche.fileImg = $("#" + id)[0].files[0]
                }

                var objectURL = window.URL.createObjectURL($("#" + id)[0].files[0]);
                couche[propertie] = objectURL

                if (couche.geom) {
                    if (couche.geom == 'Polygon') {
                        // couche.myColor = undefined
                    }
                }
            } else if (id.indexOf('doc_modifier_cartes_new_pdf') != -1 || id.indexOf('doc_modifier_cartes_pdf') != -1 || id.indexOf('raster_modifier_cartes_pdf') != -1) {

                var file = $("#" + id)[0].files[0]
                var objectURL = window.URL.createObjectURL($("#" + id)[0].files[0]);

                if (id.indexOf('raster_modifier_cartes_pdf') != -1) {
                    couche.url_raster = file.name
                    couche.fileRaster = couche.file
                    if (!couche.fileRaster) {
                        couche.fileRaster = $("#" + id)[0].files[0]
                    }
                } else {
                    couche.url = file.name
                    couche.filePdf = couche.file
                    if (!couche.filePdf) {
                        couche.filePdf = $("#" + id)[0].files[0]
                    }
                }

            } else if (id == 'style_importation') {
                var file = $("#" + id)[0].files[0]
                var objectURL = window.URL.createObjectURL($("#" + id)[0].files[0]);

                couche[propertie] = couche.file

                formData = new FormData();
                var extension = file.name.split('.')[file.name.split('.').length - 1]

                formData.append('file', couche.file);

                var request = {
                    method: 'POST',
                    url: $scope.urlNodejs_backend + '/download_style_qgs',
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    }
                };
                $('#spinner').show()
                $http(request)
                    .then(
                        function success(e) {
                            formData = new FormData();
                            console.log(e.data.status)
                            if (e.data.status == 'ok') {
                                var identifiant = couche.identifiant
                                var style_file = e.data.style_file

                                myfactory.get_data($scope.urlNodejs_backend + '/set_style_qgs/' + $scope.projet_qgis_server + '/' + style_file + '/' + identifiant).then(
                                    function (data) {
                                        if (data.status == 'ok') {
                                            toogle_information('Le fichier de style a bien été appliqué')
                                        } else {
                                            toogle_information('Un probleme est survenu, S2')
                                        }
                                        $('#spinner').hide()
                                    }
                                )

                            } else {
                                $('#spinner').hide()
                                toogle_information('Un probleme est survenu, S1')
                            }

                        },
                        function (e) {
                            $('#spinner').hide()
                            toogle_information('Verifier votre connexion et recommencer')
                        }
                    )


            } else if (id == 'couche_importation') {
                var table = couche.id_couche
                var shema = couche.shema
                var file = $("#" + id)[0].files[0]
                var objectURL = window.URL.createObjectURL($("#" + id)[0].files[0]);

                formData = new FormData();
                var extension = file.name.split('.')[file.name.split('.').length - 1]

                var size = file.size / (1024 * 1024); // in MB
                console.log(size)

                if (size > 7.5) {
                    toogle_information('Le fichier doit ètre inférieur à 7,5 MB')
                } else if ((extension.toLowerCase() == 'rar' || extension.toLowerCase() == 'zip') && size > 2) {
                    toogle_information('Le fichier compresse SHP doit ètre inférieur à 2 MB')
                } else if (extension.toLowerCase() != 'rar' && extension.toLowerCase() != 'zip' && extension.toLowerCase() != 'geojson' && extension.toLowerCase() != 'json') {
                    toogle_information(' soit un .rar, .zip pour les SHAPE ou .geojson et .json ')
                } else {

                    $('#spinner').show()
                    formData.append('path', '/../../../public/assets/admin/uploadcouche/');
                    formData.append('pathBd', 'assets/admin/uploadcouche/');
                    formData.append('image_file', couche.file);

                    formData.append('nom', space2underscore(file.name.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension));
                    var request = {
                        method: 'POST',
                        url: '/upload/file',
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        }
                    };

                    $http(request)
                        .then(
                            function success(e) {
                                formData = new FormData();

                                if (e.data.status) {

                                    $scope.donne_en_importation = {
                                        'file': file,
                                        'extension': extension,
                                        'nom': space2underscore(file.name.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
                                    }

                                    //if (extension.toLowerCase() != 'geojson' && extension.toLowerCase() != 'json') {
                                    console.log($scope.urlBackend + '/assets/admin/uploadcouche/' + $scope.donne_en_importation.nom)
                                    myfactory.get_data($scope.urlBackend + '/assets/admin/uploadcouche/' + $scope.donne_en_importation.nom).then(
                                        function (data) {
                                            if (data.features.length > 0) {

                                                $scope.data_en_importation = {
                                                    'champ': [],
                                                    'table': table,
                                                    'shema': shema,
                                                    'donne': data.features,
                                                    'couche': couche,
                                                }

                                                angular.forEach(data.features[0].properties, function (value, key) {
                                                    $scope.data_en_importation.champ.push(key)
                                                });

                                                var i = 0
                                                while (data.features[i]) {

                                                    angular.forEach(data.features[i].properties, function (value, key) {

                                                        if ($scope.data_en_importation.champ.indexOf(key) == -1) {
                                                            $scope.data_en_importation.champ.push(key)
                                                        }
                                                    });

                                                    i++

                                                }


                                                console.log($scope.data_en_importation)

                                                $('#ajout_donne_div').show()
                                            } else {
                                                toogle_information('Aucune donnees dans votre fichier')
                                            }

                                            $('#spinner').hide()

                                        },
                                        function (err) {
                                            $('#spinner').hide()
                                            toogle_information('Verifier votre connexion et recommencer')
                                        }
                                    )

                                    //} 
                                }

                            },
                            function (e) {
                                $('#spinner').hide()
                                toogle_information('Verifier votre connexion et recommencer')
                            }
                        )

                }
            } else {
                toogle_information('Votre fichier ne doit pas exceder 7,5 MO')
            }
            $scope.$apply()
            //uploadfiles($('#img_modi_profile')[0].files[0])
        })

    }

    $scope.close_div_importation = function () {
        $('#ajout_donne_div').hide()
    }

    $scope.importer_donne_dans_couche = function (donne) {

        for (var i = 0; i < donne.donne.length; i++) {

            angular.forEach(donne.champ, function (value, key) {

                if (!donne.donne[i].properties[value]) {
                    donne.donne[i].properties[value] = null
                }
            });

        }
        donne.sous_thematiques = donne.couche.sous_thematiques
        donne.key_couche = donne.couche.key_couche
        console.log(donne)
        // angular.forEach(donne.champ, function (value, key) {
        //     donne.champ[key]=value.replace(/[^\w\s]/gi, '')                                     
        // });

        $('#spinner').show()

        myfactory.post_data('/thematique/importationDeDonnes/', donne).then(
            function (data) {
                console.log(data)
                if (requete_reussi(data)) {
                    var pp = ''
                    for (var j = 0; j < data.data.length; j++) {
                        data.data[j]

                        var description = {
                            'description': '',
                            'table': donne.table,
                            'shema': donne.shema,
                            'id': data.data[j].id,
                            'key_couche': donne.couche.key_couche
                        }

                        angular.forEach(data.data[j], function (value, key) {
                            if (key != 'id') {
                                description['description'] += ',' + value
                            }
                        });


                    }

                    if (donne.couche.sous_thematiques) {

                        for (var i = 0; i < $scope.thematiques[donne.couche.rang_thema].sous_thematiques[donne.couche.rang_sous].couches.length; i++) {

                            if ($scope.thematiques[donne.couche.rang_thema].sous_thematiques[donne.couche.rang_sous].couches[i].key_couche == donne.couche.key_couche) {
                                $scope.thematiques[donne.couche.rang_thema].sous_thematiques[donne.couche.rang_sous].couches[i].number = donne.donne.length
                            }
                        }

                    } else {
                        for (var i = 0; i < $scope.thematiques[donne.couche.rang_thema].couches.length; i++) {

                            if ($scope.thematiques[donne.couche.rang_thema].couches[i].key_couche == donne.couche.key_couche) {
                                $scope.thematiques[donne.couche.rang_thema].couches[i].number = donne.donne.length
                            }

                        }
                    }

                    $('#spinner').hide()
                    toogle_information(donne.donne.length + " donnes ont bien ete ajoute ")


                    if (!donne.couche.colonnes) {
                        donne.couche.colonnes = []
                    }
                    for (var i = 0; i < donne.champ.length; i++) {

                        donne.couche.colonnes.push({
                            "nom": donne.champ[i],
                            "champ": donne.champ[i]
                        })
                    }

                    $('#ajout_donne_div').hide()


                }
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////Importation des donnnes dans une couche/////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.function_add_user = function (nom_img) {
        $('#spinner').show()
        if (nom_img) {
            $scope.nouveau_utilisateur.nom_img_modife = 'assets/admin/images/' + space2underscore($scope.nouveau_utilisateur.nom) + '.' + $scope.nouveau_utilisateur.file.name.split('.')[$scope.nouveau_utilisateur.file.name.split('.').length - 1]
        }
        myfactory.post_data('/user/add/', JSON.stringify($scope.nouveau_utilisateur)).then(
            function (data) {
                console.log(data)
                if (requete_reussi(data)) {

                    toogle_information("L'utilisateur : " + $scope.nouveau_utilisateur.nom + " a �t� bien ajout�")
                    $scope.nouveau_utilisateur.id = $scope.utilisateurs.length
                    $scope.nouveau_utilisateur.img = $scope.nouveau_utilisateur.img_temp
                    $scope.nouveau_utilisateur.statut = $scope.nouveau_utilisateur.statut
                    $scope.nouveau_utilisateur.id_utilisateur = data[0]
                    $scope.nouveau_utilisateur.droits_thematique = []
                    $scope.nouveau_utilisateur.droits_sous_thematique = []
                    $scope.nouveau_utilisateur.les_id_droits_sous = []
                    $scope.nouveau_utilisateur.les_id_droits_thematiques = []

                    $scope.utilisateurs.push($scope.nouveau_utilisateur)

                    $scope.page_principale_utilisateur = !$scope.page_principale_utilisateur

                    $scope.nouveau_utilisateur = {
                        'img_temp': 'assets/admin/images/user.svg',
                        'nom_img_modife': 'assets/admin/images/user.svg'
                    }


                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }
    $scope.add_user = function () {

        $('#spinner').show()
        if ($scope.nouveau_utilisateur.fileImg) {

            formData.append('nom', space2underscore($scope.nouveau_utilisateur.nom).replace(/[^\w\s]/gi, '').toLowerCase() + '.' + $scope.nouveau_utilisateur.fileImg.name.split('.')[$scope.nouveau_utilisateur.fileImg.name.split('.').length - 1])
            formData.append('image_file', $scope.nouveau_utilisateur.fileImg)
            formData.append('path', '/../../../public/assets/admin/images/')
            formData.append('pathBd', 'assets/admin/images/')
            formData.append('largeur', 180);
            formData.append('lomguer', 180);
            var request = {
                method: 'POST',
                url: '/upload/file',
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(request)
                .then(
                    function (e) {

                        formData = new FormData()

                        if (e.data.status) {
                            $scope.function_add_user(e.data.nom_img)
                        }

                    },
                    function (e) {
                        $('#spinner').hide()
                        toogle_information('Verifier votre connexion')
                    }
                );
        } else {
            $scope.function_add_user()
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //modification d'un utilisateur
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.modification_utilisateur = {}

    $scope.vider_les_variables = function () {
        $scope.modification_utilisateur = {}
    }
    $scope.function_modifier_utilisateur = function (utilisateur, extension) {
        $('#spinner').show()
        if (extension) {
            $scope.modification_utilisateur.nom_img_modife = 'assets/admin/' + space2underscore($scope.modification_utilisateur.nom).replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension
        }

        myfactory.post_data('/user/updateUser/', JSON.stringify($scope.modification_utilisateur)).then(
            function (data) {
                if (requete_reussi(data)) {

                    toogle_information("L'utilisateur " + $scope.utilisateurs[utilisateur.id].nom + " a �t� bien modifi�")
                    $scope.modification_utilisateur.img = $scope.modification_utilisateur.img_temp
                    $scope.utilisateurs[utilisateur.id] = $scope.modification_utilisateur

                    $scope.page_principale_utilisateur = !$scope.page_principale_utilisateur

                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }

    $scope.modifier_utilisateur = function (utilisateur) {

        var property = []

        for (properties in utilisateur) {

            if ($scope.modification_utilisateur[properties] == undefined && properties != 'droit' && properties != 'img_temp') {
                $scope.modification_utilisateur[properties] = utilisateur[properties]
            } else {
                property.push(properties)
            }

        }



        if (property.length == 0 && !$scope.modification_utilisateur.fileImg) {
            $scope.page_principale_utilisateur = !$scope.page_principale_utilisateur
            toogle_information("Aucune modification a ete effectue")
        } else if ($scope.modification_utilisateur.fileImg) {
            $('#spinner').show()

            var extension = $scope.modification_utilisateur.fileImg.name.split('.')[$scope.modification_utilisateur.fileImg.name.split('.').length - 1]
            formData.append('path', '/../../../public/assets/admin/');
            formData.append('pathBd', 'assets/admin/');
            formData.append('image_file', $scope.modification_utilisateur.fileImg);
            formData.append('nom', space2underscore($scope.modification_utilisateur.nom).replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension);
            formData.append('largeur', 180);
            formData.append('lomguer', 180);

            var request = {
                method: 'POST',
                url: '/upload/file',
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(request)
                .then(function success(e) {

                        if (e.data.status) {
                            $scope.function_modifier_utilisateur(utilisateur, extension)
                        }

                    },
                    function (e) {
                        $('#spinner').hide()
                        toogle_information('Verifier votre connexion')
                    }
                )
        } else if (property.length > 0 && !$scope.modification_utilisateur.fileImg) {
            $('#spinner').show()
            $scope.function_modifier_utilisateur(utilisateur)
        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //supprimer d'un utilisateur
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.supprimerUtilisateur = function (utilisateur) {
        $('#spinner').show()

        data = {
            'id_utilisateur': utilisateur.id_utilisateur
        }
        myfactory.post_data('/user/deleteUser/', data).then(
            function (data) {
                if (requete_reussi(data)) {
                    $scope.toogle_confirmation('false')
                    $scope.utilisateurs.splice(utilisateur.id, 1)

                    toogle_information("L'utilisateur " + utilisateur.nom + " a �t� bien supprim�")
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour recuperer les thematiques
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////    

    $scope.updateCatalogue = function (type) {
        if (type == 'thematiques') {
            $('#spinner').show()
            myfactory.get_data('/api/v1/RestFull/catalogAdmin/').then(
                function (data) {
                    console.log(data)
                    if (data == 'ok') {
                        toogle_information("Le catalogue a été bien mis à jour")
                        myfactory.get_data($scope.urlNodejs_backend + "/generateLegend/" + $scope.projet_qgis_server).then(function (resp) {

                        })
                    } else {
                        toogle_information(" un problème est survenu")
                    }

                    $('#spinner').hide()
                },
                function (err) {
                    alert(err)
                    toogle_information(" un problème est survenu")
                    $('#spinner').hide()
                }
            )
        }
    }

    function getThematiques() {

        myfactory.get_data('/geoportail/getCatalogue/').then(
            // myfactory.get_data('/api/v1/RestFull/catalogAdmin/').then(
            function (data) {


                for (var i = 0; i < data.length; i++) {
                    if (data[i].sous_thematiques != false) {
                        for (var j = 0; j < data[i].sous_thematiques.length; j++) {
                            var les_id_couches = []
                            for (var k = 0; k < data[i].sous_thematiques[j].couches.length; k++) {
                                les_id_couches.push(data[i].sous_thematiques[j].couches[k].key_couche)
                            }
                            data[i].sous_thematiques[j].les_id_couches = les_id_couches
                        }
                    }
                }


                $scope.theme_non_catalogue = data

                if ($scope.catalogueDonne) {
                    $scope.thematiques = cataloguerColones($scope.theme_non_catalogue)
                }

            },
            function (err) {
                toogle_information("un problème est survenu")
                alert(err)
            }
        )
    }

    getThematiques()

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour sauvergarder les ajouts de droits
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.ajouter_droit = function (utilisateur, les_id_droits_sous) {

        $('#spinner').show()

        $scope.ids_droit = {
            'thematiques_couches': [],
            'sous_thematique_couches': [],
            'id_utilisateur': utilisateur.id_utilisateur,
        }

        $scope.droits = {
            'droits_sous_thematique': [],
            'droits_thematique': [],
            'id_utilisateur': utilisateur.id_utilisateur,
        }

        for (var i = 0; i < $scope.thematiques.length; i++) {
            if ($scope.thematiques[i].sous_thematiques != false) {

                for (var j = 0; j < $scope.thematiques[i].sous_thematiques.length; j++) {
                    for (var k = 0; k < $scope.thematiques[i].sous_thematiques[j].couches.length; k++) {
                        if ($scope.thematiques[i].sous_thematiques[j].couches[k].check == true) {
                            if ($scope.tri_droit(les_id_droits_sous, $scope.thematiques[i].sous_thematiques[j].couches[k].key_couche)) {

                                $scope.ids_droit.sous_thematique_couches.push($scope.thematiques[i].sous_thematiques[j].couches[k].key_couche)

                                $scope.droits.droits_sous_thematique.push($scope.thematiques[i].sous_thematiques[j].couches[k])

                                $scope.thematiques[i].sous_thematiques[j].couches[k].check = false
                            }
                        }
                    }
                }

            } else if ($scope.thematiques[i].sous_thematiques == false) {

                for (var j = 0; j < $scope.thematiques[i].couches.length; j++) {
                    if ($scope.thematiques[i].couches[j].check == true) {
                        $scope.ids_droit.thematiques_couches.push($scope.thematiques[i].couches[j].key_couche)

                        $scope.droits.droits_thematique.push($scope.thematiques[i].couches[j])

                        $scope.thematiques[i].couches[j].check = false
                    }
                }

            }
        }

        if ($scope.ids_droit.sous_thematique_couches.length == 0 && $scope.ids_droit.thematiques_couches.length == 0) {
            toogle_information("Vous n'avez coche aucune couche")
        } else {

            myfactory.post_data('/user/addRolesUser/', JSON.stringify($scope.ids_droit)).then(
                function (data) {


                    if (requete_reussi(data)) {

                        console.log($scope.utilisateurs[utilisateur.id].les_id_droits_sous)

                        $scope.utilisateurs[utilisateur.id].les_id_droits_sous = $scope.utilisateurs[utilisateur.id].les_id_droits_sous.concat($scope.ids_droit.sous_thematique_couches);


                        $scope.utilisateurs[utilisateur.id].les_id_droits_thematiques = $scope.utilisateurs[utilisateur.id].les_id_droits_thematiques.concat($scope.ids_droit.thematiques_couches);


                        $scope.utilisateurs[utilisateur.id].droits_sous_thematique = $scope.utilisateurs[utilisateur.id].droits_sous_thematique.concat($scope.droits.droits_sous_thematique);

                        $scope.utilisateurs[utilisateur.id].droits_thematique = $scope.utilisateurs[utilisateur.id].droits_thematique.concat($scope.droits.droits_thematique);



                        toogle_information($scope.ids_droit.sous_thematique_couches.length + $scope.ids_droit.thematiques_couches.length + " droit(s) ont �t� ajout�(s) � " + utilisateur.nom)

                        $scope.page_principale_utilisateur = !$scope.page_principale_utilisateur


                    }

                    $('#spinner').hide()

                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )
        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour supprimer de droits
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.supprimerdroit = function (droit) {
        $('#spinner').show()
        var donne = {
            'id_utilisateur': droit.id_utilisateur,
            'id_sous_thematique_couches': [],
            'id_thematique_couches': []
        }

        if (droit.type == 'sous_thematique_couches') {
            donne.id_sous_thematique_couches.push(droit.key_couche)

        } else if (droit.type == 'thematique_couches') {
            donne.id_thematique_couches.push(droit.key_couche)
        }

        myfactory.post_data('/user/deleteRole/', JSON.stringify(donne)).then(
            function (data) {

                if (requete_reussi(data)) {

                    if (droit.type == 'sous_thematique_couches') {

                        $scope.utilisateurs[droit.index].les_id_droits_sous.splice($scope.utilisateurs[droit.index].les_id_droits_sous.indexOf(droit.key_couche), 1)

                        for (var i = 0; i < $scope.utilisateurs[droit.index].droits_sous_thematique.length; i++) {
                            if ($scope.utilisateurs[droit.index].droits_sous_thematique[i].key_couche == droit.key_couche) {
                                $scope.utilisateurs[droit.index].droits_sous_thematique.splice(i, 1)
                            }
                        }

                    } else if (droit.type == 'thematique_couches') {

                        console.log($scope.utilisateurs[droit.index].les_id_droits_thematiques, droit.key_couche)

                        $scope.utilisateurs[droit.index].les_id_droits_thematiques.splice($scope.utilisateurs[droit.index].les_id_droits_thematiques.indexOf(droit.key_couche), 1)
                        console.log($scope.utilisateurs[droit.index].les_id_droits_thematiques, droit.key_couche)
                        for (var i = 0; i < $scope.utilisateurs[droit.index].droits_thematique.length; i++) {
                            if ($scope.utilisateurs[droit.index].droits_thematique[i].key_couche == droit.key_couche) {
                                $scope.utilisateurs[droit.index].droits_thematique.splice(i, 1)
                            }
                        }
                    }
                    $scope.toogle_confirmation('false')
                    toogle_information("Le droit sur " + droit.nom + " a ete bien supprime")
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour trier les droits d'un utilisateur avant de le proposer si il peut encore ajouter 
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.tri_droit = function (droits, id) {

        if (droits.indexOf(id) === -1) {
            return true
        } else if (droits.indexOf(id) > -1) {
            return false
        }

    }

    $scope.tri_droit_sous_thematiques = function (ids_couches, droits) {

        var res = ids_couches.filter(function (n) {
            return !this.has(n)
        }, new Set(droits));

        if (res.length == 0) {
            return false
        } else {
            return true
        }
    }



    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour ajouter une thematique
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.page_principale_thematique = true

    $scope.sous_ou_pas_ajouter_thematique = function (nouvelle_thematique, nouvelles_sous_thematique) {

        if (nouvelle_thematique.sousthematique != 'true' && nouvelle_thematique.sousthematique != 'false') {
            toogle_information("Créer des Sous-thématiques ? ")
        } else {

            nouvelle_thematique.fileImg = nouvelle_thematique.file
            if (nouvelle_thematique.sousthematique == 'true') {
                if (nouvelle_thematique['sous_thematiques']) {
                    nouvelle_thematique['sous_thematiques'] = []
                }
                $scope.ajouter_thematique(nouvelle_thematique)
            } else {
                nouvelles_sous_thematique.nom = nouvelle_thematique.nom
                nouvelles_sous_thematique.fileImg = nouvelle_thematique.fileImg
                nouvelles_sous_thematique.sousthematique = nouvelle_thematique.sousthematique
                if (nouvelles_sous_thematique['couches']) {
                    nouvelles_sous_thematique['couches'] = []
                }
                $scope.ajouter_thematique(nouvelles_sous_thematique, nouvelle_thematique)
            }
        }
    }

    $scope.function_ajouter_thematique = function (nouvelle_thematique) {
        $('#spinner').show()

        myfactory.post_data('/thematique/addThematique/', JSON.stringify(nouvelle_thematique)).then(
            function (data) {
                if (requete_reussi(data)) {

                    nouvelle_thematique.id_thematique = data.id_thematique
                    nouvelle_thematique.img = nouvelle_thematique.img_temp

                    if (nouvelle_thematique.sousthematique === 'true') {
                        nouvelle_thematique.id = $scope.thematiques.length
                        nouvelle_thematique.shema = data.shema

                        for (var i = 0; i < nouvelle_thematique.sous_thematiques.length; i++) {
                            nouvelle_thematique.sous_thematiques[i].id = i
                            nouvelle_thematique.sous_thematiques[i].active = false
                            nouvelle_thematique.sous_thematiques[i].key = data.sous_thematiques[i].key
                            nouvelle_thematique.sous_thematiques[i].les_id_couches = []

                            // for (var j = 0; j < nouvelle_thematique.sous_thematiques[i].couches.length; j++) {
                            //     nouvelle_thematique.sous_thematiques[i].les_id_couches.push(data.sous_thematiques[i].couches[j].key_couche)
                            //     nouvelle_thematique.sous_thematiques[i].couches[j].check = false
                            //     nouvelle_thematique.sous_thematiques[i].couches[j].img = nouvelle_thematique.sous_thematiques[i].couches[j].img_temp
                            //     nouvelle_thematique.sous_thematiques[i].couches[j].id = j
                            //     nouvelle_thematique.sous_thematiques[i].couches[j].id_couche = data.sous_thematiques[i].couches[j].id_couche
                            //     nouvelle_thematique.sous_thematiques[i].couches[j].key_couche = data.sous_thematiques[i].couches[j].key_couche
                            // }

                        }

                        console.log(nouvelle_thematique)
                        $scope.thematiques.push(nouvelle_thematique)

                        $scope.page_principale_thematique = !$scope.page_principale_thematique
                    } else {
                        nouvelle_thematique.id = $scope.thematiques.length
                        nouvelle_thematique.shema = data.shema
                        nouvelle_thematique.sous_thematiques = false

                        // for (var i = 0; i < nouvelle_thematique.couches.length; i++) {
                        //     nouvelle_thematique.couches[i].id_couche = data.couches[i].id_couche
                        //     nouvelle_thematique.couches[i].key_couche = data.couches[i].key_couche
                        //     nouvelle_thematique.couches[i].id = i
                        //     nouvelle_thematique.couches[i].img = nouvelle_thematique.couches[i].img_temp
                        //     nouvelle_thematique.couches[i].check = false
                        // }

                        $scope.thematiques.push(nouvelle_thematique)
                        $scope.page_principale_thematique = !$scope.page_principale_thematique

                        console.log(nouvelle_thematique)
                    }

                    toogle_information("La thematique " + nouvelle_thematique.nom + " a ete bien ajout�")
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }



    $scope.ajouter_thematique = function (nouvelle_thematique, second_data) {

        var no_icone = []
        console.log(nouvelle_thematique)
        if (second_data) {
            nouvelle_thematique.file = second_data.file
            nouvelle_thematique.img_temp = second_data.img_temp
        }

        // if (nouvelle_thematique.sousthematique == 'true') {
        //     for (var i = 0; i < nouvelle_thematique.sous_thematiques.length; i++) {
        //         for (var j = 0; j < nouvelle_thematique.sous_thematiques[i].couches.length; j++) {

        //             if (nouvelle_thematique.sous_thematiques[i].couches[j].geom == 'point' && !nouvelle_thematique.sous_thematiques[i].couches[j].file) {
        //                 no_icone.push(i)
        //             } else if (nouvelle_thematique.sous_thematiques[i].couches[j].geom == 'LineString' && !nouvelle_thematique.sous_thematiques[i].couches[j].color) {
        //                 no_icone.push(i)
        //             } else if (nouvelle_thematique.sous_thematiques[i].couches[j].geom == 'Polygon' && !nouvelle_thematique.sous_thematiques[i].couches[j].color && !nouvelle_thematique.sous_thematiques[i].couches[j].file) {
        //                 no_icone.push(i)
        //             }
        //         }
        //     }
        // } else {
        //     for (var j = 0; j < nouvelle_thematique.couches.length; j++) {

        //         if (nouvelle_thematique.couches[j].geom == 'point' && !nouvelle_thematique.couches[j].file) {
        //             no_icone.push(j)
        //         } else if (nouvelle_thematique.couches[j].geom == 'LineString' && !nouvelle_thematique.couches[j].color) {
        //             no_icone.push(j)
        //         } else if (nouvelle_thematique.couches[j].geom == 'Polygon' && !nouvelle_thematique.couches[j].color && !nouvelle_thematique.couches[j].file) {
        //             no_icone.push(j)
        //         }
        //     }
        // }


        if (!nouvelle_thematique.fileImg) {
            toogle_information("veillez mettre une icone pour la thematique")
        } else {

            var nombre = 0
            var compte = []

            var extension = nouvelle_thematique.fileImg.name.split('.')[nouvelle_thematique.fileImg.name.split('.').length - 1]

            formData.append('image_file', nouvelle_thematique.fileImg);
            formData.append('nom', space2underscore(nouvelle_thematique.nom).replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension);
            formData.append('path', '/../../../public/assets/images/thematiques');
            formData.append('pathBd', 'assets/images/thematiques/');
            formData.append('largeur', 150);
            formData.append('lomguer', 150);
            $('#spinner').show()
            var request = {
                method: 'POST',
                url: '/upload/file',
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(request)
                .then(
                    function success(e) {
                        formData = new FormData();

                        var extension = nouvelle_thematique.fileImg.name.split('.')[nouvelle_thematique.fileImg.name.split('.').length - 1]
                        nouvelle_thematique.nom_img_modife = 'assets/images/thematiques/' + space2underscore(nouvelle_thematique.nom).replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension
                        if (e.data.status) {
                            var nombre_images = []
                            // if (nouvelle_thematique.sousthematique == 'true') {

                            //     for (var i = 0; i < nouvelle_thematique.sous_thematiques.length; i++) {
                            //         for (var j = 0; j < nouvelle_thematique.sous_thematiques[i].couches.length; j++) {

                            //             nouvelle_thematique.sous_thematiques[i].couches[j].nom_img_modife = null
                            //             nouvelle_thematique.sous_thematiques[i].couches[j].remplir_couleur = null
                            //             nouvelle_thematique.sous_thematiques[i].couches[j].opacity = null
                            //             nouvelle_thematique.sous_thematiques[i].couches[j].contour_couleur = null
                            //             nouvelle_thematique.sous_thematiques[i].couches[j].nom = nouvelle_thematique.sous_thematiques[i].couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase()
                            //             if (nouvelle_thematique.sous_thematiques[i].couches[j].geom == 'point') {

                            //                 var extension = nouvelle_thematique.sous_thematiques[i].couches[j].fileImg.name.split('.')[nouvelle_thematique.sous_thematiques[i].couches[j].fileImg.name.split('.').length - 1]
                            //                 formData.append('image_file' + i + '' + j, nouvelle_thematique.sous_thematiques[i].couches[j].fileImg);

                            //                 nouvelle_thematique.sous_thematiques[i].couches[j].nom_img_modife = 'assets/admin/' + space2underscore(nouvelle_thematique.sous_thematiques[i].couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
                            //                 nouvelle_thematique.sous_thematiques[i].couches[j].fileImg.nom = space2underscore(nouvelle_thematique.sous_thematiques[i].couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase() + "." + extension)

                            //                 nouvelle_thematique.sous_thematiques[i].couches[j].fileImg.appendId = 'image_file' + i + '' + j
                            //                 nombre_images.push(nouvelle_thematique.sous_thematiques[i].couches[j].fileImg)

                            //             } else if (nouvelle_thematique.sous_thematiques[i].couches[j].geom == 'Polygon' && nouvelle_thematique.sous_thematiques[i].couches[j].fileImg) {

                            //                 var extension = nouvelle_thematique.sous_thematiques[i].couches[j].fileImg.name.split('.')[nouvelle_thematique.sous_thematiques[i].couches[j].fileImg.name.split('.').length - 1]
                            //                 formData.append('image_file' + i + '' + j, nouvelle_thematique.sous_thematiques[i].couches[j].fileImg);

                            //                 nouvelle_thematique.sous_thematiques[i].couches[j].nom_img_modife = 'assets/admin/' + space2underscore(nouvelle_thematique.sous_thematiques[i].couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
                            //                 nouvelle_thematique.sous_thematiques[i].couches[j].fileImg.nom = space2underscore(nouvelle_thematique.sous_thematiques[i].couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase() + "." + extension)
                            //                 nouvelle_thematique.sous_thematiques[i].couches[j].fileImg.appendId = 'image_file' + i + '' + j
                            //                 nombre_images.push(nouvelle_thematique.sous_thematiques[i].couches[j].fileImg)

                            //             } else if (nouvelle_thematique.sous_thematiques[i].couches[j].geom == 'Polygon' && nouvelle_thematique.sous_thematiques[i].couches[j].color) {

                            //                 if (nouvelle_thematique.sous_thematiques[i].couches[j].color.indexOf("hsla") != -1) {
                            //                     a = nouvelle_thematique.sous_thematiques[i].couches[j].color.replace('hsla(', '').replace(')', '').split(',');
                            //                     alpha = a[3]
                            //                 } else {
                            //                     a = nouvelle_thematique.sous_thematiques[i].couches[j].color.replace('hsl(', '').replace(')', '').split(',');
                            //                     alpha = 1
                            //                 }

                            //                 rgb = HSVtoRGB(+a[0].replace('%', '') / 360, +a[1].replace('%', '') / 100, +a[2].replace('%', '') / 100)

                            //                 nouvelle_thematique.sous_thematiques[i].couches[j].remplir_couleur = rgb
                            //                 nouvelle_thematique.sous_thematiques[i].couches[j].opacity = alpha
                            //                 nouvelle_thematique.sous_thematiques[i].couches[j].img_temp = null

                            //             } else if (nouvelle_thematique.sous_thematiques[i].couches[j].geom == 'LineString') {

                            //                 if (nouvelle_thematique.sous_thematiques[i].couches[j].color.indexOf("hsla") != -1) {
                            //                     a = nouvelle_thematique.sous_thematiques[i].couches[j].color.replace('hsla(', '').replace(')', '').split(',');
                            //                     alpha = a[3]
                            //                 } else {
                            //                     a = nouvelle_thematique.sous_thematiques[i].couches[j].color.replace('hsl(', '').replace(')', '').split(',');
                            //                     alpha = 1
                            //                 }

                            //                 rgb = HSVtoRGB(+a[0].replace('%', '') / 360, +a[1].replace('%', '') / 100, +a[2].replace('%', '') / 100)

                            //                 nouvelle_thematique.sous_thematiques[i].couches[j].contour_couleur = rgb
                            //                 nouvelle_thematique.sous_thematiques[i].couches[j].opacity = alpha
                            //                 nouvelle_thematique.sous_thematiques[i].couches[j].img_temp = null

                            //             }


                            //         }
                            //     }

                            // } else {

                            //     for (var j = 0; j < nouvelle_thematique.couches.length; j++) {

                            //         nouvelle_thematique.couches[j].nom_img_modife = null
                            //         nouvelle_thematique.couches[j].remplir_couleur = null
                            //         nouvelle_thematique.couches[j].opacity = null
                            //         nouvelle_thematique.couches[j].contour_couleur = null
                            //         nouvelle_thematique.couches[j].nom = nouvelle_thematique.couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase()
                            //         if (nouvelle_thematique.couches[j].geom == 'point') {

                            //             var extension = nouvelle_thematique.couches[j].fileImg.name.split('.')[nouvelle_thematique.couches[j].fileImg.name.split('.').length - 1]
                            //             formData.append('image_file' + j, nouvelle_thematique.couches[j].fileImg);

                            //             nouvelle_thematique.couches[j].nom_img_modife = 'assets/admin/' + space2underscore(nouvelle_thematique.couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
                            //             nouvelle_thematique.couches[j].fileImg.nom = space2underscore(nouvelle_thematique.couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase() + "." + extension)
                            //             nouvelle_thematique.couches[j].fileImg.appendId = 'image_file' + j
                            //             nombre_images.push(nouvelle_thematique.couches[j].fileImg)

                            //         } else if (nouvelle_thematique.couches[j].geom == 'Polygon' && nouvelle_thematique.couches[j].fileImg) {

                            //             var extension = nouvelle_thematique.couches[j].fileImg.name.split('.')[nouvelle_thematique.couches[j].fileImg.name.split('.').length - 1]
                            //             formData.append('image_file' + j, nouvelle_thematique.couches[j].fileImg);

                            //             nouvelle_thematique.couches[j].nom_img_modife = 'assets/admin/' + space2underscore(nouvelle_thematique.couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
                            //             nouvelle_thematique.couches[j].fileImg.nom = space2underscore(nouvelle_thematique.couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase() + "." + extension)

                            //             nouvelle_thematique.couches[j].fileImg.appendId = 'image_file' + j
                            //             nombre_images.push(nouvelle_thematique.couches[j].fileImg)

                            //         } else if (nouvelle_thematique.couches[j].geom == 'Polygon' && nouvelle_thematique.couches[j].color) {

                            //             if (nouvelle_thematique.couches[j].color.indexOf("hsla") != -1) {
                            //                 a = nouvelle_thematique.couches[j].color.replace('hsla(', '').replace(')', '').split(',');
                            //                 alpha = a[3]
                            //             } else {
                            //                 a = nouvelle_thematique.couches[j].color.replace('hsl(', '').replace(')', '').split(',');
                            //                 alpha = 1
                            //             }

                            //             rgb = HSVtoRGB(+a[0].replace('%', '') / 360, +a[1].replace('%', '') / 100, +a[2].replace('%', '') / 100)

                            //             nouvelle_thematique.couches[j].remplir_couleur = rgb
                            //             nouvelle_thematique.couches[j].opacity = alpha
                            //             nouvelle_thematique.couches[j].img_temp = null

                            //         } else if (nouvelle_thematique.couches[j].geom == 'LineString') {

                            //             if (nouvelle_thematique.couches[j].color.indexOf("hsla") != -1) {
                            //                 a = nouvelle_thematique.couches[j].color.replace('hsla(', '').replace(')', '').split(',');
                            //                 alpha = a[3]
                            //             } else {
                            //                 a = nouvelle_thematique.couches[j].color.replace('hsl(', '').replace(')', '').split(',');
                            //                 alpha = 1
                            //             }

                            //             rgb = HSVtoRGB(+a[0].replace('%', '') / 360, +a[1].replace('%', '') / 100, +a[2].replace('%', '') / 100)

                            //             nouvelle_thematique.couches[j].contour_couleur = rgb
                            //             nouvelle_thematique.couches[j].opacity = alpha
                            //             nouvelle_thematique.couches[j].img_temp = null

                            //         }

                            //     }

                            // }

                            $scope.function_ajouter_thematique(nouvelle_thematique)

                            // formData.append('nombre_images', JSON.stringify(nombre_images));
                            // formData.append('path', '/../../../public/assets/admin/');
                            // formData.append('pathBd', 'assets/admin/');
                            // formData.append('largeur', 160);
                            // formData.append('lomguer', 160);
                            // var request = {
                            //     method: 'POST',
                            //     url: '/uploads/file',
                            //     data: formData,
                            //     headers: {
                            //         'Content-Type': undefined
                            //     }
                            // };

                            // $http(request)
                            //     .then(
                            //         function success(e) {
                            //             formData = new FormData();
                            //             // $scope.filess = []
                            //             //$('#img_modi_profile')[0].files
                            //             if (e.data.status) {
                            //                 $scope.function_ajouter_thematique(nouvelle_thematique)
                            //             }
                            //             $('#spinner').hide()
                            //         },
                            //         function (e) {
                            //             $('#spinner').hide()
                            //             toogle_information('Verifier votre connexion')
                            //         }
                            //     )
                        }
                        $('#spinner').hide()
                    },
                    function (e) {
                        $('#spinner').hide()
                        toogle_information('Verifier votre connexion')
                    }
                )
        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour modifier une thematiques
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////    
    //$scope.thematique_en_modif={};
    var function_modifier_thematique = function (thematique, extension) {

        if ($scope.thematiques[thematique.id].nom != thematique.nom || extension || $scope.thematiques[thematique.id].color != thematique.color) {



            if (extension) {
                thematique.nom_img_modife = 'assets/images/thematiques/' + space2underscore(thematique.nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
            }
            $('#spinner').show()
            myfactory.post_data('/thematique/updateThematique/', JSON.stringify(thematique)).then(
                function (data) {
                    if (requete_reussi(data)) {
                        toogle_information("La thematique " + thematique.nom + " a ete bien modifi�")
                        $scope.thematiques[thematique.id].nom = thematique.nom
                        $scope.thematiques[thematique.id].img = thematique.img_temp
                        $scope.thematiques[thematique.id].color = thematique.color
                        $scope.page_principale_thematique = !$scope.page_principale_thematique

                    }
                    $('#spinner').hide()
                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )

        } else {
            toogle_information("aucune modification n'a �t� enregistr�")
        }
    }
    $scope.modification_thematique = function (thematique) {

        if (thematique.fileImg) {
            var extension = thematique.fileImg.name.split('.')[thematique.fileImg.name.split('.').length - 1]
            formData.append('path', '/../../../public/assets/images/thematiques');
            formData.append('pathBd', 'assets/images/thematiques/');
            formData.append('image_file', thematique.fileImg);
            formData.append('nom', space2underscore(thematique.nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension));
            var request = {
                method: 'POST',
                url: '/upload/file',
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            };
            $('#spinner').show()
            $http(request)
                .then(
                    function success(e) {
                        formData = new FormData();

                        if (e.data.status) {
                            function_modifier_thematique(thematique, extension)
                        }
                        $('#spinner').hide()
                    },
                    function (e) {
                        $('#spinner').hide()
                        toogle_information('Verifier votre connexion')
                    }
                )
        } else {
            function_modifier_thematique(thematique)
        }

    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour supprimer une thematiques
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.supprimer_thematique = function (thematique) {

        var sous_thematiques = []
        var donne = {
            'shema': thematique.shema,
            'id_thematique': thematique.id_thematique,
            'couche_ids': []
        }

        if (thematique.sous_thematiques) {
            for (var i = 0; i < thematique.sous_thematiques.length; i++) {
                sous_thematiques.push(thematique.sous_thematiques[i].key)
                for (var j = 0; j < thematique.sous_thematiques[i].les_id_couches.length; j++) {
                    donne.couche_ids.push(thematique.sous_thematiques[i].les_id_couches[j])
                }
            }
            donne.sous_thematiques = sous_thematiques
        } else {
            for (var i = 0; i < thematique.couches.length; i++) {
                donne.couche_ids.push(thematique.couches[i].key_couche)
            }
            donne.sous_thematiques = false
        }

        $('#spinner').show()

        myfactory.post_data('/thematique/deleteThematique/', JSON.stringify(donne)).then(
            function (data) {
                if (requete_reussi(data)) {


                    if (donne.sous_thematiques) {

                        for (var i = 0; i < $scope.utilisateurs.length; i++) {

                            var j = 0;

                            while ($scope.utilisateurs[i].droits_sous_thematique[j]) {

                                if (!$scope.tri_droit(donne.couche_ids, $scope.utilisateurs[i].droits_sous_thematique[j].key_couche)) {

                                    $scope.utilisateurs[i].droits_sous_thematique.splice(j, 1)
                                    $scope.utilisateurs[i].les_id_droits_sous.splice(j, 1)
                                    var j = 0;
                                } else {
                                    j++;
                                }

                            }

                        }


                    } else {

                        for (var i = 0; i < $scope.utilisateurs.length; i++) {

                            var j = 0;

                            while ($scope.utilisateurs[i].droits_thematique[j]) {

                                if (!$scope.tri_droit(donne.couche_ids, $scope.utilisateurs[i].droits_thematique[j].key_couche)) {

                                    $scope.utilisateurs[i].droits_thematique.splice(j, 1)
                                    $scope.utilisateurs[i].les_id_droits_thematiques.splice(j, 1)
                                    var j = 0;
                                } else {
                                    j++;
                                }

                            }

                        }

                    }

                    $scope.thematiques.splice(thematique.id, 1)
                    $scope.toogle_confirmation('false')

                    toogle_information("La thematique " + thematique.nom + " a ete bien supprim�")
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )

    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour ajouter une sous thematiques
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.mode_menu_ajout_sous_thematique = false
    $scope.mode_menu_ajout_sous_cartes = false

    $scope.nouvelle_sous_thematique = {
        "active": false,
        "onglet": false,
        "couches": [],
        "les_id_couches": []
    }

    $scope.nouvelle_sous_cartes = {
        "active": false,
        "onglet": false,
        "couches": [],
        "les_id_couches": []
    }

    $scope.ajouter_sous_thematique_toogle = function (param) {
        $scope.mode_menu_ajout_sous_thematique = param
    }

    $scope.ajouter_sous_cartes_toogle = function (param) {
        $scope.mode_menu_ajout_sous_cartes = param

    }

    $scope.ajouter_sous_thematique = function () {

        $('#spinner').show()
        myfactory.post_data('/thematique/addSousThematique/', JSON.stringify($scope.nouvelle_sous_thematique)).then(
            function (data) {
                if (requete_reussi(data)) {
                    for (var i = 0; i < $scope.thematiques.length; i++) {
                        if ($scope.thematiques[i].id_thematique == $scope.nouvelle_sous_thematique.id_thematique) {
                            $scope.nouvelle_sous_thematique.key = data.key
                            $scope.nouvelle_sous_thematique.id = $scope.thematiques[i].sous_thematiques.length
                            $scope.thematiques[i].sous_thematiques.push($scope.nouvelle_sous_thematique)
                            console.log($scope.thematiques[i].sous_thematiques)

                            toogle_information("La sous thematique " + $scope.nouvelle_sous_thematique.nom + " a ete bien ajout�e")
                            $scope.nouvelle_sous_thematique = {
                                "active": false,
                                "onglet": false,
                                "couches": [],
                                "les_id_couches": [],
                                "id_thematique": $scope.thematiques[i].id_thematique
                            }

                        }
                    }
                    $scope.mode_menu_ajout_sous_thematique = false


                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )



    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour modifier une sous thematiques
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    $scope.sousthematique_modifier = {}

    $scope.edition_sous_thematique = function (sous_thematiques, key) {
        for (var i = 0; i < sous_thematiques.length; i++) {
            if (sous_thematiques[i].key == key) {
                sous_thematiques[i].mode_edition = true
            } else {
                sous_thematiques[i].mode_edition = false
            }
        }
        // $scope.sousthematique_modifier.nom=""
    }

    $scope.modification_sous_thematique = function (sous_thematique) {

        $scope.sousthematique_modifier.key = sous_thematique.key
        $('#spinner').show()
        myfactory.post_data('/thematique/updateSousThematique/', JSON.stringify($scope.sousthematique_modifier)).then(
            function (data) {
                if (requete_reussi(data)) {

                    toogle_information("La sous thematique " + sous_thematique.nom + " a ete bien modifi�")
                    sous_thematique.mode_edition = false
                    sous_thematique.nom = $scope.sousthematique_modifier.nom
                    $scope.sousthematique_modifier = {}
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour supprimer une sous thematiques
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.change_onglet = false
    $scope.supprimer_sous_thematique = function (sous_thematique, id_thematique) {

        for (var i = 0; i < $scope.thematiques.length; i++) {
            if ($scope.thematiques[i].id_thematique == id_thematique) {
                var shema = $scope.thematiques[i].shema
            }
        }

        var donne = {
            "shema": shema,
            "couches": sous_thematique.couches,
            "key": sous_thematique.key,
        };
        $('#spinner').show()
        myfactory.post_data('/thematique/deleteSousThematique/', JSON.stringify(donne)).then(
            function (data) {
                if (requete_reussi(data)) {
                    for (var i = 0; i < $scope.thematiques.length; i++) {
                        if ($scope.thematiques[i].id_thematique == id_thematique) {
                            for (var j = 0; j < $scope.thematiques[i].sous_thematiques.length; j++) {
                                if ($scope.thematiques[i].sous_thematiques[j].key == sous_thematique.key) {
                                    for (var k = 0; k < $scope.thematiques[i].sous_thematiques[j].couches.length; k++) {
                                        console.log($scope.thematiques[i].sous_thematiques[j].couches[k].id_couche)

                                    }

                                    $scope.thematiques[i].sous_thematiques.splice(j, 1)

                                    if ($scope.thematiques[i].sous_thematiques[0]) {
                                        $scope.change_onglet = $scope.thematiques[i].sous_thematiques[0].key
                                    } else {
                                        $scope.change_onglet = undefined
                                    }

                                }
                            }
                        }
                    }

                    for (var i = 0; i < $scope.utilisateurs.length; i++) {
                        for (var k = 0; k < sous_thematique.couches.length; k++) {
                            var j = 0;

                            while ($scope.utilisateurs[i].droits_sous_thematique[j]) {

                                if (sous_thematique.couches[k].key_couche == $scope.utilisateurs[i].droits_sous_thematique[j].key_couche) {

                                    $scope.utilisateurs[i].droits_sous_thematique.splice(j, 1)
                                    $scope.utilisateurs[i].les_id_droits_sous.splice(j, 1)
                                    var j = 0;

                                } else {
                                    j++;
                                }

                            }
                        }
                    }

                    $scope.toogle_confirmation('false')
                    toogle_information("La sous thematique " + sous_thematique.nom + " a ete bien supprim�")
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }

        )



    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour ajouter une couche
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.page_principale_sous_thematique = true

    var function_ajouter_couches = function (couches) {
        $('#spinner').show()
        myfactory.post_data('/thematique/addCouche/', JSON.stringify(couches)).then(
            function (data) {
                if (requete_reussi(data)) {
                    if (couches.id_sous_thematique) {

                        for (var i = 0; i < couches.couches.length; i++) {
                            for (var j = 0; j < $scope.thematiques.length; j++) {
                                if ($scope.thematiques[j].id_thematique == couches.id_thematique) {
                                    for (var k = 0; k < $scope.thematiques[j].sous_thematiques.length; k++) {
                                        if ($scope.thematiques[j].sous_thematiques[k].key == couches.id_sous_thematique) {
                                            donne = {
                                                'remplir_couleur': couches.couches[i].remplir_couleur,
                                                'contour_couleur': couches.couches[i].contour_couleur,
                                                'opacity': couches.couches[i].opacity,
                                                'nom': couches.couches[i].nom,
                                                'img': couches.couches[i].img,
                                                'key_couche': data.key_couches[i],
                                                'id_couche': data.id_couches[i],
                                                'check': false,
                                                'geom': couches.couches[i].geom,
                                                'type_couche': couches.couches[i].type_couche,
                                                'shema': couches.couches[i].shema,
                                                'sous_thematiques': true,
                                                'id': $scope.thematiques[j].sous_thematiques[k].couches.length

                                            }

                                            if (couches.couches[i].logo_src) {
                                                donne.logo_src = couches.couches[i].logo_src
                                            }

                                            $scope.thematiques[j].sous_thematiques[k].couches.push(donne)

                                            if (!$scope.thematiques[j].sous_thematiques[k].les_id_couches) {
                                                $scope.thematiques[j].sous_thematiques[k].les_id_couches = []
                                            }
                                            $scope.thematiques[j].sous_thematiques[k].les_id_couches.push(data.key_couches[i])
                                        }
                                    }
                                }
                            }

                        }

                    } else {

                        for (var i = 0; i < couches.couches.length; i++) {
                            for (var j = 0; j < $scope.thematiques.length; j++) {
                                if ($scope.thematiques[j].id_thematique == couches.id_thematique) {
                                    donne = {
                                        'remplir_couleur': couches.couches[i].remplir_couleur,
                                        'contour_couleur': couches.couches[i].contour_couleur,
                                        'opacity': couches.couches[i].opacity,
                                        'nom': couches.couches[i].nom,
                                        'img': couches.couches[i].img,
                                        'key_couche': data.key_couches[i],
                                        'id_couche': data.id_couches[i],
                                        'check': false,
                                        'geom': couches.couches[i].geom,
                                        'type_couche': couches.couches[i].type_couche,
                                        'shema': couches.couches[i].shema,
                                        'sous_thematiques': false,
                                        'id': $scope.thematiques[j].couches.length

                                    }
                                    if (couches.couches[i].logo_src) {
                                        donne.logo_src = couches.couches[i].logo_src
                                    }
                                    $scope.thematiques[j].couches.push(donne)
                                    if ($scope.thematiques[j].les_id_couches) {
                                        $scope.thematiques[j].les_id_couches.push(data.key_couches[i])
                                    } else {
                                        $scope.thematiques[j].les_id_couches = []
                                        $scope.thematiques[j].les_id_couches.push(data.key_couches[i])
                                    }

                                }
                            }
                        }

                    }
                    $scope.page_principale_sous_thematique = !$scope.page_principale_sous_thematique
                    toogle_information(couches.couches.length + " couches ont �t� ajout� avec succ�s")
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )

    }

    $scope.ajouter_couches = function (couches) {
        console.log(couches)
        var no_icone = []


        for (var i = 0; i < couches.couches.length; i++) {
            if (!couches.couches[i].fileImg && !couches.couches[i].generateIcons) {
                no_icone.push(i)
            }
        }

        if (no_icone.length != 0) {
            toogle_information("Veillez mettre des icones ou des couleurs sur chaque couches")
        } else {

            if (couches.id_sous_thematique) {

                couches.sous_thematiques = true

            } else {

                couches.sous_thematiques = false

            }

            var nombre = 0
            var nombre_images = []
            var images_to_save_as_svg = []
            $('#spinner').show()
            for (var i = 0; i < couches.couches.length; i++) {
                couches.couches[i].nom_img_modife = null
                couches.couches[i].remplir_couleur = null
                couches.couches[i].opacity = null
                couches.couches[i].contour_couleur = null
                couches.couches[i].nom = couches.couches[i].nom

                var nom_img = space2underscore(couches.couches[i].nom.replace(/[^\w\s]/gi, '').toLowerCase())



                if (couches.couches[i].fileImg) {
                    nombre_images.push(couches.couches[i].fileImg)
                    couches.couches[i].fileImg.appendId = 'image_file' + i
                    var extension = couches.couches[i].fileImg.name.split('.')[couches.couches[i].fileImg.name.split('.').length - 1]
                    formData.append('image_file' + i, couches.couches[i].fileImg);
                    couches.couches[i].nom_img_modife = 'assets/images/icones-couches/' + nom_img + "." + extension
                    couches.couches[i].fileImg.nom = nom_img + "." + extension

                } else if (couches.couches[i].generateIcons) {
                    couches.couches[i].nom_img_modife = 'assets/images/icones-couches/' + nom_img + "." + 'svg'
                    couches.couches[i].logo_src = 'assets/images/logo-couches-modification/' + nom_img + "." + 'svg'
                    // couches.couches[i].fileImg.nom = nom_img+ "." + 'svg'
                    images_to_save_as_svg.push({
                        svg: couches.couches[i].generateIcons.circle,
                        nom: nom_img + "." + 'svg',
                        path: '/assets/images/icones-couches/'
                    })
                    images_to_save_as_svg.push({
                        svg: couches.couches[i].generateIcons.rect,
                        nom: nom_img + "." + 'svg',
                        path: '/assets/images/logo-couches-modification/'
                    })
                }


                // if (couches.couches[i].geom == 'point') {

                //     var extension = couches.couches[i].fileImg.name.split('.')[couches.couches[i].fileImg.name.split('.').length - 1]
                //     formData.append('image_file' + i, couches.couches[i].fileImg);

                //     couches.couches[i].nom_img_modife = 'assets/images/icones-couches/' + space2underscore(couches.couches[i].nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
                //     couches.couches[i].fileImg.nom = space2underscore(couches.couches[i].nom.replace(/[^\w\s]/gi, '').toLowerCase() + "." + extension)
                //     couches.couches[i].fileImg.appendId = 'image_file' + i
                //     nombre_images.push(couches.couches[i].fileImg)
                // }
                // else if (couches.couches[i].geom == 'Polygon' && couches.couches[i].fileImg) {
                //     var extension = couches.couches[i].fileImg.name.split('.')[couches.couches[i].fileImg.name.split('.').length - 1]
                //     formData.append('image_file' + i, couches.couches[i].fileImg);

                //     couches.couches[i].nom_img_modife = 'assets/images/icones-couches/' + space2underscore(couches.couches[i].nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
                //     couches.couches[i].fileImg.nom = space2underscore(couches.couches[i].nom.replace(/[^\w\s]/gi, '').toLowerCase() + "." + extension)
                //     couches.couches[i].fileImg.appendId = 'image_file' + i
                //     nombre_images.push(couches.couches[i].fileImg)


                // } else if (couches.couches[i].geom == 'Polygon' && couches.couches[i].color) {
                //     if (couches.couches[i].color.indexOf("hsla") != -1) {
                //         a = couches.couches[i].color.replace('hsla(', '').replace(')', '').split(',');
                //         alpha = a[3]
                //     } else {

                //         a = couches.couches[i].color.replace('hsl(', '').replace(')', '').split(',');
                //         alpha = 1
                //     }
                //     console.log(couches.couches[i].color)
                //     rgb = HSVtoRGB(+a[0].replace('%', '') / 360, +a[1].replace('%', '') / 100, +a[2].replace('%', '') / 100)
                //     console.log(a, rgb)
                //     couches.couches[i].remplir_couleur = rgb
                //     couches.couches[i].opacity = alpha
                //     couches.couches[i].img_temp = null

                // } else if (couches.couches[i].geom == 'LineString') {
                //     if (couches.couches[i].color.indexOf("hsla") != -1) {
                //         a = couches.couches[i].color.replace('hsla(', '').replace(')', '').split(',');
                //         alpha = a[3]
                //     } else {
                //         a = couches.couches[i].color.replace('hsl(', '').replace(')', '').split(',');
                //         alpha = 1
                //     }

                //     rgb = HSVtoRGB(+a[0].replace('%', '') / 360, +a[1].replace('%', '') / 100, +a[2].replace('%', '') / 100)

                //     couches.couches[i].contour_couleur = rgb
                //     couches.couches[i].opacity = alpha
                //     couches.couches[i].img_temp = null
                // }

            }

            if (nombre_images.length > 0) {
                formData.append('nombre_images', JSON.stringify(nombre_images));
                formData.append('path', '/../../../public/assets/images/icones-couches/');
                formData.append('pathBd', 'assets/images/icones-couches/');
                formData.append('largeur', 160);
                formData.append('lomguer', 160);
                var request = {
                    method: 'POST',
                    url: '/uploads/file',
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    }
                };

                $http(request)
                    .then(
                        function success(e) {
                            formData = new FormData();

                            if (e.data.status) {
                                function_ajouter_couches(couches)
                            }
                            $('#spinner').hide()
                        },
                        function (e) {
                            $('#spinner').hide()
                            toogle_information('Verifier votre connexion')
                        }
                    )

            } else if (images_to_save_as_svg.length > 0) {
                myfactory.post_data("whriteMultipleSvg", {
                    "data": images_to_save_as_svg
                }).then(function (e) {
                    // console.log(e)
                    if (e.status) {
                        function_ajouter_couches(couches)
                    }

                    $('#spinner').hide()
                }, function (msg) {
                    toogle_information("Verifier votre connexion")
                })
            }


        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour supprimer une couche
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.delete_couche = function (couche) {
        //console.log($scope.utilisateurs[5])

        $('#spinner').show()

        myfactory.post_data('/thematique/deleteCouche/', JSON.stringify(couche)).then(
            function (data) {
                if (requete_reussi(data)) {
                    if (couche.type_couche == 'wms' && couche.wms_type == 'osm') {
                        myfactory.get_data($scope.urlNodejs_backend + '/remove_layer_by_name/' + $scope.projet_qgis_server + '/' + couche.identifiant).then(
                            function (data) {
                                console.log(data, 'qgis_server')
                            }
                        )
                    }

                    if (couche.sous_thematiques) {
                        for (var i = 0; i < $scope.thematiques[couche.rang_thema].sous_thematiques[couche.rang_sous].couches.length; i++) {

                            if ($scope.thematiques[couche.rang_thema].sous_thematiques[couche.rang_sous].couches[i].key_couche == couche.key_couche) {
                                $scope.thematiques[couche.rang_thema].sous_thematiques[couche.rang_sous].couches.splice(i, 1)
                            }
                        }

                        for (var i = 0; i < $scope.utilisateurs.length; i++) {

                            var j = 0;

                            while ($scope.utilisateurs[i].droits_sous_thematique[j]) {

                                if (couche.key_couche == $scope.utilisateurs[i].droits_sous_thematique[j].key_couche) {

                                    $scope.utilisateurs[i].droits_sous_thematique.splice(j, 1)
                                    $scope.utilisateurs[i].les_id_droits_sous.splice(j, 1)
                                    var j = 0;

                                } else {
                                    j++;
                                }

                            }


                        }

                    } else {

                        for (var i = 0; i < $scope.thematiques[couche.rang_thema].couches.length; i++) {
                            if ($scope.thematiques[couche.rang_thema].couches[i].key_couche == couche.key_couche) {
                                $scope.thematiques[couche.rang_thema].couches.splice(i, 1)
                            }
                        }

                        for (var i = 0; i < $scope.utilisateurs.length; i++) {

                            var j = 0;

                            while ($scope.utilisateurs[i].droits_thematique[j]) {

                                if (couche.key_couche == $scope.utilisateurs[i].droits_thematique[j].key_couche) {

                                    $scope.utilisateurs[i].droits_thematique.splice(j, 1)
                                    $scope.utilisateurs[i].les_id_droits_thematiques.splice(j, 1)
                                    var j = 0;
                                } else {
                                    j++;
                                }

                            }

                        }
                    }

                    $scope.toogle_confirmation('false')
                    toogle_information("La couche " + couche.nom + " a ete bien supprim�e")
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour vider une couche
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.emptyTable = function (couche) {

        var champ = []
        for (var i = 0; i < couche.colonnes.length; i++) {
            champ.push(couche.colonnes[i].champ)
        }
        var donne = {
            'table': couche.id_couche,
            'shema': couche.shema,
            'champ': champ
        }
        console.log(donne)
        myfactory.post_data('/thematique/emptyTable/', JSON.stringify(donne)).then(
            function (data) {
                console.log(data)
                if (requete_reussi(data)) {

                }

            }
        )

    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////
    //les fonctions de modification des couches (nom,collones)
    /////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.eventApi = {
        onChange: function (api, color, $event) {

            if ($('div .color-picker-grid-inner').attr('id') == 'ajout') {
                $scope.couche_en_ajout.color = color
            } else {
                $scope.color = color
            }

        },
        onClose: function (api, color, $event) {
            $scope.color = color
            $scope.api = api
        }
    };

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function HSVtoRGB(h, s, l) {
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }


        return "rgb(" + Math.round(r * 255) + "," + Math.round(g * 255) + "," + Math.round(b * 255) + ")"

    }

    $scope.valider_color = function () {

    }
    $scope.getColor = function (couleur, opacity) {

        if (hexToRgb(couleur) == null) {
            if (opacity) {
                $scope.myColor = couleur.replace(')', ',' + opacity + ')').replace('rgb', 'rgba');
            } else {
                $scope.myColor = couleur
            }

        } else {
            color = hexToRgb(couleur)
            rgb = "rgb(" + color.r + "," + color.g + "," + color.b + ")"

            if (opacity) {
                $scope.myColor = rgb.replace(')', ',' + opacity + ')').replace('rgb', 'rgba');
            } else {
                $scope.myColor = rgb
            }
        }

        $scope.color = $scope.myColor

    }

    $scope.changeColor_addCouche = function (couche, delete_img = true) {
        if ($scope.api) {
            $scope.api.getScope().$parent.myColor = $scope.myColor
        }
        if (couche.img_temp && delete_img) {
            couche.img_temp = null
        }
        couche.myColor = 'change'
        $scope.couche_en_ajout = couche

        $('div .color-picker-grid-inner').attr('id', 'ajout')
        $('#color_picker').show()
    }

    $scope.changeColor = function (couche, delete_img = true) {
        if ($scope.api) {
            $scope.api.getScope().$parent.myColor = $scope.myColor
        }
        if (couche.img_temp && delete_img) {
            couche.img_temp = null
        }
        couche.myColor = 'change'
        $('div .color-picker-grid-inner').attr('id', '')
        $('#color_picker').show()
    }

    $scope.close_colorPicker = function () {
        $('#color_picker').hide()
        $('div .color-picker-grid-inner').attr('id', '')
    }

    function refres_style(identifiant, cb) {
        myfactory.get_data($scope.urlNodejs_backend + '/update_style_couche_qgis/' + $scope.projet_qgis_server + '/' + identifiant).then(
            function (data) {
                console.log(data)
                cb(true)
            },
            function (err) {
                cb(false)
                toogle_information('Verifier votre connexion')
            }
        )
    }
    $scope.refres_style = function (donne) {
        $('#spinner').show()
        refres_style(donne.identifiant, function (res) {
            $('#spinner').hide()
        })
    }

    var function_modifier_nom_couche = function (donne, nom_a_ete_change) {

        if (nom_a_ete_change == 'false') {
            donne.nom_modifier = donne.nom
        }


        $('#spinner').show()
        myfactory.post_data('/thematique/change_nameCouche/', JSON.stringify(donne)).then(
            function (data) {
                if (requete_reussi(data)) {
                    $('#spinner').hide()
                    // || donne.myColor == 'change'
                    if ((donne.fileImg || donne.generateIcons) && donne.geom == 'point' && donne.wms_type == "osm" && donne.identifiant) {
                        $('#spinner').show()
                        refres_style(donne.identifiant, function (res) {
                            $('#spinner').hide()
                        })

                    }

                    toogle_information("La couche " + donne.nom + " a ete bien modifi�")

                    if (nom_a_ete_change == 'true') {
                        donne.nom = donne.nom_modifier
                    }
                    donne.file = undefined
                    donne.generateIcons = undefined
                    donne.fileImg = undefined
                    donne.myColor = undefined

                    donne.img = donne.img_temp
                    donne.logo_src = donne.logo_temp

                } else {
                    donne.nom = donne.ancien_nom
                }

            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )

    }

    $scope.saveCommentCartes = function (donne) {



        $('#spinner').show()
        myfactory.post_data('/cartes/saveCommentCartes/', JSON.stringify(donne)).then(
            function (data) {
                if (requete_reussi(data)) {

                    toogle_information("La couche " + donne.nom + " a ete bien modifi�")

                    // donne.commentaire = donne.com_modifier

                }

                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }

    $scope.modifier_nom_couche = function (donne) {
        console.log(donne)

        if (donne.myColor == 'change') {
            if ($scope.color.indexOf("hsla") != -1) {
                a = $scope.color.replace('hsla(', '').replace(')', '').split(',');
                alpha = a[3]
            } else {
                a = $scope.color.replace('hsl(', '').replace(')', '').split(',');
                alpha = 1
            }

            rgb = HSVtoRGB(+a[0].replace('%', '') / 360, +a[1].replace('%', '') / 100, +a[2].replace('%', '') / 100)

            if (donne.geom == "Polygon") {
                donne.remplir_couleur = rgb
                donne.opacity = alpha
                // donne.img_temp = null
            } else if (donne.geom == "LineString") {
                donne.contour_couleur = rgb
                donne.opacity = alpha
                // donne.img_temp = null
            }
        }

        if (donne.fileImg) {
            var extension = donne.fileImg.name.split('.')[donne.fileImg.name.split('.').length - 1]
            formData.append('path', '/../../../public/assets/images/icones-couches-modification');
            formData.append('pathBd', 'assets/images/icones-couches-modification/');
            formData.append('image_file', donne.fileImg);
            formData.append('nom', space2underscore(donne.nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension));
            formData.append('largeur', 160);
            formData.append('lomguer', 160);
            var request = {
                method: 'POST',
                url: '/upload/file',
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            };
            $('#spinner').show()
            $http(request)
                .then(
                    function success(e) {
                        formData = new FormData();

                        if (e.data.status) {

                            donne.nom_img_modife = 'assets/images/icones-couches-modification/' + space2underscore(donne.nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
                            // donne.remplir_couleur = null
                            // donne.opacity = null
                            if (donne.nom_modifier == undefined || donne.nom_modifier == donne.nom) {
                                function_modifier_nom_couche(donne, 'false')
                            } else {
                                function_modifier_nom_couche(donne, 'true')
                            }

                        }
                        $('#spinner').hide()
                    },
                    function (e) {
                        $('#spinner').hide()
                        toogle_information('Verifier votre connexion')
                    }
                )
        } else if (donne.generateIcons) {
            var nom_img = space2underscore(donne.nom.replace(/[^\w\s]/gi, '').toLowerCase())

            var images_to_save_as_svg = []
            images_to_save_as_svg.push({
                svg: donne.generateIcons.circle,
                nom: nom_img + "." + 'svg',
                path: '/assets/images/icones-couches-modification/'
            })
            images_to_save_as_svg.push({
                svg: donne.generateIcons.rect,
                nom: nom_img + "." + 'svg',
                path: '/assets/images/logo-couches-modification/'
            })

            myfactory.post_data("whriteMultipleSvg", {
                "data": images_to_save_as_svg
            }).then(function (e) {
                // console.log(e)
                if (e.status) {
                    donne.nom_img_modife = 'assets/images/icones-couches-modification/' + nom_img + '.' + 'svg'
                    donne.logo_src = 'assets/images/logo-couches-modification/' + nom_img + '.' + 'svg'
                    if (donne.nom_modifier == undefined || donne.nom_modifier == donne.nom) {
                        function_modifier_nom_couche(donne, 'false')
                    } else {
                        function_modifier_nom_couche(donne, 'true')
                    }
                }

                $('#spinner').hide()
            }, function (msg) {
                toogle_information("Verifier votre connexion")
            })
        } else {

            if (donne.myColor == 'change') {
                if (donne.nom_modifier == undefined || donne.nom_modifier == donne.nom) {
                    function_modifier_nom_couche(donne, 'false')
                } else {
                    function_modifier_nom_couche(donne, 'true')
                }
            } else if (donne.nom_modifier == undefined || donne.nom_modifier == donne.nom) {
                toogle_information("Aucune modification a ete efectue")
            } else {
                function_modifier_nom_couche(donne, 'true')
            }
            // }


        }

    }


    $scope.save_logo = function (donne) {
        console.log(donne)
        if (donne.fileLogoImg) {
            var extension = donne.fileLogoImg.name.split('.')[donne.fileLogoImg.name.split('.').length - 1]
            formData.append('path', '/../../../public/assets/images/logo-couches-modification');
            formData.append('pathBd', 'assets/images/logo-couches-modification/');
            formData.append('image_file', donne.fileLogoImg);
            formData.append('nom', space2underscore(donne.nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension));
            formData.append('largeur', 160);
            formData.append('lomguer', 160);
            var request = {
                method: 'POST',
                url: '/upload/file',
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            };
            $('#spinner').show()
            $http(request)
                .then(
                    function success(e) {
                        formData = new FormData();

                        if (e.data.status) {

                            donne.nom_logo_modife = 'assets/images/logo-couches-modification/' + space2underscore(donne.nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)

                            myfactory.post_data('/thematique/save_logo/', JSON.stringify(donne)).then(
                                function (data) {
                                    if (requete_reussi(data)) {

                                        toogle_information("Le logo de la couche " + donne.nom + " a ete bien modifié")

                                        donne.fileLogoImg = undefined

                                        donne.logo_src = donne.logo_temp

                                        $('#spinner').hide()
                                    }
                                },
                                function (error) {
                                    $('#spinner').hide()
                                    toogle_information('Verifier votre connexion')
                                }
                            )

                        }
                        $('#spinner').hide()
                    },
                    function (e) {
                        $('#spinner').hide()
                        toogle_information('Verifier votre connexion')
                    }
                )
        } else {
            toogle_information("Modifiez l'icone avant de sauvegarder")
        }
    }
    $scope.nouvelles_colonnes = []
    $scope.add_colomnes = function (colonnes, shema, key_couche, table, ancienne_colomnes, nom_couche, sous_thematiques) {

        for (var i = 0; i < colonnes.length; i++) {
            if (colonnes[i].nom) {
                colonnes[i].champ = colonnes[i].nom.replace(/[^\w\s]/gi, '').toLowerCase()
                colonnes[i].aliase = colonnes[i].nom
            }

        }

        if (sous_thematiques == false) {
            sous_thematiques = "false"
        } else {
            sous_thematiques = "true"
        }

        var donne = {
            "colonnes": colonnes,
            "shema": shema,
            "table": table,
            "id_theme": key_couche,
            "sous_thematiques": sous_thematiques
        }
        $('#spinner').show()
        myfactory.post_data('/thematique/addColumns/', JSON.stringify(donne)).then(
            function (data) {
                if (requete_reussi(data)) {

                    for (var i = 0; i < colonnes.length; i++) {
                        ancienne_colomnes.push(colonnes[i])
                    }

                    $scope.nouvelles_colonnes = []

                    toogle_information(colonnes.length + " champs ont ete ajout�s avec succ�s a la couche " + nom_couche)
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }

    $scope.supprimer_colomne = function (colonne, couche) {


        $('#spinner').show()
        colonne.shema = couche.shema
        colonne.table = couche.id_couche
        colonne.id_theme = couche.key_couche

        myfactory.post_data('/thematique/deleteColumn/', JSON.stringify(colonne)).then(
            function (data) {
                if (requete_reussi(data)) {
                    for (var i = 0; i < couche.colonnes.length; i++) {
                        if (couche.colonnes[i].nom == colonne.nom) {
                            couche.colonnes.splice(i, 1)
                        }
                    }

                    $scope.toogle_confirmation('false')

                    toogle_information("Le champ " + colonne.nom + " a ete bien supprim� de la couche " + couche.nom)
                }

                $('#spinner').hide()

            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )


    }

    $scope.modifier_colomne = function (colonne) {
        colonne.sous_thematiques = "" + colonne.sous_thematiques + ""
        console.log(colonne)
        if (colonne.nom_editer == undefined || colonne.nom_editer == '') {
            toogle_information("Remplissez le champ")
        } else if (colonne.nom_editer == colonne.nom) {
            toogle_information("Saisissez un nom de champ different de l'ancien ")
        } else {

            colonne.ancien_nom = colonne.champ
            colonne.nouveau_nom = colonne.nom_editer

            $('#spinner').show()
            myfactory.post_data('/thematique/updateColumn/', JSON.stringify(colonne)).then(
                function (data) {
                    if (requete_reussi(data)) {
                        colonne.nom = colonne.nom_editer
                        colonne.edition = false;
                        colonne.nom_editer = ''

                        toogle_information("La colomne " + colonne.ancien_nom + " a ete bien modifi�e")
                    } else {
                        colonne.nom = colonne.ancien_nom
                    }

                    $('#spinner').hide()

                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )
        }
    }

    $scope.definir_champ_principal = function (colonne, couche) {
        console.log(colonne)
        if (colonne.champ_principal != 'true') {

            donne = {
                "champ": colonne.champ,
                "id_theme": couche.key_couche,
                "sous_thematiques": "" + couche.sous_thematiques + "",
            }
            console.log(donne)
            myfactory.post_data('/thematique/definir_champ_principal/', donne).then(
                function (data) {
                    if (requete_reussi(data)) {
                        for (var i = 0; i < couche.colonnes.length; i++) {
                            couche.colonnes[i].champ_principal = "false"
                        }
                        colonne.champ_principal = "true"
                        //toogle_information("La colomne " + colonne.ancien_nom + " a ete bien modifi�e")
                    }

                },
                function (err) {
                    alert(err)
                }
            )
        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour afficher les droits (utilisateurs) sur une couche
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.utilisateur_droits_sur_couche = []
    $scope.droits_sur_couche = function (key_couche, sous_thematiques) {
        $scope.utilisateur_droits_sur_couche = []
        if (sous_thematiques) {
            for (var i = 0; i < $scope.utilisateurs.length; i++) {
                for (var j = 0; j < $scope.utilisateurs[i].les_id_droits_sous.length; j++) {
                    if ($scope.utilisateurs[i].les_id_droits_sous[j] == key_couche) {
                        $scope.utilisateur_droits_sur_couche.push({
                            'nom': $scope.utilisateurs[i].nom,
                            'index': i,
                            'id_utilisateur': $scope.utilisateurs[i].id_utilisateur,
                            'key_couche': key_couche,
                            'sous_thematiques': true
                        })
                    }
                }

            }
        } else {
            for (var i = 0; i < $scope.utilisateurs.length; i++) {

                for (var k = 0; k < $scope.utilisateurs[i].les_id_droits_thematiques.length; k++) {
                    if ($scope.utilisateurs[i].les_id_droits_thematiques[k] == key_couche) {
                        $scope.utilisateur_droits_sur_couche.push({
                            'nom': $scope.utilisateurs[i].nom,
                            'index': i,
                            'id_utilisateur': $scope.utilisateurs[i].id_utilisateur,
                            'key_couche': key_couche,
                            'sous_thematiques': false
                        })
                    }
                }
            }
        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour supprimer un utilisateur des droits sur une couche
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.supprimer_utilisateur_couche = function (droit) {

        var donne = {
            'id_utilisateur': droit.id_utilisateur,
            'id_sous_thematique_couches': [],
            'id_thematique_couches': []
        }

        if (droit.sous_thematiques) {
            donne.id_sous_thematique_couches.push(droit.key_couche)

        } else {
            donne.id_thematique_couches.push(droit.key_couche)
        }
        $('#spinner').show()
        myfactory.post_data('/user/deleteRole/', JSON.stringify(donne)).then(
            function (data) {
                console.log(data)
                if (requete_reussi(data)) {

                    if (droit.sous_thematiques) {

                        $scope.utilisateurs[droit.index].les_id_droits_sous.splice($scope.utilisateurs[droit.index].les_id_droits_sous.indexOf(droit.key_couche), 1)

                        for (var i = 0; i < $scope.utilisateurs[droit.index].droits_sous_thematique.length; i++) {
                            if ($scope.utilisateurs[droit.index].droits_sous_thematique[i].key_couche == droit.key_couche) {
                                $scope.utilisateurs[droit.index].droits_sous_thematique.splice(i, 1)
                            }
                        }

                    } else {

                        console.log($scope.utilisateurs[droit.index].les_id_droits_thematiques, droit.key_couche)

                        $scope.utilisateurs[droit.index].les_id_droits_thematiques.splice($scope.utilisateurs[droit.index].les_id_droits_thematiques.indexOf(droit.key_couche), 1)
                        console.log($scope.utilisateurs[droit.index].les_id_droits_thematiques, droit.key_couche)
                        for (var i = 0; i < $scope.utilisateurs[droit.index].droits_thematique.length; i++) {
                            if ($scope.utilisateurs[droit.index].droits_thematique[i].key_couche == droit.key_couche) {
                                $scope.utilisateurs[droit.index].droits_thematique.splice(i, 1)
                            }
                        }
                    }

                    for (var i = 0; i < $scope.utilisateur_droits_sur_couche.length; i++) {
                        if ($scope.utilisateur_droits_sur_couche[i].id_utilisateur == droit.id_utilisateur) {
                            $scope.utilisateur_droits_sur_couche.splice(i, 1)
                        }
                    }
                    $scope.toogle_confirmation('false')
                    toogle_information("L'utilisateur" + $scope.utilisateurs[droit.index].nom + " a ete bien supprime des droits sur la couche")
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour recuperer le catalogue des cartes
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////    

    function getCartes() {
        $('#spinner').show()
        myfactory.get_data('/api/v1/RestFull/catalogAdminCartes/').then(
            function (data) {

                $scope.cartes = data
                // console.log($scope.cartes)
                $('#spinner').hide()
            },
            function (err) {
                alert(err)
            }
        )
    }

    getCartes()


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour ajouter un groupe de cartes
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.page_principale_cartes = true

    $scope.sous_ou_pas_ajouter_cartes = function (nouvelle_cartes, nouvelles_sous_cartes) {

        if (nouvelle_cartes.souscartes == 'true') {
            $scope.ajouter_cartes(nouvelle_cartes)

        } else {
            nouvelles_sous_cartes.nom = nouvelle_cartes.nom
            nouvelles_sous_cartes.color = nouvelle_cartes.color
            nouvelles_sous_cartes.souscartes = nouvelle_cartes.souscartes


            $scope.ajouter_cartes(nouvelles_sous_cartes)
        }

    }


    $scope.ajouter_cartes = function (groupes_cartes) {

        if (groupes_cartes.souscartes == 'true') {

            var no_icone = []

            for (var i = 0; i < groupes_cartes.sous_cartes.length; i++) {
                for (var j = 0; j < groupes_cartes.sous_cartes[i].couches.length; j++) {
                    if (!groupes_cartes.sous_cartes[i].couches[j].fileImg) {
                        no_icone.push(j)
                    }
                }

            }

            if (no_icone.length != 0) {

                toogle_information("Veillez mettre des icones pour chaque cartes")

            } else {

                if (groupes_cartes.color.indexOf("hsla") != -1) {
                    a = groupes_cartes.color.replace('hsla(', '').replace(')', '').split(',');
                    alpha = a[3]
                } else {
                    a = groupes_cartes.color.replace('hsl(', '').replace(')', '').split(',');
                    alpha = 1
                }

                rgb = HSVtoRGB(+a[0].replace('%', '') / 360, +a[1].replace('%', '') / 100, +a[2].replace('%', '') / 100)

                groupes_cartes.color = rgb

                formData = new FormData();
                var nombre_images = []

                for (var i = 0; i < groupes_cartes.sous_cartes.length; i++) {
                    for (var j = 0; j < groupes_cartes.sous_cartes[i].couches.length; j++) {

                        var extension = groupes_cartes.sous_cartes[i].couches[j].fileImg.name.split('.')[groupes_cartes.sous_cartes[i].couches[j].fileImg.name.split('.').length - 1]
                        formData.append('image_file' + i + '' + j, groupes_cartes.sous_cartes[i].couches[j].fileImg);

                        groupes_cartes.sous_cartes[i].couches[j].nom_img_modife = 'assets/admin/images/' + space2underscore(groupes_cartes.sous_cartes[i].couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
                        groupes_cartes.sous_cartes[i].couches[j].fileImg.nom = space2underscore(groupes_cartes.sous_cartes[i].couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase() + "." + extension)

                        groupes_cartes.sous_cartes[i].couches[j].fileImg.appendId = 'image_file' + i + '' + j
                        nombre_images.push(groupes_cartes.sous_cartes[i].couches[j].fileImg)

                    }

                }

                $('#spinner').show()
                formData.append('nombre_images', JSON.stringify(nombre_images));
                formData.append('path', '/../../../public/assets/admin/images/');
                formData.append('pathBd', 'assets/admin/images/');
                formData.append('largeur', 90);
                formData.append('lomguer', 250);
                var request = {
                    method: 'POST',
                    url: '/uploads/file',
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    }
                };

                $http(request)
                    .then(
                        function success(e) {
                            formData = new FormData();

                            if (e.data.status) {
                                $scope.function_ajouter_cartes(groupes_cartes)
                            }

                            $('#spinner').hide()
                        },
                        function (e) {
                            $('#spinner').hide()
                            toogle_information('Verifier votre connexion')
                        }
                    )

            }


        } else {

            var no_icone = []

            for (var i = 0; i < groupes_cartes.couches.length; i++) {
                if (!groupes_cartes.couches[i].fileImg) {
                    no_icone.push(i)
                }
            }

            if (no_icone.length != 0) {

                toogle_information("Veillez mettre des icones pour chaque cartes")

            } else {

                if (groupes_cartes.color.indexOf("hsla") != -1) {
                    a = groupes_cartes.color.replace('hsla(', '').replace(')', '').split(',');
                    alpha = a[3]
                } else {
                    a = groupes_cartes.color.replace('hsl(', '').replace(')', '').split(',');
                    alpha = 1
                }

                rgb = HSVtoRGB(+a[0].replace('%', '') / 360, +a[1].replace('%', '') / 100, +a[2].replace('%', '') / 100)

                groupes_cartes.color = rgb

                formData = new FormData();
                var nombre_images = []


                for (var j = 0; j < groupes_cartes.couches.length; j++) {

                    var extension = groupes_cartes.couches[j].fileImg.name.split('.')[groupes_cartes.couches[j].fileImg.name.split('.').length - 1]
                    formData.append('image_file' + j, groupes_cartes.couches[j].fileImg);

                    groupes_cartes.couches[j].nom_img_modife = 'assets/admin/images/' + space2underscore(groupes_cartes.couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
                    groupes_cartes.couches[j].fileImg.nom = space2underscore(groupes_cartes.couches[j].nom.replace(/[^\w\s]/gi, '').toLowerCase() + "." + extension)

                    groupes_cartes.couches[j].fileImg.appendId = 'image_file' + j
                    nombre_images.push(groupes_cartes.couches[j].fileImg)

                }

                $('#spinner').show()
                formData.append('nombre_images', JSON.stringify(nombre_images));
                formData.append('path', '/../../../public/assets/admin/images/');
                formData.append('pathBd', 'assets/admin/images/');
                formData.append('largeur', 90);
                formData.append('lomguer', 250);
                var request = {
                    method: 'POST',
                    url: '/uploads/file',
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    }
                };

                $http(request)
                    .then(
                        function success(e) {
                            formData = new FormData();

                            if (e.data.status) {
                                $scope.function_ajouter_cartes(groupes_cartes)
                            }

                            $('#spinner').hide()
                        },
                        function (e) {
                            $('#spinner').hide()
                            toogle_information('Verifier votre connexion')
                        }
                    )
            }

        }
        console.log(groupes_cartes)

    }


    $scope.function_ajouter_cartes = function (groupes_cartes) {

        $('#spinner').show()

        myfactory.post_data('/cartes/addGroupeCartes/', JSON.stringify(groupes_cartes)).then(
            function (data) {
                console.log(data)
                if (requete_reussi(data)) {
                    console.log('ok ok')

                    if (groupes_cartes.souscartes == 'true') {

                        var sous_cartes = []

                        for (var i = 0; i < data.sous_cartes.length; i++) {

                            ele = {
                                'active': false,
                                'couches': data.sous_cartes[i].couches,
                                'id': i,
                                'key': data.sous_cartes[i].key,
                                'nom': data.sous_cartes[i].nom
                            }

                            sous_cartes.push(ele)
                        }

                        var groupe = {
                            'nom': groupes_cartes.nom,
                            'color': groupes_cartes.color,
                            'id_cartes': data.id_cartes,
                            'id': $scope.cartes.length,
                            'sous_cartes': sous_cartes
                        }

                        $scope.cartes.push(groupe)
                        console.log(groupe)

                    } else {

                        var groupe = {
                            'nom': groupes_cartes.nom,
                            'color': groupes_cartes.color,
                            'id_cartes': data.id_cartes,
                            'id': $scope.cartes.length,
                            'sous_cartes': false,
                            'couches': data.couches
                        }
                        console.log(groupe)

                        $scope.cartes.push(groupe)
                    }

                    $scope.page_principale_cartes = !$scope.page_principale_cartes

                    toogle_information("Le groupe  " + groupes_cartes.nom + " a ete bien ajout�")
                }

                $('#spinner').hide()
            },
            function (err) {

                $('#spinner').hide()
                toogle_information('Verifier votre connexion')

            }

        )

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour modifier un groupe de cartes
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    var function_modifier_carte = function (cartes_en_modif, extension) {

        if ($scope.cartes[cartes_en_modif.id].color != cartes_en_modif.color || extension || $scope.cartes[cartes_en_modif.id].nom != cartes_en_modif.nom) {

            $('#spinner').show()

            if (extension) {
                cartes_en_modif.nom_img_modife = 'assets/images/cartes/' + space2underscore(cartes_en_modif.nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
            }


            myfactory.post_data('/cartes/updateGroupeCartes/', JSON.stringify(cartes_en_modif)).then(
                function (data) {
                    if (requete_reussi(data)) {

                        toogle_information("Le groupe de cartes " + cartes_en_modif.nom + " a ete bien modifi�")

                        $scope.cartes[cartes_en_modif.id].nom = cartes_en_modif.nom
                        $scope.cartes[cartes_en_modif.id].color = cartes_en_modif.color
                        $scope.cartes[cartes_en_modif.id].img = cartes_en_modif.img_temp

                        $scope.page_principale_cartes = !$scope.page_principale_cartes

                    }
                    $('#spinner').hide()
                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )

        } else {
            toogle_information("aucune modification n'a �t� enregistr�")
        }
    }
    $scope.modification_cartes = function (cartes_en_modif) {

        if (cartes_en_modif.fileImg) {
            var extension = cartes_en_modif.fileImg.name.split('.')[cartes_en_modif.fileImg.name.split('.').length - 1]
            formData.append('path', '/../../../public/assets/images/cartes');
            formData.append('pathBd', 'assets/images/cartes/');
            formData.append('image_file', cartes_en_modif.fileImg);
            formData.append('nom', space2underscore(cartes_en_modif.nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension));
            var request = {
                method: 'POST',
                url: '/upload/file',
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            };
            $('#spinner').show()
            $http(request)
                .then(
                    function success(e) {
                        formData = new FormData();

                        if (e.data.status) {
                            function_modifier_carte(cartes_en_modif, extension)
                        }
                        $('#spinner').hide()
                    },
                    function (e) {
                        $('#spinner').hide()
                        toogle_information('Verifier votre connexion')
                    }
                )
        } else {
            function_modifier_carte(cartes_en_modif)
        }


    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour supprimer un groupe de cartes
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.supprimer_cartes = function (groupes_cartes) {

        $('#spinner').show()

        if (groupes_cartes.sous_cartes) {
            var id_sous_cartes = []
            for (var i = 0; i < groupes_cartes.sous_cartes.length; i++) {
                id_sous_cartes.push(groupes_cartes.sous_cartes[i].key)
            }

            groupes_cartes.id_sous_cartes = id_sous_cartes
        }


        myfactory.post_data('/cartes/deleteCartes/', JSON.stringify(groupes_cartes)).then(
            function (data) {
                if (requete_reussi(data)) {


                    $scope.cartes.splice(groupes_cartes.id, 1)
                    $scope.toogle_confirmation('false')

                    toogle_information("Le groupe de carte " + groupes_cartes.nom + " a ete bien supprim�")
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour modifier une sous thematiques
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    $scope.souscartes_modifier = {}

    $scope.edition_sous_cartes = function (sous_cartes, key) {
        for (var i = 0; i < sous_cartes.length; i++) {
            if (sous_cartes[i].key == key) {
                sous_cartes[i].mode_edition = true
            } else {
                sous_cartes[i].mode_edition = false
            }
        }

    }

    $scope.modification_sous_cartes = function (sous_cartes) {

        $scope.souscartes_modifier.key = sous_cartes.key
        myfactory.post_data('/cartes/updateSousCartes/', JSON.stringify($scope.souscartes_modifier)).then(
            function (data) {
                if (requete_reussi(data)) {

                    toogle_information("Le sous groupe " + sous_cartes.nom + " a ete bien modifi�")
                    sous_cartes.mode_edition = false
                    sous_cartes.nom = $scope.souscartes_modifier.nom
                    $scope.souscartes_modifier = {}
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )

    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour supprimer une sous cartes
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.change_onglet = false
    $scope.supprimer_sous_cartes = function (sous_cartes, id_cartes) {

        var donne = {
            "couches": sous_cartes.couches,
            "key": sous_cartes.key,
        };

        $('#spinner').show()
        myfactory.post_data('/cartes/deleteSousCartes/', JSON.stringify(donne)).then(
            function (data) {
                if (requete_reussi(data)) {

                    for (var i = 0; i < $scope.cartes.length; i++) {
                        if ($scope.cartes[i].id_cartes == id_cartes) {
                            for (var j = 0; j < $scope.cartes[i].sous_cartes.length; j++) {
                                if ($scope.cartes[i].sous_cartes[j].key == sous_cartes.key) {

                                    $scope.cartes[i].sous_cartes.splice(j, 1)

                                    if ($scope.cartes[i].sous_cartes[0]) {
                                        $scope.change_onglet = $scope.cartes[i].sous_cartes[0].key
                                    } else {
                                        $scope.change_onglet = undefined
                                    }

                                }
                            }
                        }
                    }

                    $scope.toogle_confirmation('false')
                    toogle_information("Le sous groupe " + sous_cartes.nom + " a ete bien supprim�")
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }

        )

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour ajouter des couches cartes
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.ajouter_couches_cartes = function (couches) {


        var no_icone = []

        for (var i = 0; i < couches.couches.length; i++) {
            if (!couches.couches[i].fileImg) {
                no_icone.push(i)
            }
        }

        if (no_icone.length != 0) {

            toogle_information("Veillez mettre des icones pour chaque cartes")

        } else {

            formData = new FormData();
            var nombre_images = []

            for (var i = 0; i < couches.couches.length; i++) {
                var extension = couches.couches[i].fileImg.name.split('.')[couches.couches[i].fileImg.name.split('.').length - 1]
                formData.append('image_file' + i, couches.couches[i].fileImg);

                couches.couches[i].nom_img_modife = 'assets/admin/images/' + space2underscore(couches.couches[i].nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
                couches.couches[i].fileImg.nom = space2underscore(couches.couches[i].nom.replace(/[^\w\s]/gi, '').toLowerCase() + "." + extension)

                couches.couches[i].fileImg.appendId = 'image_file' + i
                nombre_images.push(couches.couches[i].fileImg)
                var type_carte = couches.couches[i].type
            }

            $('#spinner').show()
            formData.append('nombre_images', JSON.stringify(nombre_images));
            formData.append('path', '/../../../public/assets/admin/images/');
            formData.append('pathBd', 'assets/admin/images/');
            if (type_carte == "pdf") {
                formData.append('largeur', 44);
                formData.append('lomguer', 32);
            } else {
                formData.append('largeur', 90);
                formData.append('lomguer', 250);
            }

            var request = {
                method: 'POST',
                url: '/uploads/file',
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(request)
                .then(
                    function success(e) {
                        formData = new FormData();

                        if (e.data.status) {
                            $scope.function_ajouter_couches_cartes(couches)
                        }

                        $('#spinner').hide()
                    },
                    function (e) {
                        $('#spinner').hide()
                        toogle_information('Verifier votre connexion')
                    }
                )


        }

    }


    $scope.function_ajouter_couches_cartes = function (couches) {

        if (couches.id_sous_cartes) {
            couches.sous_cartes = true
        } else {
            couches.sous_cartes = false
        }

        console.log(couches)

        $('#spinner').show()
        myfactory.post_data('/cartes/addCoucheCartes/', JSON.stringify(couches)).then(
            function (data) {
                if (requete_reussi(data)) {
                    if (couches.id_sous_cartes) {

                        for (var i = 0; i < couches.couches.length; i++) {
                            for (var j = 0; j < $scope.cartes.length; j++) {
                                if ($scope.cartes[j].id_cartes == couches.id_cartes) {
                                    for (var k = 0; k < $scope.cartes[j].sous_cartes.length; k++) {
                                        if ($scope.cartes[j].sous_cartes[k].key == couches.id_sous_cartes) {
                                            donne = {
                                                'nom': couches.couches[i].nom,
                                                'image_src': couches.couches[i].img,
                                                'key_couche': data.key_couches[i],
                                                'check': false,
                                                'type': couches.couches[i].type,
                                                'sous_cartes': true,
                                                'id': $scope.cartes[j].sous_cartes[k].couches.length
                                            }

                                            $scope.cartes[j].sous_cartes[k].couches.push(donne)

                                        }
                                    }
                                }
                            }

                        }

                    } else {

                        for (var i = 0; i < couches.couches.length; i++) {
                            for (var j = 0; j < $scope.cartes.length; j++) {
                                if ($scope.cartes[j].id_cartes == couches.id_cartes) {

                                    donne = {
                                        'nom': couches.couches[i].nom,
                                        'image_src': couches.couches[i].img,
                                        'key_couche': data.key_couches[i],
                                        'check': false,
                                        'type': couches.couches[i].type,
                                        'sous_cartes': false,
                                        'id': $scope.cartes[j].couches.length
                                    }

                                    $scope.cartes[j].couches.push(donne)

                                }
                            }
                        }

                    }
                    $scope.page_principale_sous_cartes = !$scope.page_principale_sous_cartes
                    toogle_information(couches.couches.length + " couches ont �t� ajout� avec succ�s")
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour ajouter des sous groupes de cartes
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.ajouter_sous_cartes = function () {

        $('#spinner').show()
        console.log($scope.nouvelle_sous_cartes)
        myfactory.post_data('/cartes/addSousGroupeCartes/', JSON.stringify($scope.nouvelle_sous_cartes)).then(
            function (data) {
                if (requete_reussi(data)) {
                    for (var i = 0; i < $scope.cartes.length; i++) {
                        if ($scope.cartes[i].id_cartes == $scope.nouvelle_sous_cartes.id_cartes) {
                            $scope.nouvelle_sous_cartes.key = data.key
                            $scope.nouvelle_sous_cartes.id = $scope.cartes[i].sous_cartes.length
                            $scope.cartes[i].sous_cartes.push($scope.nouvelle_sous_cartes)


                            toogle_information("Le sous groupe de cartes " + $scope.nouvelle_sous_cartes.nom + " a ete bien ajout�e")

                            $scope.nouvelle_sous_cartes = {
                                "active": false,
                                "onglet": false,
                                "couches": []
                            }

                        }
                    }

                    $scope.mode_menu_ajout_sous_cartes = false


                }

                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour supprimer une cartes
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.delete_couche_cartes = function (couche) {
        console.log(couche)
        $('#spinner').show()

        myfactory.post_data('/cartes/deleteCoucheCartes/', JSON.stringify(couche)).then(
            function (data) {
                if (requete_reussi(data)) {


                    if (couche.sous_cartes) {
                        for (var i = 0; i < $scope.cartes[couche.rang_thema].sous_cartes[couche.rang_sous].couches.length; i++) {

                            if ($scope.cartes[couche.rang_thema].sous_cartes[couche.rang_sous].couches[i].key_couche == couche.key_couche) {
                                $scope.cartes[couche.rang_thema].sous_cartes[couche.rang_sous].couches.splice(i, 1)
                            }
                        }

                    } else {

                        for (var i = 0; i < $scope.cartes[couche.rang_thema].couches.length; i++) {
                            if ($scope.cartes[couche.rang_thema].couches[i].key_couche == couche.key_couche) {
                                $scope.cartes[couche.rang_thema].couches.splice(i, 1)
                            }
                        }

                    }

                    $scope.toogle_confirmation('false')
                    toogle_information("La cartes " + couche.nom + " a ete bien supprim�e")
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )

    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour modifier le nom ou l'image d'une carte
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    $scope.modifier_nom_couche_cartes = function (donne) {
        console.log(donne)

        if (donne.fileImg) {
            var extension = donne.fileImg.name.split('.')[donne.fileImg.name.split('.').length - 1]
            formData.append('path', '/../../../public/assets/images/icones-couches-modification');
            formData.append('pathBd', 'assets/images/icones-couches-modification/');
            formData.append('image_file', donne.fileImg);
            formData.append('nom', space2underscore(donne.nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension));

            if (donne.type == 'pdf') {
                formData.append('largeur', 44);
                formData.append('lomguer', 32);
            } else {
                formData.append('largeur', 90);
                formData.append('lomguer', 250);
            }

            var request = {
                method: 'POST',
                url: '/upload/file',
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            };
            $('#spinner').show()
            $http(request)
                .then(
                    function success(e) {
                        formData = new FormData();

                        if (e.data.status) {

                            donne.nom_img_modife = 'assets/images/icones-couches-modification/' + space2underscore(donne.nom.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)

                            if (donne.nom_modifier == undefined || donne.nom_modifier == donne.nom) {
                                function_modifier_nom_couche_cartes(donne, 'false')
                            } else {
                                function_modifier_nom_couche_cartes(donne, 'true')
                            }

                        }
                        $('#spinner').hide()
                    },
                    function (e) {
                        $('#spinner').hide()
                        toogle_information('Verifier votre connexion')
                    }
                )
        } else {

            if (donne.nom_modifier == undefined || donne.nom_modifier == donne.nom) {
                toogle_information("Aucune modification a ete efectue")
            } else {
                function_modifier_nom_couche_cartes(donne, 'true')
            }
        }
    }


    function_modifier_nom_couche_cartes = function (donne, nom_a_ete_change) {

        if (nom_a_ete_change == 'false') {
            donne.nom_modifier = donne.nom
        }

        $('#spinner').show()
        myfactory.post_data('/cartes/change_nameCoucheCartes/', JSON.stringify(donne)).then(
            function (data) {
                if (requete_reussi(data)) {

                    toogle_information("La cartes " + donne.nom + " a ete bien modifi�")

                    if (nom_a_ete_change == 'true') {
                        donne.nom = donne.nom_modifier
                    }
                    donne.file = undefined

                    donne.image_src = donne.img_temp

                } else {
                    donne.nom = donne.ancien_nom
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour modifier les proprietes d'une carte
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.zooms = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
    $scope.sous_cartes_couche_modifier = {
        'active': false
    }

    $scope.save_properties_cartes = function (carte) { //sous_cartes,key_couche,type


        $scope.sous_cartes_couche_modifier.sous_cartes = carte.sous_cartes
        $scope.sous_cartes_couche_modifier.key_couche = carte.key_couche
        $scope.sous_cartes_couche_modifier.type = carte.type

        angular.forEach(carte, function (value, item) {

            if ($scope.sous_cartes_couche_modifier[item] == undefined) {
                $scope.sous_cartes_couche_modifier[item] = carte[item]
            }

        })


        $('#spinner').show()

        myfactory.post_data('/cartes/editCoucheCartes/', JSON.stringify($scope.sous_cartes_couche_modifier)).then(
            function (data) {

                if (requete_reussi(data)) {

                    carte.url = $scope.sous_cartes_couche_modifier.url
                    carte.identifiant = $scope.sous_cartes_couche_modifier.identifiant
                    carte.bbox = $scope.sous_cartes_couche_modifier.bbox
                    carte.projection = $scope.sous_cartes_couche_modifier.projection
                    carte.zmax = $scope.sous_cartes_couche_modifier.zmax
                    carte.zmin = $scope.sous_cartes_couche_modifier.zmin

                    $scope.sous_cartes_couche_modifier = {
                        'active': false
                    }

                    toogle_information("La carte " + carte.nom + " a ete bien modifi�")

                }

                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )

    }

    $scope.displayTestMap = function (couche) {

        if (couche.status == true && couche.type_couche == 'requete') {
            return true
        } else if (couche.type_couche == 'wms' || couche.type == 'wms') {
            if (couche.url && couche.identifiant) {
                return true
            }
        } else if (couche.type == 'xyz') {
            if (couche.url) {
                return true
            }
        } else if (couche.type == 'pdf') {
            if (couche.geom) {
                return true
            }
        } else if (couche.type == 'api') {
            if (couche.url) {
                return true
            }
        } else if (couche.type_couche == 'couche') {
            if (couche.number > 0) {
                return true
            }
        } else {
            return false
        }
    }

    $scope.displayTestCartes = function (carte) {
        if (carte.type == 'wms') {
            if ((carte.url || carte.url_tile) && carte.identifiant) {
                return true
            } else {
                return false
            }
        } else if (carte.type == 'xyz') {
            if (carte.url || carte.url_tile) {
                return true
            }
        } else if (carte.type == 'pdf') {
            return false
        }
    }

    $scope.testCarte = function (data, type) {

        if (!data.nom) {
            data.nom = data.name
        }
        console.log(data)

        $('#getCoordPoint').hide()

        if (type == 'getCoordPoint') {
            $('#getCoordPoint').show()
            $('#getCoordPoint').data('key_couche', data.key_couche)
            $('#getCoordPoint').data('sous_cartes', data.sous_cartes)
            $('#test_cartes').show()
            $('#test_cartes').css('z-index', '999999999')
            $('#test_cartes').css('opacity', '1')
        }



        $scope.map.getLayers().forEach(function (layer) {
            if (layer.get('name') == 'osm') {
                layer.setVisible(true)
            } else {
                layer.setVisible(false)
            }

        })

        if (data.bbox) {
            bbox = data.bbox.split(',')

            var Amin = ol.proj.transform([parseFloat(bbox[0]), parseFloat(bbox[1])], 'EPSG:4326', 'EPSG:3857')
            var Amax = ol.proj.transform([parseFloat(bbox[2]), parseFloat(bbox[3])], 'EPSG:4326', 'EPSG:3857')

            var extend3857 = [Amin[0], Amin[1], Amax[0], Amax[1]]

            $scope.map.getView().fit(extend3857, $scope.map.getSize());

        } else if ($scope.bbox_projet.length != 0) {
            view.fit($scope.bbox_projet, $scope.map.getSize())
        }

        if (data.zmin) {
            console.log(data.zmin)
            $scope.map.getView().setZoom(data.zmin)
        }


        if (data.type == 'xyz') {

            var url = data.url
            if (type == 'sousCartePdf') {
                url = data.url_tile
            }
            var tiles = new ol.layer.Tile({
                source: new ol.source.XYZ({

                    url: url,
                    tileLoadFunction: function (imageTile, src) {
                        imageTile.getImage().src = src;
                    },
                    crossOrigin: "anonymous"
                })
            })

            tiles.set('name', space2underscore(data.nom))
            $scope.map.addLayer(tiles);

            $('#test_cartes').show()
            $('#test_cartes').css('z-index', '999999999')
            $('#test_cartes').css('opacity', '1')


        } else if (data.type_couche == 'wms' || data.type == 'wms') {
            var url = data.url.replace(/ /g, "")
            if (type == 'sousCartePdf') {
                url = data.url_tile.replace(/ /g, "")
            }

            if (data.service_wms == null || data.service_wms == true) {
                var wms = new ol.source.TileWMS({
                    url: url,
                    params: {
                        'LAYERS': data.identifiant,
                        'TILED': true
                    },
                    serverType: 'mapserver',
                    crossOrigin: 'anonymous'
                });
                var tiles = new ol.layer.Tile({
                    source: wms,
                    visible: true
                })
            } else {
                var vectorSource = new ol.source.Vector({
                    url: function (extent) {
                        bbox = $scope.map.getView().calculateExtent($scope.map.getSize())

                        var Amin = ol.proj.transform([bbox[0], bbox[1]], 'EPSG:3857', 'EPSG:4326')
                        var Amax = ol.proj.transform([bbox[2], bbox[3]], 'EPSG:3857', 'EPSG:4326')

                        var extend3857 = [Amin[0], Amin[1], Amax[0], Amax[1]]

                        var url_wfs = url + "&SERVICE=WFS&VERSION=1.1.0&REQUEST=GETFEATURE&typeName=" + data.identifiant + "&outputFormat=GeoJSON&bbox=" + extend3857.join(',')
                        //console.log('url_wfs',extent)
                        return url_wfs
                    },
                    strategy: ol.loadingstrategy.bbox,
                    format: new ol.format.GeoJSON({
                        dataProjection: 'EPSG:4326',
                    }),
                });

                var tiles = new ol.layer.Vector({
                    source: vectorSource,
                    style: function (feature) {
                        if (data.geom == 'point') {
                            return new ol.style.Style({
                                image: new ol.style.Icon({
                                    scale: 0.15,
                                    src: data.img_temp
                                })
                            })
                        } else {
                            return new ol.style.Style({
                                stroke: new ol.style.Stroke({
                                    color: '#434343',
                                    width: 4
                                }),
                                fill: new ol.style.Fill({
                                    color: [0, 0, 0, 0.3]
                                }),
                                //text: createTextStylePolygon(feature, map.getView().getResolution())

                            })
                        }
                    }

                });
            }

            tiles.set('name', space2underscore(data.nom))
            $scope.map.addLayer(tiles);

            $('#test_cartes').show()
            $('#test_cartes').css('z-index', '999999999')
            $('#test_cartes').css('opacity', '1')

        } else if (data.type == 'pdf' && data.geom) {

            var coord = data.geom.split(',')
            var point = [parseFloat(coord[0]), parseFloat(coord[1])]

            var newMarker = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform(point, 'EPSG:4326', 'EPSG:3857')),
            });

            var markerSource = new ol.source.Vector({
                features: [newMarker]
            });

            var LayTheCopy = new ol.layer.Vector({
                source: markerSource,
                style: function (feature) {

                    style = new ol.style.Style({
                        image: new ol.style.Icon({
                            // scale: 0.22,
                            src: data.img_temp
                        })
                    });

                    return style;
                },
                visible: true
            });

            LayTheCopy.set('name', space2underscore(data.nom))
            $scope.map.addLayer(LayTheCopy);

            var extent = markerSource.getExtent();

            $scope.map.getView().fit(extent, $scope.map.getSize(), {
                maxZoom: 12
            });
            $('#test_cartes').show()
            $('#test_cartes').css('z-index', '999999999')
            $('#test_cartes').css('opacity', '1')


        } else if (data.type_couche == 'requete' && data.status == true) {


            console.log(data)
            $('#spinner').show()

            /* myfactory.post_data('/thematique/genrateJsonFileByCat/',JSON.stringify({'id_cat':data.cles_vals_osm[0].id_cat})).then(
                             function (res) {
                                console.log(res)
                             },function (err) {
                                 
                             }
             )*/
            console.log(data)
            myfactory.get_data('/upload/json/' + data.file_json).then(
                function (donne) {
                    console.log(donne)
                    $scope.gestionCarto(data, donne)


                    $('#spinner').hide()
                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )

        } else if (data.type_couche == 'api') {

            $('#spinner').show()
            myfactory.get_data(data.url).then(
                function (donne) {
                    console.log(donne)
                    $scope.gestionCarto(data, donne)


                    $('#spinner').hide()
                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )

        } else if (data.type_couche == 'couche') {
            $('#spinner').show()
            myfactory.get_data("/api/v1/RestFull/DataJsonApi/" + data.shema + "/" + data.id_couche + "").then(
                function (donne) {
                    console.log(donne)
                    $scope.gestionCarto(data, donne)

                    $('#spinner').hide()
                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )
        }

        $('#textZoom').text($scope.map.getView().getZoom())

    }



    $scope.gestionCarto = function (couche, data) {

        var type_geometry = couche.geom

        if (type_geometry == "point") {
            console.log(couche)

            var k = 0
            var features = []

            for (var index = 0; index < data.length; index++) {

                if (couche.type_couche == 'couche' || couche.type_couche == 'api') {

                    for (var i = 0; i < data[index].length; i++) {
                        if (data[index][i]['index'] == 'geometry') {
                            var geometry = JSON.parse(data[index][i]['val']);
                        }
                    }

                } else if (couche.type_couche == 'requete') {
                    var geometry = JSON.parse(data[index].geometry);
                }


                if (geometry.coordinates.length == 1) {
                    var coord = ol.proj.transform(geometry.coordinates[0], 'EPSG:4326', 'EPSG:3857')
                } else {
                    var coord = ol.proj.transform(geometry.coordinates, 'EPSG:4326', 'EPSG:3857')
                }

                var newMarker = new ol.Feature({
                    geometry: new ol.geom.Point(coord),
                });

                features[k] = newMarker;
                k++
            }

            var markerSource = new ol.source.Vector({
                features: features
            });

            var clusterSource = new ol.source.Cluster({
                distance: 80,
                source: markerSource
            });

            var styleCache = {};
            var LayThe = new ol.layer.Vector({
                source: clusterSource,
                style: function (feature) {
                    var size = feature.get('features').length;
                    if (size != 1) {
                        var style = styleCache[size];
                        if (!style) {
                            style = new ol.style.Style({

                                image: new ol.style.Circle({
                                    radius: 10,
                                    stroke: new ol.style.Stroke({
                                        color: '#fff',
                                        width: 2
                                    }),
                                    fill: new ol.style.Fill({
                                        color: '#1CAC77'
                                    })
                                }),
                                text: new ol.style.Text({
                                    text: size.toString(),
                                    fill: new ol.style.Fill({
                                        color: '#fff'

                                    }),
                                    font: '10px sans-serif'
                                })
                            });
                            styleCache[size] = style;
                        }

                    } else {
                        var style = new ol.style.Style({
                            image: new ol.style.Icon({
                                scale: 0.2,
                                // src: 'assets/images/icones-couches/' + couche.id_couche + '.png'
                                src: couche.img_temp
                            })
                        });
                    }

                    return style;
                },
                visible: true
            });

            var styleCacheCopy = {};
            var LayTheCopy = new ol.layer.Vector({
                source: clusterSource,
                style: function (feature) {
                    var size = feature.get('features').length;
                    var style = styleCacheCopy[size];
                    if (!style) {
                        style = new ol.style.Style({


                            image: new ol.style.Icon({
                                scale: 0.2,
                                src: couche.img_temp
                            })
                        });
                        styleCacheCopy[size] = style;
                    }

                    return style;
                },
                visible: true
            });



            $scope.map.addLayer(LayTheCopy);
            var extent = markerSource.getExtent();

            LayTheCopy.set('name', space2underscore(couche.nom));

            LayThe.set('name', space2underscore(couche.nom));

            $scope.map.addLayer(LayThe);
            var extent = markerSource.getExtent();
            $scope.map.getView().fit(extent, $scope.map.getSize(), {
                maxZoom: 17
            });

        } else if (type_geometry == "Polygon") {

            if (couche.img_temp) {
                var cnv = document.createElement('canvas');
                var ctx = cnv.getContext('2d');
                var img = new Image();
                img.src = couche.img_temp;
                var style;
                img.onload = function () {

                    var markerSource = new ol.source.Vector();

                    $.each(data, (index, val) => {

                        if (couche.type_couche == 'couche' || couche.type_couche == 'api') {

                            for (var i = 0; i < data[index].length; i++) {
                                if (data[index][i]['index'] == 'geometry') {
                                    var geometry = JSON.parse(data[index][i]['val']);
                                }
                            }

                        } else if (couche.type_couche == 'requete') {
                            var geometry = JSON.parse(data[index].geometry);
                        }

                        if (geometry.coordinates.length == 1) {
                            if (geometry.coordinates[0].length == 1) {
                                var coord = geometry.coordinates[0][0]
                            } else {
                                var coord = geometry.coordinates[0]
                            }

                        } else {
                            var coord = geometry.coordinates[0][0]
                        }

                        var a = convertepolygon(coord)

                        var newMarker = new ol.Feature({
                            geometry: new ol.geom.Polygon([a]),
                            data: {
                                'img_temp': ctx.createPattern(img, 'repeat')
                            },
                        });

                        markerSource.addFeature(newMarker);

                    });

                    var LayThe = new ol.layer.Vector({
                        source: markerSource,
                        visible: true,
                        style: stylePolygon

                    });

                    if (couche.opacity) {
                        LayThe.setOpacity(couche.opacity)
                    }


                    $scope.map.addLayer(LayThe);
                    LayThe.set('name', space2underscore(couche.nom));


                    var extent = markerSource.getExtent();
                    $scope.map.getView().fit(extent, $scope.map.getSize(), {
                        maxZoom: 17
                    });


                }
            } else {

                var markerSource = new ol.source.Vector();

                $.each(data, (index, val) => {

                    if (couche.type_couche == 'couche' || couche.type_couche == 'api') {

                        for (var i = 0; i < data[index].length; i++) {
                            if (data[index][i]['index'] == 'geometry') {
                                var geometry = JSON.parse(data[index][i]['val']);
                            }
                        }

                    } else if (couche.type_couche == 'requete') {
                        var geometry = JSON.parse(data[index].geometry);
                    }

                    if (geometry.coordinates.length == 1) {
                        if (geometry.coordinates[0].length == 1) {
                            var coord = geometry.coordinates[0][0]
                        } else {
                            var coord = geometry.coordinates[0]
                        }
                    } else {
                        var coord = geometry.coordinates[0][0]
                    }

                    var a = convertepolygon(coord)
                    var newMarker = new ol.Feature({
                        geometry: new ol.geom.Polygon([a]),
                        data: {
                            'remplir_couleur': couche.remplir_couleur
                        }
                    });


                    markerSource.addFeature(newMarker);
                });

                var LayThe = new ol.layer.Vector({
                    source: markerSource,
                    visible: true,
                    style: stylePolygon

                });

                if (couche.opacity) {
                    LayThe.setOpacity(couche.opacity)
                }


                $scope.map.addLayer(LayThe);
                LayThe.set('name', space2underscore(couche.nom));

                var extent = markerSource.getExtent();


            }

        } else if (type_geometry == "LineString") {

            var markerSource = new ol.source.Vector();

            $.each(data, (index, val) => {

                if (couche.type_couche == 'couche' || couche.type_couche == 'api') {

                    for (var i = 0; i < data[index].length; i++) {
                        if (data[index][i]['index'] == 'geometry') {
                            var geometry = JSON.parse(data[index][i]['val']);
                        }
                    }

                } else if (couche.type_couche == 'requete') {
                    var geometry = JSON.parse(data[index].geometry);
                }

                if (geometry.coordinates.length == 1) {
                    var coord = geometry.coordinates[0]
                } else {
                    var coord = geometry.coordinates
                }

                var newMarker = new ol.Feature({
                    geometry: new ol.geom.LineString(converteline(coord)),
                    data: {
                        'contour_couleur': couche.contour_couleur
                    }
                });

                markerSource.addFeature(newMarker);


            });

            /*$.each(data, function (index, val) {

                var geom = JSON.parse(data[index].geometry);

                if (geom.coordinates.length == 1) {
                    var coord = geom.coordinates[0]
                } else {
                    var coord = geom.coordinates
                }

                data[index].contour_couleur = couche.contour_couleur

                var newMarker = new ol.Feature({
                    geometry: new ol.geom.LineString(converteline(coord)),
                    data: data[index],
                });


                markerSource.addFeature(newMarker);


            });*/

            var LayThe = new ol.layer.Vector({
                source: markerSource,
                style: styleLigne,
                visible: true
            });


            $scope.map.addLayer(LayThe);
            LayThe.set('name', space2underscore(couche.nom));

            var extent = markerSource.getExtent();
            $scope.map.getView().fit(extent, $scope.map.getSize(), {
                maxZoom: 17
            });

        }


        $('#test_cartes').show()
        $('#test_cartes').css('z-index', '999999999')
        $('#test_cartes').css('opacity', '1')
    }

    function stylePolygon(feature) {

        var donne = feature.getProperties().data


        if (donne.img_temp !== null && donne.img_temp !== undefined) {
            //console.log(donne)
            var styles = [
                new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#434343',
                        width: 4
                    }),
                    fill: new ol.style.Fill({
                        color: donne.img_temp
                    }),
                    //text: createTextStylePolygon(feature, map.getView().getResolution())

                })
            ];


            return styles

        } else {


            return new ol.style.Style({
                fill: new ol.style.Fill({
                    color: donne.remplir_couleur
                }),
                stroke: new ol.style.Stroke({
                    color: '#434343',
                    width: 4
                }),
                // text: createTextStylePolygon(feature, map.getView().getResolution())

            })

        }



    }

    function styleLigne(feature, resolution) {

        couche = feature.getProperties().data

        return new ol.style.Style({
            fill: new ol.style.Fill({
                color: couche.contour_couleur
            }),
            stroke: new ol.style.Stroke({
                color: couche.contour_couleur,
                width: 4
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: couche.contour_couleur
                }),
                fill: new ol.style.Fill({
                    color: couche.contour_couleur
                })
            }),
            // text: createTextStyle(feature, map.getView().getResolution())
        });

        //feature.setStyle(myStyle)
    }

    function convertepolygon(features) {

        var data = [];

        for (var i = 0; i < features.length; i++) {

            data.push(ol.proj.transform(features[i], 'EPSG:4326', 'EPSG:3857'))
        }

        return data;

    }


    //converte Feature coordinate line

    function converteline(features) {

        var data = [];

        for (var i = 0; i < features.length; i++) {

            data.push(ol.proj.transform(features[i], 'EPSG:4326', 'EPSG:3857'))
        }

        return data;

    }

    $scope.close_test_cartes = function () {
        $('#test_cartes').hide()
        $('#test_cartes').css('opacity', '0')
        $('#resultMap').hide();
    }

    $scope.ajout_sequence_cartes = function (couche) {
        console.log(couche)

        $scope.nouvelleSequence = {
            'couches': couche.couches,
            'nom': ''
        }

        if (couche.id_cartes) {
            $scope.nouvelleSequence.id_cartes = couche.id_cartes
        } else {
            $scope.nouvelleSequence.key = couche.key
        }


        $scope.cartesPourSequence = couche

        $('#sequence_cartes').show()
    }

    $scope.close_div_sequence = function () {
        $('#sequence_cartes').hide()
    }

    $scope.checkbox_sequence = function (couche, event) {

        for (var i = 0; i < $scope.nouvelleSequence.couches.length; i++) {
            if ($scope.nouvelleSequence.couches[i].key_couche == couche.key_couche) {
                $scope.nouvelleSequence.couches[i].sequence_status = event.target.checked
            }
        }

    }

    $scope.addSequence = function () {

        var compteur = []

        for (var i = 0; i < $scope.nouvelleSequence.couches.length; i++) {
            if ($scope.nouvelleSequence.couches[i].sequence_status) {
                compteur.push($scope.nouvelleSequence.couches[i])
            }
        }

        if ($scope.nouvelleSequence.nom == '') {
            toogle_information('Donner un nom a votre sequence')
        } else if (compteur.length < 2) {
            toogle_information('Vous devez selectionner au moins 2 couches')
        } else {

            for (var i = 0; i < $scope.nouvelleSequence.couches.length; i++) {
                $scope.nouvelleSequence.coucheSequence = compteur
            }

            $('#spinner').show()

            myfactory.post_data('/cartes/addSequence/', JSON.stringify($scope.nouvelleSequence)).then(
                function (data) {

                    if (requete_reussi(data)) {

                        var couches = []
                        for (var i = 0; i < compteur.length; i++) {
                            couches.push({
                                'id_couche': compteur[i].key_couche
                            })
                        }

                        for (var i = 0; i < $scope.cartes.length; i++) {
                            if ($scope.nouvelleSequence.key) {
                                for (var j = 0; j < $scope.cartes[i].sous_cartes.length; j++) {
                                    if ($scope.cartes[i].sous_cartes[j].key == $scope.nouvelleSequence.key) {
                                        if (!$scope.cartes[i].sous_cartes[j].sequence) {
                                            $scope.cartes[i].sous_cartes[j].sequence = []
                                        }
                                        $scope.cartes[i].sous_cartes[j].sequence.push({
                                            'id_sequence': data.id_sequence,
                                            'nom': $scope.nouvelleSequence.nom,
                                            'couches': couches
                                        })
                                    }
                                }
                            } else {
                                if ($scope.cartes[i].id_cartes == $scope.nouvelleSequence.id_cartes) {
                                    if (!$scope.cartes[i].sequence) {
                                        $scope.cartes[i].sequence = []
                                    }
                                    $scope.cartes[i].sequence.push({
                                        'id_sequence': data.id_sequence,
                                        'nom': $scope.nouvelleSequence.nom,
                                        'couches': couches
                                    })
                                }
                            }
                        }

                        toogle_information("La sequence a bien ete cree")
                        $('#sequence_cartes').hide()
                    }

                    $('#spinner').hide()
                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )

        }

        console.log($scope.nouvelleSequence, compteur.length)
    }

    $scope.getNomCoucheCartes = function (id, data) {
        for (var i = data.couches.length - 1; i >= 0; i--) {
            if (data.couches[i].key_couche == id) {
                return data.couches[i].nom
            }
        }
    }

    $scope.delete_sequence_cartes = function (sequence) {

        $('#spinner').show()

        myfactory.post_data('/cartes/deleteSequence/', JSON.stringify(sequence)).then(

            function (data) {

                if (requete_reussi(data)) {

                    for (var i = 0; i < $scope.cartes.length; i++) {
                        if (sequence.key) {
                            for (var j = 0; j < $scope.cartes[i].sous_cartes.length; j++) {
                                if ($scope.cartes[i].sous_cartes[j].key == sequence.key) {
                                    for (var k = 0; k < $scope.cartes[i].sous_cartes[j].sequence.length; k++) {
                                        if ($scope.cartes[i].sous_cartes[j].sequence[k].id_sequence = sequence.id_sequence) {
                                            $scope.cartes[i].sous_cartes[j].sequence.splice(k, 1);
                                        }
                                    }

                                }
                            }
                        } else {
                            if ($scope.cartes[i].id_cartes == sequence.id_cartes) {
                                for (var j = 0; j < $scope.cartes[i].sequence.length; j++) {
                                    if ($scope.cartes[i].sequence[j].id_sequence = sequence.id_sequence) {
                                        $scope.cartes[i].sequence.splice(j, 1);
                                    }
                                }
                            }
                        }
                    }

                    $scope.toogle_confirmation('false')
                    toogle_information("La sequence a bien ete supprime")

                }

                $('#spinner').hide()

            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }

        )

    }

    $scope.setPrincipalCartes = function (couche, event, sous_cartes) {
        $('#spinner').show()
        console.log(couche)

        donne = {
            'id_couche': couche.key_couche,
            'sous_cartes': sous_cartes,
            'status': event.target.checked
        }
        myfactory.post_data('/cartes/setPrincipalCartes/', JSON.stringify(donne)).then(

            function (data) {
                if (requete_reussi(data)) {


                    for (var i = 0; i < $scope.cartes.length; i++) {
                        if ($scope.cartes[i].sous_cartes) {
                            for (var j = 0; j < $scope.cartes[i].sous_cartes.length; j++) {
                                for (var k = 0; k < $scope.cartes[i].sous_cartes[j].couches.length; k++) {
                                    if ($scope.cartes[i].sous_cartes[j].couches[k].principal) {
                                        $scope.cartes[i].sous_cartes[j].couches[k].principal = false
                                    }
                                }
                            }
                        } else {

                            for (var j = 0; j < $scope.cartes[i].couches.length; j++) {
                                if ($scope.cartes[i].couches[j].principal) {
                                    $scope.cartes[i].couches[j].principal = false
                                }
                            }
                        }
                    }


                    couche.principal = event.target.checked
                    console.log(couche.principal, event.target.checked)
                }

                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }

        )
    }

    $scope.new_pdfs = {
        'status_open_add_cartes_pdf': false
    }

    $scope.open_add_cartes_pdf = function (carte) {
        $scope.new_pdfs = {
            'status_open_add_cartes_pdf': true,
            'carte_referent': carte
        }
        $('#add_cartes_pdf').show()
    }

    $scope.close_add_cartes_pdf = function () {
        $scope.new_pdfs = {
            'status_open_add_cartes_pdf': false
        }
        $('#add_cartes_pdf').hide()
    }

    $scope.add_doc_pdf = function () {

        var no_icone = []
        sous_cartes = $scope.new_pdfs.carte_referent.sous_cartes
        id_referent = $scope.new_pdfs.carte_referent.key_couche
        console.log($scope.new_pdfs)

        if (!$scope.new_pdfs.fileImg) {
            no_icone.push(7)
        }

        if ($scope.new_pdfs.type == 'indisponible') {
            $scope.new_pdfs.type = null
        }

        if (no_icone.length != 0) {

            toogle_information("Veillez mettre une imagette (image) ")

        } else if ($scope.new_pdfs.type == 'raster' && (!$scope.new_pdfs.url_raster || $scope.new_pdfs.url_raster == '')) {
            toogle_information(" Importer votre raster ")

        } else {
            /// si il y'a le pdf ///
            if ($scope.new_pdfs.filePdf) {
                var file = $scope.new_pdfs.filePdf
                formData = new FormData();
                var extension = file.name.split('.')[file.name.split('.').length - 1]
                formData.append('file', $scope.new_pdfs.filePdf);

                var request = {
                    method: 'POST',
                    url: $scope.urlNodejs_backend + '/download',
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    }
                };
                $('#spinner').show()
                $http(request)
                    .then(
                        function success(e) {
                            formData = new FormData();
                            console.log(e)
                            if (e.data.status) {

                                $scope.new_pdfs.url = e.data.file
                                /// si il y'a le raster
                                if ($scope.new_pdfs.fileRaster) {
                                    var file = $scope.new_pdfs.fileRaster
                                    formData = new FormData();
                                    var extension = file.name.split('.')[file.name.split('.').length - 1]
                                    formData.append('file', $scope.new_pdfs.fileRaster);
                                    console.log($scope.new_pdfs)
                                    var request = {
                                        method: 'POST',
                                        url: $scope.urlNodejs_backend + '/downloadRaster',
                                        data: formData,
                                        headers: {
                                            'Content-Type': undefined
                                        }
                                    };

                                    $http(request)
                                        .then(
                                            function success(e) {
                                                formData = new FormData();
                                                console.log(e)
                                                if (e.data.status) {
                                                    $scope.new_pdfs.url_raster = e.data.url_raster

                                                    $scope.new_pdfs.type = 'wms'

                                                    $scope.new_pdfs.identifiant = e.data.identifiant

                                                    myfactory.get_data($scope.urlNodejs_backend + "/generateLegend/" + $scope.projet_qgis_server).then(function (resp) {

                                                    })
                                                    $scope.new_pdfs.url_tile = e.data.projet_qgis
                                                    function_add_doc_pdf(sous_cartes, id_referent)
                                                }
                                            },
                                            function (err) {
                                                toogle_information('Une erreur, reesayer')
                                                $('#spinner').hide()
                                            }
                                        )
                                } else {
                                    function_add_doc_pdf(sous_cartes, id_referent)
                                }

                            }
                        },
                        function (err) {
                            toogle_information('Une erreur, reesayer')
                            $('#spinner').hide()
                        }
                    )
                /// si il y'a le raster et pas le pdf ///
            } else if (!$scope.new_pdfs.filePdf && $scope.new_pdfs.fileRaster) {
                var file = $scope.new_pdfs.fileRaster
                formData = new FormData();
                var extension = file.name.split('.')[file.name.split('.').length - 1]
                formData.append('file', $scope.new_pdfs.fileRaster);
                console.log($scope.new_pdfs)
                var request = {
                    method: 'POST',
                    url: $scope.urlNodejs_backend + '/downloadRaster',
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    }
                };
                $('#spinner').show()
                $http(request)
                    .then(
                        function success(e) {
                            formData = new FormData();
                            console.log(e)
                            if (e.data.status) {
                                $scope.new_pdfs.url_raster = e.data.url_raster

                                $scope.new_pdfs.type = 'wms'

                                $scope.new_pdfs.identifiant = e.data.identifiant

                                $scope.new_pdfs.url_tile = e.data.projet_qgis
                                function_add_doc_pdf(sous_cartes, id_referent)
                            }
                            $('#spinner').hide()
                        },
                        function (err) {
                            toogle_information('Une erreur, reesayer')
                            $('#spinner').hide()
                        }
                    )
            } else {
                function_add_doc_pdf(sous_cartes, id_referent)
            }


        }

    }

    function_add_doc_pdf = function (sous_cartes, id_referent) {

        $('#spinner').show()

        formData = new FormData();
        var extension = $scope.new_pdfs.fileImg.name.split('.')[$scope.new_pdfs.fileImg.name.split('.').length - 1]
        formData.append('image_file', $scope.new_pdfs.fileImg);
        formData.append('path', '/../../../public/assets/admin/');
        formData.append('pathBd', 'assets/admin/');
        formData.append('largeur', 70);
        formData.append('lomguer', 107);
        formData.append('nom', space2underscore($scope.new_pdfs.fileImg.name.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension));
        var request = {
            method: 'POST',
            url: '/upload/file',
            data: formData,
            headers: {
                'Content-Type': undefined
            }
        };

        $http(request)
            .then(
                function success(e) {
                    formData = new FormData();

                    if (e.data.status) {
                        // donne = {
                        //     'pdfs': $scope.new_pdfs,
                        //     'sous_cartes': sous_cartes,
                        //     'id_referent': id_referent
                        // }

                        $scope.new_pdfs.image_src = $scope.new_pdfs.img_temp
                        $scope.new_pdfs.img_temp = 'assets/admin/' + space2underscore($scope.new_pdfs.fileImg.name.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)

                        $scope.new_pdfs.id_referent = id_referent
                        $scope.new_pdfs.sous_cartes = sous_cartes
                        console.log($scope.new_pdfs)

                        myfactory.post_data('/cartes/add_doc_pdf/', JSON.stringify($scope.new_pdfs)).then(

                            function (data) {
                                if (requete_reussi(data)) {

                                    $scope.new_pdfs.id = data.id
                                    $scope.new_pdfs.image_src = $scope.new_pdfs.img_temp


                                    for (var i = 0; i < $scope.cartes.length; i++) {
                                        if (sous_cartes && $scope.cartes[i].sous_cartes) {
                                            for (var j = 0; j < $scope.cartes[i].sous_cartes.length; j++) {
                                                for (var k = 0; k < $scope.cartes[i].sous_cartes[j].couches.length; k++) {
                                                    if ($scope.cartes[i].sous_cartes[j].couches[k].key_couche == id_referent) {

                                                        if (!$scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf) {
                                                            $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf = []
                                                        }
                                                        $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf.push($scope.new_pdfs)

                                                    }
                                                }
                                            }
                                        } else if (sous_cartes && !$scope.cartes[i].sous_cartes) {
                                            for (var j = 0; j < $scope.cartes[i].couches.length; j++) {
                                                if ($scope.cartes[i].couches[j].key_couche == id_referent) {
                                                    if (!$scope.cartes[i].couches[j].cartes_pdf) {
                                                        $scope.cartes[i].couches[j].cartes_pdf = []
                                                    }
                                                    $scope.cartes[i].couches[j].cartes_pdf.push($scope.new_pdfs)
                                                }
                                            }
                                        }
                                    }

                                    $scope.close_add_cartes_pdf()
                                    toogle_information('Vos cartes pdf ont bien ete enregistres')
                                }

                                $('#spinner').hide()
                            },
                            function (err) {
                                $('#spinner').hide()
                                toogle_information('Verifier votre connexion')
                            }
                        )
                    }

                    $('#spinner').hide()
                },
                function (e) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )



    }

    $scope.delete_doc_pdf = function (pdf, carte) {
        $('#spinner').show()
        var sous_cartes = carte.sous_cartes
        var donne = {
            'id': pdf.id,
            'sous_cartes': carte.sous_cartes
        }

        myfactory.post_data('/cartes/delete_doc_pdf/', JSON.stringify(donne)).then(

            function (data) {
                if (requete_reussi(data)) {

                    for (var i = 0; i < $scope.cartes.length; i++) {
                        if (sous_cartes && $scope.cartes[i].sous_cartes) {
                            for (var j = 0; j < $scope.cartes[i].sous_cartes.length; j++) {
                                for (var k = 0; k < $scope.cartes[i].sous_cartes[j].couches.length; k++) {
                                    if ($scope.cartes[i].sous_cartes[j].couches[k].key_couche == carte.key_couche) {
                                        for (var index = 0; index < $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf.length; index++) {
                                            if ($scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index].id == pdf.id) {
                                                $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf.splice(index, 1)
                                            }
                                        }


                                    }
                                }
                            }
                        } else if (sous_cartes && !$scope.cartes[i].sous_cartes) {
                            for (var j = 0; j < $scope.cartes[i].couches.length; j++) {
                                if ($scope.cartes[i].couches[j].key_couche == carte.key_couche) {
                                    if ($scope.cartes[i].couches[j].cartes_pdf[index].id == pdf.id) {
                                        $scope.cartes[i].couches[j].cartes_pdf.splice(index, 1)
                                    }
                                }
                            }
                        }
                    }
                }
                $scope.toogle_confirmation('false')
                toogle_information('la carte a bien été supprimée')
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }

    $scope.SaveCoordPdf = function (sous_cartes) {
        var id = $('#getCoordPoint').data('key_couche')
        var sous_cartes = $('#getCoordPoint').data('sous_cartes').toString()
        var coord = $("#resultPoint").text().split(',')
        var point = [parseFloat(coord[0]), parseFloat(coord[1])]
        console.log(sous_cartes, id)

        $('#spinner').show()

        var donne = {
            'id': id,
            'sous_cartes': sous_cartes,
            'geom': point.toString()
        }

        myfactory.post_data('/cartes/SaveCoordPdf/', JSON.stringify(donne)).then(

            function (data) {
                if (requete_reussi(data)) {
                    $scope.close_test_cartes()
                    toogle_information('Succes')

                    for (var i = 0; i < $scope.cartes.length; i++) {
                        if (sous_cartes == 'true' && $scope.cartes[i].sous_cartes) {
                            for (var j = 0; j < $scope.cartes[i].sous_cartes.length; j++) {
                                for (var k = 0; k < $scope.cartes[i].sous_cartes[j].couches.length; k++) {
                                    if ($scope.cartes[i].sous_cartes[j].couches[k].key_couche == id) {
                                        $scope.cartes[i].sous_cartes[j].couches[k].geom = point.toString()

                                    }
                                }
                            }
                        } else if (sous_cartes == 'false' && !$scope.cartes[i].sous_cartes) {
                            for (var j = 0; j < $scope.cartes[i].couches.length; j++) {
                                if ($scope.cartes[i].couches[j].key_couche == id) {
                                    $scope.cartes[i].couches[j].geom = point.toString()
                                }
                            }
                        }
                    }

                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )

    }

    $scope.pdf_edition = {}
    $scope.pdf_for_edition = {
        'status': false
    }
    $scope.open_edit_cartes_pdf = function (pdf, carte) {
        $scope.pdf_for_edition = {
            'pdf': pdf,
            'carte': carte,
            'status': true
        }

        $scope.pdf_edition.img_temp = $scope.pdf_for_edition.pdf.image_src
        console.log($scope.pdf_for_edition)
        $('#edit_cartes_pdf').show()
    }

    $scope.updatePdfcarte = function (pdf_for_edition, pdf_edition) {

        angular.forEach(pdf_for_edition.pdf, function (value, item) {

            if (pdf_edition[item] == undefined) {
                pdf_edition[item] = pdf_for_edition.pdf[item]
            }

        })

        var donne = pdf_edition
        donne.key_couche = pdf_for_edition.carte.key_couche
        donne.sous_cartes = pdf_for_edition.carte.sous_cartes

        $('#spinner').show()
        /// si il y'a le pdf
        if (pdf_edition.filePdf) {
            var file = pdf_edition.filePdf
            formData = new FormData();
            var extension = file.name.split('.')[file.name.split('.').length - 1]
            formData.append('file', pdf_edition.filePdf);

            var request = {
                method: 'POST',
                url: $scope.urlNodejs_backend + '/download',
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(request)
                .then(
                    function success(e) {
                        formData = new FormData();
                        console.log(e)
                        if (e.data.status) {

                            pdf_edition.url = e.data.file
                            donne.url = e.data.file

                            if (pdf_edition.fileRaster) {
                                var file = pdf_edition.fileRaster
                                formData = new FormData();
                                var extension = file.name.split('.')[file.name.split('.').length - 1]
                                formData.append('file', pdf_edition.fileRaster);

                                var request = {
                                    method: 'POST',
                                    url: $scope.urlNodejs_backend + '/downloadRaster',
                                    data: formData,
                                    headers: {
                                        'Content-Type': undefined
                                    }
                                };

                                $http(request)
                                    .then(
                                        function success(e) {
                                            formData = new FormData();
                                            console.log(e)
                                            if (e.data.status) {
                                                pdf_edition.url_raster = e.data.url_raster
                                                donne.url_raster = e.data.url_raster

                                                pdf_edition.type = 'wms'
                                                donne.type = 'wms'

                                                pdf_edition.identifiant = e.data.identifiant
                                                donne.identifiant = e.data.identifiant

                                                pdf_edition.url_tile = e.data.projet_qgis
                                                donne.url_tile = e.data.projet_qgis
                                                function_updatePdfcarte(pdf_edition, donne)
                                            }
                                        },
                                        function (err) {
                                            toogle_information('Une erreur, reesayer')
                                            $('#spinner').hide()
                                        }
                                    )
                            } else {
                                function_updatePdfcarte(pdf_edition, donne)
                            }

                        }
                    },
                    function (err) {
                        toogle_information('Une erreur, reesayer')
                        $('#spinner').hide()
                    }
                )
        } else if (!pdf_edition.filePdf && pdf_edition.fileRaster) {
            var file = pdf_edition.fileRaster
            formData = new FormData();
            var extension = file.name.split('.')[file.name.split('.').length - 1]
            formData.append('file', pdf_edition.fileRaster);

            var request = {
                method: 'POST',
                url: $scope.urlNodejs_backend + '/downloadRaster',
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(request)
                .then(
                    function success(e) {
                        formData = new FormData();
                        console.log(e)
                        if (e.data.status) {
                            pdf_edition.url_raster = e.data.url_raster
                            donne.url_raster = e.data.url_raster

                            pdf_edition.type = 'wms'
                            donne.type = 'wms'

                            pdf_edition.identifiant = e.data.identifiant
                            donne.identifiant = e.data.identifiant

                            pdf_edition.url_tile = e.data.projet_qgis
                            donne.url_tile = e.data.projet_qgis
                            function_updatePdfcarte(pdf_edition, donne)
                        }
                        // $('#spinner').hide()
                    },
                    function (err) {
                        toogle_information('Une erreur, reesayer')
                        $('#spinner').hide()
                    }
                )
        } else {
            function_updatePdfcarte(pdf_edition, donne)
        }

        /*if (pdf_edition.fileImg) {

            formData = new FormData();
            var extension = donne.fileImg.name.split('.')[donne.fileImg.name.split('.').length - 1]
            formData.append('image_file', donne.fileImg);
            formData.append('path', '/../../../public/assets/admin/');
            formData.append('pathBd', 'assets/admin/');
            formData.append('largeur', 70);
            formData.append('lomguer', 107);
            formData.append('nom', space2underscore(donne.fileImg.name.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension));
            var request = {
                method: 'POST',
                url: '/upload/file',
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(request)
                .then(
                function success(e) {
                    formData = new FormData();

                    if (e.data.status) {
                        $('#spinner').hide()
                        donne.image_src = donne.img_temp
                        donne.img_temp = 'assets/admin/' + space2underscore(donne.fileImg.name.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)
                        myfactory.post_data('/cartes/updatePdfcarte/', JSON.stringify(donne)).then(
                            function (data) {

                                if (requete_reussi(data)) {
                                   
                                    for (var i = 0; i < $scope.cartes.length; i++) {
                                        if (donne.sous_cartes == true && $scope.cartes[i].sous_cartes) {
                                            for (var j = 0; j < $scope.cartes[i].sous_cartes.length; j++) {
                                                for (var k = 0; k < $scope.cartes[i].sous_cartes[j].couches.length; k++) {
                                                    if ($scope.cartes[i].sous_cartes[j].couches[k].key_couche == donne.key_couche) {
                                                        for (var index = 0; index < $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf.length; index++) {
                                                            if($scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index].id == donne.id){ 
                                                                $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index] = pdf_edition
                                                            }
                                                            
                                                        }
                                                    }
                                                }
                                            }
                                        } else if (donne.sous_cartes == false && !$scope.cartes[i].sous_cartes) {
                                            for (var j = 0; j < $scope.cartes[i].couches.length; j++) {
                                                if ($scope.cartes[i].couches[j].key_couche == donne.key_couche) {
                                                    
                                                    for (var index = 0; index <  $scope.cartes[i].couches[j].cartes_pdf.length; index++) {
                                                       if($scope.cartes[i].couches[j].cartes_pdf[index].id ==  donne.id ){
                                                        $scope.cartes[i].couches[j].cartes_pdf[index] = pdf_edition
                                                       }
                                                        
                                                    }
                                                }
                                            }
                                        }
                                    }
            
                                    toogle_information('Operation reussi')
                                    $scope.close_edit_cartes_pdf() 
                                   
                                }

                                $('#spinner').hide()
                            },
                            function (err) {
                                $('#spinner').hide()
                                toogle_information('Verifier votre connexion')
                            }
                        )

                    }

                    $('#spinner').hide()
                },
                function (e) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
                )
        } else {
            myfactory.post_data('/cartes/updatePdfcarte/', JSON.stringify(donne)).then(
                function (data) {

                    if (requete_reussi(data)) {
                       
                       for (var i = 0; i < $scope.cartes.length; i++) {
                            if (donne.sous_cartes == true && $scope.cartes[i].sous_cartes) {
                                for (var j = 0; j < $scope.cartes[i].sous_cartes.length; j++) {
                                    for (var k = 0; k < $scope.cartes[i].sous_cartes[j].couches.length; k++) {
                                        if ($scope.cartes[i].sous_cartes[j].couches[k].key_couche == donne.key_couche) {
                                            for (var index = 0; index < $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf.length; index++) {
                                                if($scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index].id == donne.id){ 
                                                    $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index] = pdf_edition
                                                }
                                                
                                            }
                                        }
                                    }
                                }
                            } else if (donne.sous_cartes == false && !$scope.cartes[i].sous_cartes) {
                                for (var j = 0; j < $scope.cartes[i].couches.length; j++) {
                                    if ($scope.cartes[i].couches[j].key_couche == donne.key_couche) {
                                        
                                        for (var index = 0; index <  $scope.cartes[i].couches[j].cartes_pdf.length; index++) {
                                           if($scope.cartes[i].couches[j].cartes_pdf[index].id ==  donne.id ){
                                            $scope.cartes[i].couches[j].cartes_pdf[index] = pdf_edition
                                           }
                                            
                                        }
                                    }
                                }
                            }
                        }


                        toogle_information('Operation reussi')
                        $scope.close_edit_cartes_pdf() 
                    }

                    $('#spinner').hide()
                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )
        }*/

    }

    function function_updatePdfcarte(pdf_edition, donne) {
        if (pdf_edition.fileImg) {

            formData = new FormData();
            var extension = donne.fileImg.name.split('.')[donne.fileImg.name.split('.').length - 1]
            formData.append('image_file', donne.fileImg);
            formData.append('path', '/../../../public/assets/admin/');
            formData.append('pathBd', 'assets/admin/');
            formData.append('largeur', 70);
            formData.append('lomguer', 107);
            formData.append('nom', space2underscore(donne.fileImg.name.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension));
            var request = {
                method: 'POST',
                url: '/upload/file',
                data: formData,
                headers: {
                    'Content-Type': undefined
                }
            };

            $http(request)
                .then(
                    function success(e) {
                        formData = new FormData();

                        if (e.data.status) {
                            $('#spinner').hide()
                            donne.image_src = donne.img_temp
                            donne.img_temp = 'assets/admin/' + space2underscore(donne.fileImg.name.replace(/[^\w\s]/gi, '').toLowerCase() + '.' + extension)

                            myfactory.post_data('/cartes/updatePdfcarte/', JSON.stringify(donne)).then(
                                function (data) {

                                    if (requete_reussi(data)) {
                                        pdf_edition.filePdf = undefined
                                        pdf_edition.fileRaster = undefined
                                        pdf_edition.fileImg = undefined
                                        for (var i = 0; i < $scope.cartes.length; i++) {
                                            if (donne.sous_cartes == true && $scope.cartes[i].sous_cartes) {
                                                for (var j = 0; j < $scope.cartes[i].sous_cartes.length; j++) {
                                                    for (var k = 0; k < $scope.cartes[i].sous_cartes[j].couches.length; k++) {
                                                        if ($scope.cartes[i].sous_cartes[j].couches[k].key_couche == donne.key_couche) {
                                                            for (var index = 0; index < $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf.length; index++) {
                                                                if ($scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index].id == donne.id) {
                                                                    $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index] = pdf_edition
                                                                }

                                                            }
                                                        }
                                                    }
                                                }
                                            } else if (donne.sous_cartes == false && !$scope.cartes[i].sous_cartes) {
                                                for (var j = 0; j < $scope.cartes[i].couches.length; j++) {
                                                    if ($scope.cartes[i].couches[j].key_couche == donne.key_couche) {

                                                        for (var index = 0; index < $scope.cartes[i].couches[j].cartes_pdf.length; index++) {
                                                            if ($scope.cartes[i].couches[j].cartes_pdf[index].id == donne.id) {
                                                                $scope.cartes[i].couches[j].cartes_pdf[index] = pdf_edition
                                                            }

                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        toogle_information('Operation reussi')
                                        $scope.close_edit_cartes_pdf()

                                    }

                                    $('#spinner').hide()
                                },
                                function (err) {
                                    $('#spinner').hide()
                                    toogle_information('Verifier votre connexion')
                                }
                            )

                        }

                        $('#spinner').hide()
                    },
                    function (e) {
                        $('#spinner').hide()
                        toogle_information('Verifier votre connexion')
                    }
                )
        } else {
            myfactory.post_data('/cartes/updatePdfcarte/', JSON.stringify(donne)).then(
                function (data) {

                    if (requete_reussi(data)) {
                        pdf_edition.filePdf = undefined
                        pdf_edition.fileRaster = undefined
                        pdf_edition.fileImg = undefined
                        for (var i = 0; i < $scope.cartes.length; i++) {
                            if (donne.sous_cartes == true && $scope.cartes[i].sous_cartes) {
                                for (var j = 0; j < $scope.cartes[i].sous_cartes.length; j++) {
                                    for (var k = 0; k < $scope.cartes[i].sous_cartes[j].couches.length; k++) {
                                        if ($scope.cartes[i].sous_cartes[j].couches[k].key_couche == donne.key_couche) {
                                            for (var index = 0; index < $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf.length; index++) {
                                                if ($scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index].id == donne.id) {
                                                    $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index] = pdf_edition
                                                }

                                            }
                                        }
                                    }
                                }
                            } else if (donne.sous_cartes == false && !$scope.cartes[i].sous_cartes) {
                                for (var j = 0; j < $scope.cartes[i].couches.length; j++) {
                                    if ($scope.cartes[i].couches[j].key_couche == donne.key_couche) {

                                        for (var index = 0; index < $scope.cartes[i].couches[j].cartes_pdf.length; index++) {
                                            if ($scope.cartes[i].couches[j].cartes_pdf[index].id == donne.id) {
                                                $scope.cartes[i].couches[j].cartes_pdf[index] = pdf_edition
                                            }

                                        }
                                    }
                                }
                            }
                        }


                        toogle_information('Operation reussi')
                        $scope.close_edit_cartes_pdf()
                    }

                    $('#spinner').hide()
                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )
        }
    }

    $scope.close_edit_cartes_pdf = function () {
        $scope.pdf_for_edition = {
            'status': false
        }
        $scope.pdf_edition = {}
        $('#edit_cartes_pdf').hide()
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour modifier les proprietes d'une couche wms
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    $scope.sous_thematique_couche_modifier = {
        'active': false
    }

    $scope.save_properties_couche = function (couche) {

        if (couche.type_couche == 'wms') {

            angular.forEach(couche, function (value, item) {

                if ($scope.sous_thematique_couche_modifier[item] == undefined) {
                    $scope.sous_thematique_couche_modifier[item] = couche[item]
                }

            })

            //$scope.sous_thematique_couche_modifier.sous_thematiques = couche.sous_thematiques
            //$scope.sous_thematique_couche_modifier.key_couche = couche.key_couche
            console.log($scope.sous_thematique_couche_modifier, couche)
            $('#spinner').show()


            myfactory.post_data('/thematique/save_properties_couche_wms/', JSON.stringify($scope.sous_thematique_couche_modifier)).then(

                function (data) {
                    if (requete_reussi(data)) {

                        couche.url = $scope.sous_thematique_couche_modifier.url
                        couche.identifiant = $scope.sous_thematique_couche_modifier.identifiant
                        couche.bbox = $scope.sous_thematique_couche_modifier.bbox
                        couche.projection = $scope.sous_thematique_couche_modifier.projection
                        couche.zmax = $scope.sous_thematique_couche_modifier.zmax
                        couche.zmin = $scope.sous_thematique_couche_modifier.zmin

                        $scope.sous_thematique_couche_modifier = {
                            'active': false
                        }

                        toogle_information('la couche a bien ete modifiee')
                    }
                    $('#spinner').hide()
                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )

        } else if (couche.type_couche == 'api') {


            $scope.sous_thematique_couche_modifier.sous_thematiques = couche.sous_thematiques
            $scope.sous_thematique_couche_modifier.key_couche = couche.key_couche
            console.log($scope.sous_thematique_couche_modifier, couche)

            $('#spinner').show()


            myfactory.post_data('/thematique/save_properties_couche_api/', JSON.stringify($scope.sous_thematique_couche_modifier)).then(

                function (data) {
                    if (requete_reussi(data)) {

                        couche.url = $scope.sous_thematique_couche_modifier.url

                        $scope.sous_thematique_couche_modifier = {
                            'active': false
                        }

                        toogle_information('la couche a bien ete modifiee')
                    }
                    $('#spinner').hide()
                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )

        }

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //function pour modifier les proprietes d'une couche osm
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    $scope.saveSqlCouche = function (couche, new_sql_complete) {

        if (new_sql_complete.length < 4) {
            toogle_information('Aucune requète entrée !')
        } else {
            $('#spinner').show()

            var donne = {}
            donne.sous_thematiques = couche.sous_thematiques
            donne.key_couche = couche.key_couche
            donne.geom = couche.geom
            donne.nom = couche.nom
            donne.type_couche = couche.type_couche
            donne.sql_complete = new_sql_complete

            myfactory.post_data('/thematique/save_properties_couche_sql_complete_osm/', JSON.stringify(donne)).then(
                function (data) {
                    if (data.status) {
                        couche.categorie.sql_complete = new_sql_complete
                        couche.categorie.mode_sql = true
                        $scope.generateSqlByCat(data.id_cat, couche)
                    } else {
                        alert(data.message.errorInfo.join('-'))
                        toogle_information('Impossible de terminer l opération')
                        $('#spinner').hide()
                    }
                }
            )
        }
        // couche.categorie.mode_sql
    }

    $scope.isCollapsedSelectClause = true

    $scope.toogleDivSelectCause = function () {
        $scope.isCollapsedSelectClause = !$scope.isCollapsedSelectClause
    }

    $scope.save_select_clause = function (couche, new_select) {

        if (new_select.length < 4) {
            toogle_information('Aucune requète entrée !')
        } else {
            $('#spinner').show()

            var donne = {}
            donne.sous_thematiques = couche.sous_thematiques
            donne.key_couche = couche.key_couche
            donne.select = new_select

            myfactory.post_data('/thematique/save_select_clause/', JSON.stringify(donne)).then(
                function (data) {
                    if (data.status) {
                        couche.categorie.select = new_select
                        $scope.generateSqlByCat(data.id_cat, couche)
                    } else {
                        alert(data.message.errorInfo.join('-'))
                        toogle_information('Impossible de terminer l opération')
                        $('#spinner').hide()
                    }
                }
            )
        }
        // couche.categorie.mode_sql
    }

    $scope.nouvelles_cles_vals_osm = []

    $scope.add_cles_vals_osm = function (couche) {
        console.log(couche, $scope.nouvelles_cles_vals_osm)
        var bool = 0;

        for (var i = 0; i < $scope.nouvelles_cles_vals_osm.length; i++) {
            if (!$scope.nouvelles_cles_vals_osm[i].condition) {
                bool = 1
            }

            if (!$scope.nouvelles_cles_vals_osm[i].action || $scope.nouvelles_cles_vals_osm[i].action == '') {
                bool = 1
            }

            if (!$scope.nouvelles_cles_vals_osm[i].operateur) {
                bool = 1
            }

        }

        if (bool == 1) {
            toogle_information('Remplissez bien le formulaire de requetes')
        } else {

            var donne = {}
            donne.sous_thematiques = couche.sous_thematiques
            donne.key_couche = couche.key_couche
            donne.geom = couche.geom
            donne.nom = couche.nom
            donne.type_couche = couche.type_couche

            for (var i = $scope.nouvelles_cles_vals_osm.length - 1; i >= 0; i--) {
                if (!$scope.nouvelles_cles_vals_osm[i].nom) {
                    $scope.nouvelles_cles_vals_osm[i].nom = ''
                }

            }

            donne.key_val_osm = $scope.nouvelles_cles_vals_osm

            $('#spinner').show()

            myfactory.post_data('/thematique/save_properties_couche_osm/', JSON.stringify(donne)).then(
                function (data) {
                    if (data.status) {

                        for (var i = $scope.nouvelles_cles_vals_osm.length - 1; i >= 0; i--) {
                            $scope.nouvelles_cles_vals_osm[i].id = data.data[i]
                            $scope.nouvelles_cles_vals_osm[i].id_cat = data['id_cat']
                        }
                        if (!couche.cles_vals_osm) {
                            couche.cles_vals_osm = []
                        }
                        if (couche.cles_vals_osm.length == 0) {
                            couche.cles_vals_osm = $scope.nouvelles_cles_vals_osm
                        } else {
                            for (var i = $scope.nouvelles_cles_vals_osm.length - 1; i >= 0; i--) {
                                couche.cles_vals_osm.push($scope.nouvelles_cles_vals_osm[i])
                            }
                        }

                        console.log(couche.cles_vals_osm[0])
                        $scope.nouvelles_cles_vals_osm = []

                        $scope.generateSqlByCat(couche.cles_vals_osm[0].id_cat, couche)

                    } else {
                        alert(data.message.errorInfo.join('-'))
                        toogle_information('Impossible de terminer l opération')
                        $('#spinner').hide()
                    }

                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )

        }

    }

    $scope.generateSqlByCat = function (id_cat, couche) {
        myfactory.post_data('/thematique/genrateJsonFileByCat/', JSON.stringify({
            'id_cat': id_cat
        })).then(
            function (data) {
                if (requete_reussi(data)) {
                    couche.number = data.number
                    couche.status = data.statut
                    couche.file_json = data.file_json

                    if (couche.geom == "Polygon") {
                        couche.surface_totale = data.surface
                    } else if (couche.geom == "LineString") {
                        couche.distance_totale = data.distance
                    }
                    console.log(couche)

                    if (couche.wms_type == 'osm') {
                        if (couche.identifiant) {
                            var addToWms = 'false'
                        } else {
                            var addToWms = 'true'
                        }
                        myfactory.get_data($scope.urlNodejs_backend + '/generateShapeFromOsmBuilder/' + $scope.projet_qgis_server + '/' + id_cat + '/' + addToWms).then(
                            function (data) {
                                console.log(data)
                                if (requete_reussi(data)) {

                                    if (!couche.identifiant) {
                                        couche.identifiant = data.identifiant
                                        couche.url = data.projet_qgis
                                    }

                                    toogle_information('la couche a bien ete modifiee')
                                    $('#spinner').hide()
                                    // myfactory.get_data($scope.urlNodejs_backend+"/generateLegend/"+$scope.projet_qgis_server).then(function (resp) {

                                    //  })
                                } else {
                                    toogle_information('un problème est survenu, contacter administrateur')
                                    $('#spinner').hide()
                                }
                            },
                            function (err) {
                                alert('un problème est survenu, contacter administrateur')
                                $('#spinner').hide()
                            }
                        )
                    } else {
                        toogle_information('la couche a bien ete modifiee')
                        $('#spinner').hide()
                    }


                } else {
                    alert('Verifier votre requete, et supprimer vos modifications avant de quitter svp ')
                    $('#spinner').hide()
                }

            },
            function (err) {
                alert('Verifier votre requete, et supprimer vos modifications avant de quitter svp ')
                $('#spinner').hide()

            }
        )
    }

    $scope.delete_cles_vals_osm = function (cle_val_osm, couche) {
        console.log(cle_val_osm, couche.cles_vals_osm)

        var id_cat = couche.cles_vals_osm[0].id_cat
        $('#spinner').show()

        myfactory.post_data('/thematique/delete_cles_vals_osm/', JSON.stringify(cle_val_osm)).then(

            function (data) {
                console.log(data)
                if (requete_reussi(data)) {

                    for (var i = couche.cles_vals_osm.length - 1; i >= 0; i--) {

                        if (couche.cles_vals_osm[i].id == cle_val_osm.id) {
                            couche.cles_vals_osm.splice(i, 1)
                        }
                    }

                    $scope.toogle_confirmation('false')


                    myfactory.post_data('/thematique/genrateJsonFileByCat/', JSON.stringify({
                        'id_cat': id_cat
                    })).then(
                        function (data) {
                            if (requete_reussi(data)) {
                                couche.number = data.number
                                couche.status = data.statut

                                if (couche.wms_type == 'osm') {
                                    myfactory.get_data($scope.urlNodejs_backend + '/generateShapeFromOsmBuilder/' + $scope.projet_qgis_server + '/' + id_cat + '/false').then(
                                        function (data) {
                                            if (requete_reussi(data)) {
                                                toogle_information('La condition a bien ete supprimer')

                                                if (couche.cles_vals_osm.length == 0) {
                                                    couche.number = 0
                                                    couche.status = true
                                                }

                                                $('#spinner').hide()
                                            } else {
                                                toogle_information('un problème est survenu, contacter administrateur')
                                                $('#spinner').hide()
                                            }
                                        },
                                        function (err) {
                                            alert('un problème est survenu, contacter administrateur')
                                            $('#spinner').hide()
                                        }
                                    )
                                } else {
                                    toogle_information('La condition a bien ete supprimer')
                                    $('#spinner').hide()
                                }


                            } else {
                                alert('Verifier votre requete, et supprimer vos modifications avant de quitter svp ')
                            }
                            $('#spinner').hide()
                        },
                        function (err) {
                            alert('Verifier votre requete, et supprimer vos modifications avant de quitter svp ')
                            $('#spinner').hide()

                        }
                    )


                }


            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }

    $scope.chooseTypeWms = function (couche, wms_type) {

        if (!wms_type) {
            toogle_information('choisissez une option dans le menu déroulant !')
        } else {

            $('#spinner').show()
            var donne = {
                'wms_type': wms_type,
                'key_couche': couche.key_couche,
                'sous_thematiques': couche.sous_thematiques
            }
            console.log(donne)

            myfactory.post_data('/thematique/chooseTypeWms/', JSON.stringify(donne)).then(

                function (data) {
                    console.log(data)
                    if (requete_reussi(data)) {
                        couche.wms_type = wms_type
                        toogle_information('Bien modifié')
                    }
                    toogle_information('un problème est survenu, ressayer svp !')
                    $('#spinner').hide()
                },
                function (err) {
                    $('#spinner').hide()
                    toogle_information('Verifier votre connexion')
                }
            )
        }


    }


    //////////////////////////////////////////// metadonne carte ///////////////////////////////////////

    $scope.tags = ['Oliver Stone', 'Al Pacino'];
    $scope.nouveau_acteurs = []
    $scope.options = {
        customClass: getDayClass,
        showWeeks: true
    };

    $scope.dt = new Date()

    function getDayClass(data) {
        var date = data.date,
            mode = data.mode;
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

        }

        return '';
    }

    $scope.metadata_edit = {
        'status': false
    }
    $scope.openMetadata = function (couche, pdf) {
        console.log(couche)

        if (pdf) {
            var metada = pdf.metadata
        } else {
            var metada = couche.metadata
        }

        $scope.nouveau_acteurs = []
        $scope.metadata_edit = {
            'status': true,
            'key_couche': couche.key_couche,
            'id_referent': couche.key_couche,
            'sous': couche.sous_cartes,
            'tags': [],
            'partenaire': [],
            'type_couche_metadata': 'cartes'
        }

        if (pdf) {
            $scope.metadata_edit.id_referent = pdf.id
            $scope.metadata_edit.id_pdf = pdf.id
        }

        console.log(!Array.isArray(metada), metada)
        if (!Array.isArray(metada)) {

            if (metada.description) {
                $scope.metadata_edit.description = metada.description
            }

            if (metada.licence) {
                $scope.metadata_edit.licence = metada.licence
            }

            if (metada.tags && metada.tags.length > 0) {

                for (var index = 0; index < metada.tags.length; index++) {
                    if (metada.tags[index].tags) {
                        $scope.metadata_edit.tags.push(metada.tags[index].tags)
                    } else {
                        $scope.metadata_edit.tags = metada.tags
                    }
                }

            }

            if (metada.partenaire && metada.partenaire.length > 0) {
                $scope.metadata_edit.partenaire = metada.partenaire
            }

            if (metada.date_creation) {
                $scope.metadata_edit.date_creation = Date.parse(metada.date_creation)
            }

            if (metada.id) {
                $scope.metadata_edit.id_metadata = metada.id
            }

            metada.date_creation = Date.parse(metada.date_creation)
            $scope.metadata = metada
        } else {
            $scope.metadata = {}
        }

        console.log($scope.metadata_edit)

        $('#edit_metadata').show()
    }

    $scope.addMetadata = function () {
        if ($scope.metadata_edit.type_couche_metadata == 'cartes') {
            $scope.addMetadata_cartes()
        } else {
            $scope.addMetadata_thematiques()
        }
    }

    $scope.editMetadata = function () {
        if ($scope.metadata_edit.type_couche_metadata == 'cartes') {
            $scope.editMetadata_cartes()
        } else {
            $scope.editMetadata_thematiques()
        }
    }

    $scope.close_edit_metadata = function () {
        $('#edit_metadata').hide()
        $scope.metadata_edit = {
            'status': false
        }
    }

    $scope.toogleMenuMetadata = function (menu) {
        if (menu == 'description') {
            $('#md_description').show()
            $('#md_qualite').hide()
            $('#md_ressources').hide()

            $('.md_description').css('background-color', '#fff')
            $('.md_qualite').css('background-color', '#a8a6a6')
            $('.md_ressources').css('background-color', '#a8a6a6')
        } else if (menu == 'qualite') {
            $('#md_description').hide()
            $('#md_qualite').show()
            $('#md_ressources').hide()

            $('.md_qualite').css('background-color', '#fff')
            $('.md_description').css('background-color', '#a8a6a6')
            $('.md_ressources').css('background-color', '#a8a6a6')
        } else if (menu == 'ressources') {
            $('#md_description').hide()
            $('#md_qualite').hide()
            $('#md_ressources').show()

            $('.md_ressources').css('background-color', '#fff')
            $('.md_description').css('background-color', '#a8a6a6')
            $('.md_qualite').css('background-color', '#a8a6a6')
        }
    }

    $scope.addMetadata_cartes = function () {

        $('#spinner').show()

        $scope.metadata_edit.partenaire = $scope.nouveau_acteurs
        var donne = $scope.metadata_edit
        myfactory.post_data('/cartes/addMetadata/', JSON.stringify(donne)).then(
            function (data) {
                if (requete_reussi(data)) {
                    console.log($scope.metadata_edit)
                    for (var i = 0; i < $scope.cartes.length; i++) {
                        if ($scope.metadata_edit.sous == true && $scope.cartes[i].sous_cartes) {
                            for (var j = 0; j < $scope.cartes[i].sous_cartes.length; j++) {
                                for (var k = 0; k < $scope.cartes[i].sous_cartes[j].couches.length; k++) {
                                    if ($scope.cartes[i].sous_cartes[j].couches[k].key_couche == donne.key_couche) {
                                        if ($scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf && $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf.length > 0) {
                                            for (var index = 0; index < $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf.length; index++) {
                                                if ($scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index].id == donne.id_pdf) {
                                                    $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['metadata'] = donne
                                                    $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['metadata'].id = data.id
                                                    $scope.close_edit_metadata()
                                                }
                                            }
                                        } else {
                                            $scope.cartes[i].sous_cartes[j].couches[k]['metadata'] = donne
                                            $scope.cartes[i].sous_cartes[j].couches[k]['metadata'].id = data.id
                                            $scope.close_edit_metadata()
                                        }
                                    }
                                }
                            }
                        } else if ($scope.metadata_edit.sous == false && !$scope.cartes[i].sous_cartes) {
                            for (var j = 0; j < $scope.cartes[i].couches.length; j++) {
                                if ($scope.cartes[i].couches[j].key_couche == donne.key_couche) {
                                    if ($scope.cartes[i].couches[j].cartes_pdf.length > 0) {
                                        for (var index = 0; index < $scope.cartes[i].couches[j].cartes_pdf.length; index++) {
                                            if ($scope.cartes[i].couches[j].cartes_pdf[index].id == donne.id_pdf) {
                                                $scope.cartes[i].couches[j].cartes_pdf[index]['metadata'] = donne
                                                $scope.cartes[i].couches[j].cartes_pdf[index]['metadata'].id = data.id
                                                $scope.close_edit_metadata()
                                            }
                                        }
                                    } else {
                                        $scope.cartes[i].couches[j]['metadata'] = donne
                                        $scope.cartes[i].couches[j]['metadata'].id = data.id
                                        $scope.close_edit_metadata()
                                    }

                                }
                            }
                        }

                        toogle_information('Vos metadonnées ont été bien enregistrées')
                    }
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }

    $scope.editMetadata_cartes = function () {

        $('#spinner').show()

        for (var index = 0; index < $scope.nouveau_acteurs.length; index++) {
            $scope.metadata_edit.partenaire.push($scope.nouveau_acteurs[index])
        }
        $scope.metadata_edit.date_creation = new Date($scope.metadata_edit.date_creation)
        angular.forEach($scope.metadata, function (value, key) {
            if (!$scope.metadata_edit[key]) {
                $scope.metadata_edit[key] = value
            }
        });

        var donne = $scope.metadata_edit
        myfactory.post_data('/cartes/editMetadata/', JSON.stringify(donne)).then(
            function (data) {
                if (requete_reussi(data)) {
                    console.log($scope.metadata_edit)
                    for (var i = 0; i < $scope.cartes.length; i++) {
                        if ($scope.metadata_edit.sous == true && $scope.cartes[i].sous_cartes) {
                            for (var j = 0; j < $scope.cartes[i].sous_cartes.length; j++) {
                                for (var k = 0; k < $scope.cartes[i].sous_cartes[j].couches.length; k++) {
                                    if ($scope.cartes[i].sous_cartes[j].couches[k].key_couche == donne.key_couche) {
                                        if ($scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf && $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf.length > 0) {
                                            for (var index = 0; index < $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf.length; index++) {
                                                if ($scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index].id == donne.id_pdf) {
                                                    $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['metadata'] = donne
                                                    $scope.cartes[i].sous_cartes[j].couches[k].cartes_pdf[index]['metadata'].id = data.id
                                                    $scope.close_edit_metadata()
                                                }
                                            }
                                        } else {
                                            $scope.cartes[i].sous_cartes[j].couches[k]['metadata'] = donne
                                            $scope.cartes[i].sous_cartes[j].couches[k]['metadata'].id = data.id
                                            $scope.close_edit_metadata()
                                        }
                                    }
                                }
                            }
                        } else if ($scope.metadata_edit.sous == false && !$scope.cartes[i].sous_cartes) {
                            for (var j = 0; j < $scope.cartes[i].couches.length; j++) {
                                if ($scope.cartes[i].couches[j].key_couche == donne.key_couche) {
                                    if ($scope.cartes[i].couches[j].cartes_pdf.length > 0) {
                                        for (var index = 0; index < $scope.cartes[i].couches[j].cartes_pdf.length; index++) {
                                            if ($scope.cartes[i].couches[j].cartes_pdf[index].id == donne.id_pdf) {
                                                $scope.cartes[i].couches[j].cartes_pdf[index]['metadata'] = donne
                                                $scope.cartes[i].couches[j].cartes_pdf[index]['metadata'].id = data.id
                                                $scope.close_edit_metadata()
                                            }
                                        }
                                    } else {
                                        $scope.cartes[i].couches[j]['metadata'] = donne
                                        $scope.cartes[i].couches[j]['metadata'].id = data.id
                                        $scope.close_edit_metadata()
                                    }

                                }
                            }
                        }

                        toogle_information('Vos metadonnées ont été bien enregistrées')
                    }
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }


    //////////////////////////////////////////// metadonne thematiques ///////////////////////////////////////

    $scope.openMetadata_thematiques = function (couche) {
        console.log(couche)

        var metada = couche.metadata
        $scope.nouveau_acteurs = []
        $scope.metadata_edit = {
            'status': true,
            'key_couche': couche.key_couche,
            'id_referent': couche.key_couche,
            'sous': couche.sous_thematiques,
            'tags': [],
            'partenaire': [],
            'type_couche_metadata': 'thematiques'
        }

        console.log(!Array.isArray(metada), metada)
        if (!Array.isArray(metada)) {

            if (metada.description) {
                $scope.metadata_edit.description = metada.description
            }

            if (metada.licence) {
                $scope.metadata_edit.licence = metada.licence
            }

            if (metada.tags && metada.tags.length > 0) {

                for (var index = 0; index < metada.tags.length; index++) {
                    if (metada.tags[index].tags) {
                        $scope.metadata_edit.tags.push(metada.tags[index].tags)
                    } else {
                        $scope.metadata_edit.tags = metada.tags
                    }
                }

            }

            if (metada.partenaire && metada.partenaire.length > 0) {
                $scope.metadata_edit.partenaire = metada.partenaire
            }

            if (metada.date_creation) {
                $scope.metadata_edit.date_creation = Date.parse(metada.date_creation)
            }

            if (metada.id) {
                $scope.metadata_edit.id_metadata = metada.id
            }

            metada.date_creation = Date.parse(metada.date_creation)
            $scope.metadata = metada
        } else {
            $scope.metadata = {}
        }

        console.log($scope.metadata_edit)

        $('#edit_metadata').show()
    }

    $scope.addMetadata_thematiques = function () {

        $('#spinner').show()

        $scope.metadata_edit.partenaire = $scope.nouveau_acteurs
        var donne = $scope.metadata_edit
        myfactory.post_data('/thematique/addMetadata/', JSON.stringify(donne)).then(
            function (data) {
                if (requete_reussi(data)) {
                    console.log($scope.metadata_edit)
                    for (var i = 0; i < $scope.thematiques.length; i++) {
                        if ($scope.metadata_edit.sous == true && $scope.thematiques[i].sous_thematiques) {
                            for (var j = 0; j < $scope.thematiques[i].sous_thematiques.length; j++) {
                                for (var k = 0; k < $scope.thematiques[i].sous_thematiques[j].couches.length; k++) {
                                    if ($scope.thematiques[i].sous_thematiques[j].couches[k].key_couche == donne.key_couche) {

                                        $scope.thematiques[i].sous_thematiques[j].couches[k]['metadata'] = donne
                                        $scope.thematiques[i].sous_thematiques[j].couches[k]['metadata'].id = data.id
                                        $scope.close_edit_metadata()
                                    }
                                }
                            }
                        } else if ($scope.metadata_edit.sous == false && !$scope.thematiques[i].sous_thematiques) {
                            for (var j = 0; j < $scope.thematiques[i].couches.length; j++) {
                                if ($scope.thematiques[i].couches[j].key_couche == donne.key_couche) {

                                    $scope.thematiques[i].couches[j]['metadata'] = donne
                                    $scope.thematiques[i].couches[j]['metadata'].id = data.id
                                    $scope.close_edit_metadata()
                                }
                            }
                        }

                        toogle_information('Vos metadonnées ont été bien enregistrées')
                    }
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }

    $scope.editMetadata_thematiques = function () {

        $('#spinner').show()

        for (var index = 0; index < $scope.nouveau_acteurs.length; index++) {
            $scope.metadata_edit.partenaire.push($scope.nouveau_acteurs[index])
        }
        $scope.metadata_edit.date_creation = new Date($scope.metadata_edit.date_creation)
        angular.forEach($scope.metadata, function (value, key) {
            if (!$scope.metadata_edit[key]) {
                $scope.metadata_edit[key] = value
            }
        });

        var donne = $scope.metadata_edit
        myfactory.post_data('/thematique/editMetadata/', JSON.stringify(donne)).then(
            function (data) {
                if (requete_reussi(data)) {
                    console.log($scope.metadata_edit)
                    for (var i = 0; i < $scope.thematiques.length; i++) {
                        if ($scope.metadata_edit.sous == true && $scope.thematiques[i].sous_thematiques) {
                            for (var j = 0; j < $scope.thematiques[i].sous_thematiques.length; j++) {
                                for (var k = 0; k < $scope.thematiques[i].sous_thematiques[j].couches.length; k++) {
                                    if ($scope.thematiques[i].sous_thematiques[j].couches[k].key_couche == donne.key_couche) {

                                        $scope.thematiques[i].sous_thematiques[j].couches[k]['metadata'] = donne
                                        $scope.thematiques[i].sous_thematiques[j].couches[k]['metadata'].id = data.id
                                        $scope.close_edit_metadata()
                                    }
                                }
                            }
                        } else if ($scope.metadata_edit.sous == false && !$scope.thematiques[i].sous_thematiques) {
                            for (var j = 0; j < $scope.thematiques[i].couches.length; j++) {
                                if ($scope.thematiques[i].couches[j].key_couche == donne.key_couche) {

                                    $scope.thematiques[i].couches[j]['metadata'] = donne
                                    $scope.thematiques[i].couches[j]['metadata'].id = data.id
                                    $scope.close_edit_metadata()

                                }
                            }
                        }

                        toogle_information('Vos metadonnées ont été bien enregistrées')
                    }
                }
                $('#spinner').hide()
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }

    $scope.submitActions = function (option, sous_thematique_couche) {
        console.log(option, $scope.submitSelectedItem)
        if (option == "fiche") {
            $scope.openMetadata_thematiques(sous_thematique_couche)
        } else if (option == "style") {
            $scope.file('style_importation', sous_thematique_couche, 'style_importation')
        } else if (option == "telechargez") {
            $scope.getFileNode(sous_thematique_couche)
        } else if (option == "tester") {
            $scope.testCarte(sous_thematique_couche)
        } else if (option == "refres_style") {
            $scope.refres_style(sous_thematique_couche)
        } else if (option == 'download_qml') {
            $scope.download_qml(sous_thematique_couche)
        }
        $scope.submitSelectedItem = null
    }


    $scope.download_qml = function (donne) {
        $('#spinner').show()
        myfactory.get_data($scope.urlNodejs_backend + '/save_and_download_style_qgis/' + $scope.projet_qgis_server + '/' + donne.identifiant).then(
            function (data) {
                $('#spinner').hide()
                if (requete_reussi(data)) {
                    var url = $scope.urlNodejs_backend + data.data.split("//").join("/")
                    console.log(url)
                    window.open(url, '_blank');
                }
            },
            function (err) {
                $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )

    }

    $scope.define_service = function (service, couche) {


        if (service == 'wms') {
            service_wms = true
        } else {
            service_wms = false
        }

        var donne = {
            'sous_thematiques': couche.sous_thematiques,
            'key_couche': couche.key_couche,
            'service_wms': service_wms
        }
        console.log(service, couche, donne)
        // $('#spinner').show()

        myfactory.post_data('/thematique/define_service/', JSON.stringify(donne)).then(

            function (data) {
                if (requete_reussi(data)) {
                    couche.service_wms = service_wms
                }
                // $('#spinner').hide()
            },
            function (err) {
                // $('#spinner').hide()
                toogle_information('Verifier votre connexion')
            }
        )
    }

    $scope.openGenerateIcons = function (couche, attr) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'assets/admin/views/generateIcons.html',
            controller: 'generateIconsCtrl',
            size: 'lg',
            scope: $scope,
            resolve: {
                items: function () {
                    // console.log(10)
                }
            }
        });

        modalInstance.result.then(function (response) {
            console.log(response)
            // var encodedData = window.btoa(response.circle);
            couche[attr[0]] = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(response.circle)))
            couche[attr[1]] = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(response.rect)))
            console.log(couche[attr])
            couche.generateIcons = response

            // $scope.selected = selectedItem;
        }, function () {
            console.log('Modal dismissed at: ' + new Date())
            // $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.openOrderThematiques = function () {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'assets/admin/views/ordreThematique.html',
            controller: 'ordreThematique',
            size: 'lg',
            scope: $scope,
            resolve: {
                items: function () {
                    // console.log(10)
                }
            }
        });

        modalInstance.result.then(function (response) {
            console.log(response)

        }, function () {
            console.log('Modal dismissed at: ' + new Date())
            // $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.changeLayerThematique = function (sous_thematique_couche, sous_thematique) {
        console.log(sous_thematique_couche, sous_thematique)
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'assets/admin/views/changeLayerThematique.html',
            controller: 'changeLayerThematique',
            size: 'lg',
            scope: $scope,
            resolve: {
                couche: function () {
                    return sous_thematique_couche
                },
                sous_thematique: function () {
                    return sous_thematique
                }
            }
        });

        modalInstance.result.then(function (response) {
            $window.location.reload();

            // for (var i = 0; i < $scope.thematiques.length; i++) {
            //     if ($scope.thematiques[i].sous_thematiques) {
            //         for (var j = 0; j < $scope.thematiques[i].sous_thematiques.length; j++) {
            //             for (var k = 0; k < $scope.thematiques[i].sous_thematiques[j].couches.length; k++) {
            //                 if ($scope.thematiques[i].sous_thematiques[j].couches[k].key_couche == sous_thematique_couche.key_couche) {
            //                     console.log('response,couche')
            //                     $scope.thematiques[i].sous_thematiques[j].couches[k].id_sous_thematique = response.id_sous_thematique
            //                     $scope.thematiques[i].sous_thematiques[j].couches[k].rang_sous = response.rang_sous_them
            //                     // $scope.thematiques[i].sous_thematiques[j].couches[k].nom = "B"
            //                 }
            //             }
            //         }
            //     }
            // }


            // // couche.id_sous_thematique = response.id_sous_thematique
            // // couche.rang_sous = response.rang_sous_them
            // // $scope.page_principale_thematique = !$scope.page_principale_thematique
            // $scope.change_onglet = response.rang_sous_them
            // $scope.page_principale_sous_thematique = !$scope.page_principale_sous_thematique

            // var couche = $scope.get_couche_thematique(sous_thematique_couche.key_couche, true)


            // $scope.$apply()
        }, function () {
            console.log('Modal dismissed at: ' + new Date())
            // $log.info('Modal dismissed at: ' + new Date());
        });
    };


})




var adaptiveInput = app.directive('tagListInput', [function () {
    return {
        priority: 0,
        template: '<div class="tag-list--container">' +
            '  <input type="text" ng-model="inputModel" ng-change="updateList()" ng-blur="cleanList()">' +
            '  <ul class="tag-list--list">' +
            '    <li class="tag-list--item" ng-repeat="item in model track by $index"  ng-click="removeItem($index)"><span ng-bind="item"></span></li>' +
            '  </ul>' +
            '</div>',
        replace: true,
        transclude: false,
        restrict: 'E',
        scope: {
            model: '='
        },
        controller: function ($scope, $element, $attrs) {
            $scope.inputModel = angular.copy($scope.model).join(',');
            $scope.updateList = function () {
                var list = angular.copy($scope.inputModel).split(',');

                for (var i = 0; i < list.length; i++) {
                    list[i] = list[i].trim();
                }

                list = list.reduce(function (a, b) {
                    if (a.indexOf(b) < 0) a.push(b);
                    return a;
                }, []);

                $scope.inputModel = list.join(',');
                list = list.filter(function (e) {
                    return e
                });
                $scope.model = list;
            };
            $scope.cleanList = function () {
                var list = angular.copy($scope.inputModel).split(',');
                list = list.filter(function (e) {
                    return e
                });

                $scope.model = list;
                $scope.inputModel = list.join(',');
            };
            $scope.removeItem = function ($index) {
                $scope.model.splice($index, 1);
                $scope.inputModel = angular.copy($scope.model).join(',');
            };
        }
    };
}]);


app.factory('myfactory', function ($http, $q) {
    var factory = {
        get_data: function (url) {
            var deferred = $q.defer();
            $http.get(url)
                .success(function (data) {
                    deferred.resolve(data)

                })
                .error(function (msg) {
                    deferred.reject(msg)
                })

            return deferred.promise;
        },
        post_data: function (url, data) {
            var deferred = $q.defer();
            $http.post(url, data)
                .success(function (data) {
                    deferred.resolve(data)

                })
                .error(function (msg) {
                    deferred.reject(msg)
                })

            return deferred.promise;
        },
        delete_data: function (url, donne) {
            var deferred = $q.defer();
            var nm = {
                "query": {
                    "match": {
                        'table': donne.table
                    }

                }
            }

            $http.post(url, nm)
                .success(function (data) {
                    deferred.resolve(data)

                })
                .error(function (msg) {
                    deferred.reject(msg)
                })

            return deferred.promise;
        },
        delete: function (url, donne) {
            var deferred = $q.defer();
            var params = {
                "query": {
                    "match": {
                        'shema': donne.shema

                    }
                }
            }
            $http.post(url, params)
                .success(function (data) {
                    deferred.resolve(data)

                })
                .error(function (msg) {
                    deferred.reject(msg)
                })

            return deferred.promise;
        }
    }
    return factory;
})

app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function (file) {
        var fd = new FormData();
        fd.append('file', file);
        //fd.append('name', name);
        $http.post("/user/uploads/", file, {
                transformRequest: angular.identity,
                headers: {
                    'Content-Type': undefined,
                    'Process-Data': false
                }
            })
            .success(function () {
                console.log("Success");
            })
            .error(function () {
                console.log("error");
            });
    }
}]);

app.directive('utilisateurDirective', function () {
    return {
        restrict: 'E',
        templateUrl: 'assets/admin/views/profile.html',
        link: function (scope, element, attrs, rootScope) {

            scope.$watch("page_principale_utilisateur", function (newValue, oldValue) {
                scope.close_modification_utilisateur();
            });

            scope.function_utilisateur = function (id, type) {
                if (id != 'undefined') {
                    scope.utilisateur_modifie = scope.utilisateurs[id]
                }

                if (type == 'modification') {
                    console.log(id, scope.utilisateurs[id], scope.utilisateur_modifie)
                    scope.mode_modification_utilisateur = true
                } else if (type == 'droit') {
                    console.log(scope.utilisateurs[id])
                    scope.mode_droit_utilisateur = true
                } else if (type == 'ajout') {
                    scope.mode_ajout_utilisateur = true
                }
            }


            scope.close_modification_utilisateur = function () {
                scope.mode_modification_utilisateur = false
                scope.mode_droit_utilisateur = false
                scope.mode_ajout_utilisateur = false
                scope.filtre_droit = ''
                scope.mode_ajout_droit_utilisateur = false

                scope.vider_les_variables()
            }


            scope.mode_modification_utilisateur = false
            scope.mode_droit_utilisateur = false
            scope.mode_ajout_utilisateur = false
            scope.mode_ajout_droit_utilisateur = false

            scope.function_droit = function (id) {
                scope.mode_ajout_droit_utilisateur = true
                scope.filtre_droit = ''
            }

            scope.close_ajout_droit_utilisateur = function () {
                scope.mode_ajout_droit_utilisateur = false
            }


            scope.checkbox = function (data, type) {

                if (type == 'couches') {
                    var rpse = true
                    for (var n = 0; n < data.couches.length; n++) {
                        if (data.couches[n].check == false) {
                            rpse = false
                        }
                    }
                    data.active = rpse
                } else if (type == 'sous_thematique') {
                    for (var i = 0; i < data.couches.length; i++) {
                        if (data.active) {
                            if (data.couches[i].check != true) {
                                data.couches[i].check = data.active
                            }
                        } else {
                            data.couches[i].check = data.active
                        }

                    }
                }

            }


        }
    }

})
app.directive('bordDirective', function () {
    return {
        restrict: 'E',
        templateUrl: 'assets/admin/views/bord.html',
        link: function (scope, element, attrs) {

        }
    }

})
app.directive('thematiqueDirective', function () {
    return {
        restrict: 'E',
        templateUrl: 'assets/admin/views/thematique.html',
        link: function (scope, element, attrs) {

            scope.$watch("page_principale_thematique", function (newValue, oldValue) {
                scope.close_modification_thematique();
                scope.nouvelle_thematique = {
                    'nom': '',
                    'img': '',
                    'sous_thematiques': [{
                        'couches': [{
                            'colonnes': [{

                            }]
                        }]
                    }]
                }
                scope.nouvelles_sous_thematique = {
                    'nom': scope.nouvelle_thematique.nom,
                    'img': scope.nouvelle_thematique.img,
                    'couches': [{
                        'colonnes': [{

                        }]
                    }]
                }
                scope.nouvelle_thematique = {
                    'nom': '',
                    'img': '',
                    'sous_thematiques': [{
                        'couches': [{
                            'colonnes': [{

                            }]
                        }]
                    }]
                }

            });

            scope.$watch("page_principale_sous_thematique", function (newValue, oldValue) {
                scope.close_modification_sous_thematique()
                scope.couches = {
                    'couches': [{}]
                }
            })

            scope.$watch("change_onglet", function (newValue, oldValue) {
                scope.sous_themmatique_onglet(newValue)
            })

            scope.couches = {
                'couches': [{}]
            }

            scope.nouvelle_thematique = {
                'nom': '',
                'img': '',
                'sous_thematiques': [{
                    'couches': [{
                        'colonnes': [{

                        }]
                    }]
                }]
            }

            scope.nouvelles_sous_thematique = {
                'nom': scope.nouvelle_thematique.nom,
                'img': scope.nouvelle_thematique.img,
                'couches': [{
                    'colonnes': [{

                    }]
                }]
            }



            scope.function_thematique = function (id, type) {

                if (id != 'undefined') {
                    scope.thematique_couche = scope.thematiques[id]
                }

                if (type == 'modification') {
                    scope.mode_modification_thematique = true
                } else if (type == 'couche') {

                    scope.mode_sous_thematique = true
                    scope.sous_thematique_active = []
                    for (var i = 0; i < scope.thematique_couche.sous_thematiques.length; i++) {
                        scope.thematique_couche.sous_thematiques[i].onglet = false
                    }
                    scope.thematique_couche.sous_thematiques[0].onglet = true
                    scope.sous_thematique_active = scope.thematique_couche.sous_thematiques[0]

                } else if (type == 'ajout') {
                    scope.mode_ajout_thematique = true
                }
            }

            scope.close_modification_thematique = function () {

                scope.mode_modification_thematique = false
                scope.mode_sous_thematique = false
                scope.mode_ajout_thematique = false
            }

            scope.mode_modification_thematique = false
            scope.mode_sous_thematique = false
            scope.mode_ajout_thematique = false
            scope.mode_droit_couche = false
            scope.mode_ajout_couches = false

            scope.sous_themmatique_onglet = function (id) {
                scope.sous_thematique_active = []
                if (scope.thematique_couche && scope.thematique_couche.sous_thematiques) {
                    for (var i = 0; i < scope.thematique_couche.sous_thematiques.length; i++) {
                        if (scope.thematique_couche.sous_thematiques[i].key == id) {
                            scope.thematique_couche.sous_thematiques[i].onglet = true
                            scope.sous_thematique_active = scope.thematique_couche.sous_thematiques[i]
                        } else {
                            scope.thematique_couche.sous_thematiques[i].onglet = false
                        }

                    }
                }

            }

            scope.function_couche = function (id, type) {

                if (id != 'undefined') {

                    if (scope.thematique_couche.sous_thematiques == false) {
                        scope.sous_thematique_couche = scope.thematique_couche.couches[id]
                    } else {
                        scope.sous_thematique_couche = scope.sous_thematique_active.couches[id]
                    }

                }

                if (type == 'modification') {
                    scope.mode_modification_couche = true
                } else if (type == 'droit') {
                    scope.mode_droit_couche = true
                } else if (type == 'ajout') {
                    scope.mode_ajout_sous_thematique = true
                }
            }

            scope.close_modification_sous_thematique = function () {
                console.log('close_modification_thematique')
                scope.mode_modification_couche = false
                scope.mode_droit_couche = false
                scope.mode_ajout_couches = false
            }

            scope.mode_modification_couche = false

            scope.ajout_couches = function (id) {
                scope.mode_ajout_couches = true
                if (scope.thematique_couche.sous_thematiques == false) {
                    scope.sous_thematique_couche = scope.thematique_couche.couches[id]
                } else {
                    scope.sous_themmatique_onglet(id)
                }

            }

        }
    }

})
app.directive('cartesDirective', function () {
    return {
        restrict: 'E',
        templateUrl: 'assets/admin/views/cartes.html',
        link: function (scope, element, attrs) {

            scope.$watch("page_principale_cartes", function (newValue, oldValue) {
                scope.close_modification_cartes();
                scope.nouvelle_cartes = {
                    'nom': '',
                    'img': '',
                    'sous_cartes': [{
                        'couches': [{
                            'colonnes': [{

                            }]
                        }]
                    }]
                }
                scope.nouvelles_sous_cartes = {
                    'nom': scope.nouvelle_cartes.nom,
                    'color': scope.nouvelle_cartes.color,
                    'couches': [{

                    }]
                }
                scope.nouvelle_cartes = {
                    'nom': '',
                    'color': '',
                    'sous_cartes': [{
                        'couches': [{

                        }]
                    }]
                }

            });

            scope.$watch("page_principale_sous_cartes", function (newValue, oldValue) {
                scope.close_modification_sous_cartes()
                scope.couches = {
                    'couches': [{}]
                }
            })

            scope.$watch("change_onglet", function (newValue, oldValue) {
                scope.sous_cartes_onglet(newValue)
            })

            scope.couches = {
                'couches': [{}]
            }

            scope.nouvelle_cartes = {
                'nom': '',
                'color': '',
                'sous_cartes': [{
                    'couches': [{

                    }]
                }]
            }

            scope.nouvelles_sous_cartes = {
                'nom': scope.nouvelle_cartes.nom,
                'color': scope.nouvelle_cartes.color,
                'couches': [{

                }]
            }



            scope.function_cartes = function (id, type) {

                if (id != 'undefined') {
                    scope.cartes_couche = scope.cartes[id]
                }

                if (type == 'modification') {
                    scope.mode_modification_cartes = true
                } else if (type == 'couche') {

                    scope.mode_sous_cartes = true
                    scope.sous_cartes_active = []



                    for (var i = 0; i < scope.cartes_couche.sous_cartes.length; i++) {
                        scope.cartes_couche.sous_cartes[i].onglet = false
                    }
                    scope.cartes_couche.sous_cartes[0].onglet = true
                    scope.sous_cartes_active = scope.cartes_couche.sous_cartes[0]







                } else if (type == 'ajout') {
                    scope.mode_ajout_cartes = true
                }
            }

            scope.close_modification_cartes = function () {
                scope.mode_modification_cartes = false
                scope.mode_sous_cartes = false
                scope.mode_ajout_cartes = false
            }

            scope.mode_modification_cartes = false
            scope.mode_sous_cartes = false
            scope.mode_ajout_cartes = false
            scope.mode_droit_couche_cartes = false
            scope.mode_ajout_couches_cartes = false




            scope.sous_cartes_onglet = function (id) {
                scope.sous_cartes_active = []
                if (scope.cartes_couche && scope.cartes_couche.sous_cartes) {
                    for (var i = 0; i < scope.cartes_couche.sous_cartes.length; i++) {
                        if (scope.cartes_couche.sous_cartes[i].key == id) {
                            scope.cartes_couche.sous_cartes[i].onglet = true
                            scope.sous_cartes_active = scope.cartes_couche.sous_cartes[i]
                        } else {
                            scope.cartes_couche.sous_cartes[i].onglet = false
                        }

                    }
                }

            }

            scope.function_couche = function (id, type) {

                if (id != 'undefined') {

                    if (scope.cartes_couche.sous_cartes == false) {
                        scope.sous_cartes_couche = scope.cartes_couche.couches[id]
                    } else {
                        scope.sous_cartes_couche = scope.sous_cartes_active.couches[id]
                    }

                }

                if (type == 'modification') {
                    scope.mode_modification_couche_cartes = true
                } else if (type == 'droit') {
                    scope.mode_droit_couche_cartes = true
                } else if (type == 'ajout') {
                    scope.mode_ajout_sous_cartes = true
                }
            }

            scope.close_modification_sous_cartes = function () {
                scope.mode_modification_couche = false
                //scope.mode_droit_couche =   false

                scope.mode_modification_couche_cartes = false
                scope.mode_droit_couche_cartes = false
                scope.mode_ajout_couches_cartes = false
            }

            scope.mode_modification_couche_cartes = false

            scope.ajout_couches = function (id) {
                scope.mode_ajout_couches_cartes = true
                if (scope.cartes_couche.sous_cartes == false) {
                    scope.sous_cartes_couche = scope.cartes_couche.couches[id]
                } else {
                    scope.sous_cartes_onglet(id)
                }

            }

        }
    }

})

app.directive('ngFiles', ['$parse', function ($parse) {

    function file_links(scope, element, attrs) {
        var onChange = $parse(attrs.ngFiles);
        element.on('change', function (event) {
            onChange(scope, {
                $files: event.target.files
            });
        });
    }

    return {
        link: file_links
    }
}]);