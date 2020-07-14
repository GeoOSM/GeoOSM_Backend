
var app = angular.module('monapp', ['ui.bootstrap', 'ngRoute', 'openlayers-directive', 'rzModule', 'mgcrea.ngStrap','ngAnimate', 'ngSanitize','ngExcel'])

app.config(function($typeaheadProvider) {
  angular.extend($typeaheadProvider.defaults, {
    onSelect:function () {
       // console.log(effectuer_requete() )
    },
    limit: 8 
  });
})
app.config(function ($routeProvider) {
    $routeProvider
        .when('/', { templateUrl: 'assets/views/main.html' })
        .otherwise({ redirectTo: '/' })
})

app.controller('mainCtrl', function ($scope, olData, $sce, myfactory, $window, $templateCache,$timeout) {

    $scope.black = "#434343"
    $scope.red = "#F10E29"
    $scope.check_all = "check_all"
    $scope.div_edit=false

    


    $scope.change_menu = function (e) {


        if ($('.menu-active').css('left') != '0px') {
            $('.menu-active').css('right', '0')
            $('.menu-active').css('left', '0')
            $('.menu-active').css('display', 'block')
            $('.barniere-menu-img').css('transform', 'rotate(0deg)')

            $('.zooms').css('left', '320px')
            $('.ol-scale-line').css('left', '450px')
            $('#mouse-position').css('left', '290px')


        }

        var string = e.currentTarget.className,
        substring = "back_black";
        string.indexOf(substring) !== -1;

        if (string.indexOf(substring) == -1 && e.currentTarget.dataset.menu == 'menu-thematiques'){
            $scope.reset_layers()
        }

        $('.onglets-child').removeClass('back_black')
        $('.onglets-child').addClass('back_red')
        $('.menu-child').removeClass('menu-active')

        e.currentTarget.className += " back_black";
        setTimeout(function () {
            $('.' + e.currentTarget.dataset.menu).addClass('menu-active')
        }, 300);
    }

    $scope.menu_settings = function () {
        if ($scope.settings_active) {
            $('#section-droite').css('width', '50px')
        } else {

            $('#section-droite').css('width', '250px')
        }
        $scope.settings_active = !$scope.settings_active
    }

    $scope.close_menu_gauche = function () {
        if ($('.menu-active').css('left') == '0px') {
            $('.menu-active').css('right', 'unset')
            $('.menu-active').css('left', '-400%')
            $('.menu-active').css('display', 'none')
            $('.barniere-menu-img').css('transform', 'rotate(90deg)')
            $('.ol-scale-line').css('left', '220px')
            $('#mouse-position').css('left', '60px')
            $('.zooms').css('left', '60px')
        } else {
            $('.menu-active').css('right', '0')
            $('.menu-active').css('left', '0')
            $('.menu-active').css('display', 'block')
            $('.ol-scale-line').css('left', '450px')
            $('#mouse-position').css('left', '290px')
            $('.barniere-menu-img').css('transform', 'rotate(0deg)')

            $('.zooms').css('left', '320px')
        }
    }

    $scope.open_boite_login = function () {
        if ($('.login').css('display') == 'none') {
            $('.login').css('display', 'block')
        } else {
            $('.login').css('display', 'none')
        }

    }

    $scope.fonds_cartes = [
        {
            id: 0,
            nom: 'Fonds de bases',
            image: 'assets/images/fonds_cartes/fond.png',
            active: true,
            fonds: [
                {
                    nom: 'Fond - CUY',
                    id: 0,
                    tuile_nom: 'mbTiles_topo',
                    image: 'assets/images/fonds_cartes/fond.png',
                    ordre: 1,
                    value: 100,
                    option: {
                        showSelectionBar: true,
                        floor: 0,
                        ceil: 100,
                        id: '00',
                        onChange: function (sliderId, modelValue) {
                            $scope.slide_on(sliderId, modelValue)
                        }
                    }
                }]
        },
        {
            id: 1,
            nom: 'Images satellite',
            image: 'assets/images/fonds_cartes/sat.png',
            active: false,
            fonds: [
                {
                    nom: 'Pléiade RS 3cm',
                    tuile_nom: 'mbTiles_sat',
                    id: 0,
                    image: 'assets/images/fonds_cartes/sat.png',
                    ordre: 1,
                    value: 100,
                    option: {
                        showSelectionBar: true,
                        floor: 0,
                        ceil: 100,
                        id: '10',
                        onChange: function (sliderId, modelValue) {
                            $scope.slide_on(sliderId, modelValue)
                        }
                    }
                }
            ]
        }


    ]

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                         //function pour avoir le catalogue de donnee
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function cataloguerColones(id_theme,champ,sous_thematiques){
       
        var nouveau_champ = []

        if (sous_thematiques != null) {
            angular.forEach($scope.catalogueDonne.catalogue_sous_thematiques, function (item,y) {
                           console.log() 
                if (id_theme == y) {
                    k=0
                    angular.forEach(champ, function (val,champZ) {
                        a={}
                        a["champ"] = champZ
                        a["aliase"] = champZ
                        nouveau_champ.push(a)

                        for (var x = 0; x < item.length; x++) {
                            if (nouveau_champ[k]["champ"] ==  item[x].champ) {
                               nouveau_champ[k]["aliase"]=item[x].aliase
                            }
                        }
                        k++
                    })

                }

            })
        }else{
            angular.forEach($scope.catalogueDonne.catalogue_thematiques, function (item,y) {
                            
                if (id_theme == y) {
                    k=0
                    angular.forEach(champ, function (val,champZ) {
                        a={}
                        a["champ"] = champZ
                        a["aliase"] = champZ
                        nouveau_champ.push(a)

                        for (var x = 0; x < item.length; x++) {
                            if (nouveau_champ[k]["champ"] ==  item[x].champ) {
                               nouveau_champ[k]["aliase"]=item[x].aliase
                            }
                        }
                        k++
                    })

                   
                }
            })
        }

        if (nouveau_champ.length == 0) {
           angular.forEach(champ, function (val,champZ) {
                        a={}
                        a["champ"] = champZ
                        a["aliase"] = champZ
                        nouveau_champ.push(a)
            })
        }

        console.log(nouveau_champ)

        $scope.catalogue = nouveau_champ
        
 }

    function getCatalogueDonne(){
        myfactory.data('/thematique/getCatalogueDonne/').then(
            function(data){
                data_catalogue_sous_thematiques = data.catalogue_sous_thematiques
                data_catalogue_thematiques = data.catalogue_thematiques

                catalogue_sous_thematiques = []
                catalogue_thematiques = []

                for (var i = 0; i < data_catalogue_sous_thematiques.length; i++) {

                    catalogue_sous_thematiques[data_catalogue_sous_thematiques[i].id_theme]=[]
                    
                    for (var j = 0; j < data_catalogue_sous_thematiques.length; j++) {
                        if (data_catalogue_sous_thematiques[i].id_theme == data_catalogue_sous_thematiques[j].id_theme) {

                            catalogue_sous_thematiques[data_catalogue_sous_thematiques[i].id_theme].push(data_catalogue_sous_thematiques[j])
                        }
                    }
                    
                }

                for (var i = 0; i < data_catalogue_thematiques.length; i++) {

                    catalogue_thematiques[data_catalogue_thematiques[i].id_theme]=[]
                    
                    for (var j = 0; j < data_catalogue_thematiques.length; j++) {
                        if (data_catalogue_thematiques[i].id_theme == data_catalogue_thematiques[j].id_theme) {

                            catalogue_thematiques[data_catalogue_thematiques[i].id_theme].push(data_catalogue_thematiques[j])
                        }
                    }
                    
                }

                $scope.catalogueDonne = {
                    "catalogue_sous_thematiques":   catalogue_sous_thematiques,
                    "catalogue_thematiques":   catalogue_thematiques
                }
            },
            function(err){
                alert(err)
            }
        )
    }
    
    getCatalogueDonne()


    olData.getMap().then(function (map) {

        var view = new ol.View({
            center: ol.proj.transform([11.5218, 3.8612], 'EPSG:4326', 'EPSG:3857'),
            zoom: 13
        })
        map.setView(view)
        map.addInteraction(new ol.interaction.MouseWheelZoom())

        map.getLayers().forEach(function (layer) {
            layer.setVisible(false)
        })



        var target = map.getTarget();
        var jTarget = typeof target === "string" ? $("#" + target) : $(target);

        $(map.getViewport()).on('mousemove', function (e) {
            var pixel = map.getEventPixel(e.originalEvent);
            var hit = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
                return true;
            });
            if (hit) {
                jTarget.css("cursor", "pointer");
            } else {
                jTarget.css("cursor", "");
            }
        });

        /*----------------Drag event-----------------*/
        /*-------------------------------------------*/

        var app = {};



        app.Drag = function () {

            ol.interaction.Pointer.call(this, {
                handleDownEvent: app.Drag.prototype.handleDownEvent,
                handleDragEvent: app.Drag.prototype.handleDragEvent,
                handleMoveEvent: app.Drag.prototype.handleMoveEvent,
                handleUpEvent: app.Drag.prototype.handleUpEvent
            });


            this.coordinate_ = null;


            this.cursor_ = 'pointer';


            this.feature_ = null;


            this.previousCursor_ = undefined;

        };

        ol.inherits(app.Drag, ol.interaction.Pointer);


        app.Drag.prototype.handleDownEvent = function (evt) {
            var mapx = evt.map;

            var feature = mapx.forEachFeatureAtPixel(evt.pixel,
                function (feature) {
                    return feature;
                });


            if (feature) {
                this.coordinate_ = evt.coordinate;
                this.feature_ = feature;
            }

            return !!feature;
        };



        app.Drag.prototype.handleDragEvent = function (evt) {
            var deltaX = evt.coordinate[0] - this.coordinate_[0];
            var deltaY = evt.coordinate[1] - this.coordinate_[1];

            var geometry =
                (this.feature_.getGeometry());
            geometry.translate(deltaX, deltaY);

            this.coordinate_[0] = evt.coordinate[0];
            this.coordinate_[1] = evt.coordinate[1];
        };



        app.Drag.prototype.handleMoveEvent = function (evt) {
            if (this.cursor_) {
                var mapx = evt.map;
                var feature = mapx.forEachFeatureAtPixel(evt.pixel,
                    function (feature) {
                        return feature;
                    });
                var element = evt.map.getTargetElement();
                if (feature) {
                    if (element.style.cursor != this.cursor_) {
                        this.previousCursor_ = element.style.cursor;
                        element.style.cursor = this.cursor_;
                    }
                } else if (this.previousCursor_ !== undefined) {
                    element.style.cursor = this.previousCursor_;
                    this.previousCursor_ = undefined;
                }
            }
        };



        app.Drag.prototype.handleUpEvent = function () {
            this.coordinate_ = null;
            this.feature_ = null;
            return false;
        };






        
        
        $scope.objects = []

        function fd_aliase(objet_catalogue) {

           
            //console.log(objet_catalogue)

            $scope.objects = []
           
            var nouveau_champ = []
             //console.log($scope.catalogueDonne.catalogue_sous_thematiques[objet_catalogue.key_couche])
            if (objet_catalogue.sous_thematique != null) {
               
                              
                    if ($scope.catalogueDonne.catalogue_sous_thematiques[objet_catalogue.key_couche]) {
                        k=0
                        angular.forEach(objet_catalogue, function (val,champZ) {
                           
                            if (champZ != 'sous_thematique' && champZ != 'key_couche') {
                                nouveau_champ.push({ 'index': champZ, 'val': val, 'als': champZ  })
                            }

                            for (var x = 0; x < $scope.catalogueDonne.catalogue_sous_thematiques[objet_catalogue.key_couche].length; x++) {
                                //console.log(champZ,$scope.catalogueDonne.catalogue_sous_thematiques[objet_catalogue.key_couche][x]["aliase"])
                                if ($scope.catalogueDonne.catalogue_sous_thematiques[objet_catalogue.key_couche][x]["aliase"] == champZ) {
                                    //console.log(champZ,$scope.catalogueDonne.catalogue_sous_thematiques[objet_catalogue.key_couche][x]["champ"])
                                    nouveau_champ[k]["index"] = $scope.catalogueDonne.catalogue_sous_thematiques[objet_catalogue.key_couche][x]["champ"]
                                    // if ($scope.catalogueDonne.catalogue_sous_thematiques[objet_catalogue.key_couche][x].champ_principal == "true") {
                                    //    nouveau_champ[k]["keyRequete__78"] = $scope.catalogueDonne.catalogue_sous_thematiques[objet_catalogue.key_couche][x]["aliase"]
                                    // } $scope.catalogueDonne.catalogue_sous_thematiques[objet_catalogue.key_couche][x].champ == champZ
                                    
                                }
                            }
                            k++
                        })

                    }else{
                        angular.forEach(objet_catalogue, function (val,champZ) {
                           
                            if (champZ != 'sous_thematique' && champZ != 'key_couche') {
                                nouveau_champ.push({ 'index': champZ, 'val': val, 'als': champZ  })
                            }

                        })
                    }

              
            }else{
               if ($scope.catalogueDonne.catalogue_thematiques[objet_catalogue.key_couche]) {
                        k=0
                    angular.forEach(objet_catalogue, function (val,champZ) {
                           
                        if (champZ != 'sous_thematique' && champZ != 'key_couche') {
                                nouveau_champ.push({ 'index': champZ, 'val': val, 'als': champZ  })
                            }

                            for (var x = 0; x < $scope.catalogueDonne.catalogue_thematiques[objet_catalogue.key_couche].length; x++) {
                               
                                if ($scope.catalogueDonne.catalogue_thematiques[objet_catalogue.key_couche][x].aliase == champZ) {

                                    nouveau_champ[k]["index"] = $scope.catalogueDonne.catalogue_thematiques[objet_catalogue.key_couche][x]["champ"]
                                    // if ($scope.catalogueDonne.catalogue_thematiques[objet_catalogue.key_couche][x].champ_principal == "true") {
                                    //     nouveau_champ[k]["keyRequete__78"] = $scope.catalogueDonne.catalogue_thematiques[objet_catalogue.key_couche][x]["aliase"]
                                    // }$scope.catalogueDonne.catalogue_thematiques[objet_catalogue.key_couche][x].champ == champZ
                                   
                                }
                            }
                        k++
                    })

                }else{
                        angular.forEach(objet_catalogue, function (val,champZ) {
                            if (champZ != 'sous_thematique' && champZ != 'key_couche') {
                                nouveau_champ.push({ 'index': champZ, 'val': val, 'als': champZ  })
                            }
                            

                        })
                    }
            }
            
            //console.log(nouveau_champ)
             $scope.objects = nouveau_champ

            $scope.$apply()
        }

       
        function fd_aliase_return(objet) {
            
           
           
            var nouveau_champ ={}
             //console.log($scope.catalogueDonne.catalogue_sous_thematiques[objet.key_couche])
            if (objet.sous_thematique != null) {
               
                              
                    if ($scope.catalogueDonne.catalogue_sous_thematiques[objet.key_couche]) {
                        k=0
                        angular.forEach(objet, function (val,champZ) {
                           
                            if (champZ != 'sous_thematique' && champZ != 'key_couche') {
                                nouveau_champ[champZ] = val
                                //nouveau_champ.push({ 'index': champZ, 'val': val, 'als': champZ  })
                            }

                            for (var x = 0; x < $scope.catalogueDonne.catalogue_sous_thematiques[objet.key_couche].length; x++) {
                               
                                if ($scope.catalogueDonne.catalogue_sous_thematiques[objet.key_couche][x].champ == champZ) {
                                    delete  nouveau_champ[champZ]
                                    nouveau_champ[$scope.catalogueDonne.catalogue_sous_thematiques[objet.key_couche][x]["aliase"]] =val
                                    if ($scope.catalogueDonne.catalogue_sous_thematiques[objet.key_couche][x].champ_principal == "true") {
                                        nouveau_champ["keyRequete__78"] =val
                                    }
                                }
                            }
                            k++
                        })

                    }else{
                        angular.forEach(objet, function (val,champZ) {
                           
                            if (champZ != 'sous_thematique' && champZ != 'key_couche') {
                                nouveau_champ[champZ] = val
                                //nouveau_champ.push({ 'index': champZ, 'val': val, 'als': champZ  })
                            }

                        })
                    }

              
            }else{
               if ($scope.catalogueDonne.catalogue_thematiques[objet.key_couche]) {
                        k=0
                    angular.forEach(objet, function (val,champZ) {
                           
                        if (champZ != 'sous_thematique' && champZ != 'key_couche') {
                               nouveau_champ[champZ] = val
                            }

                            for (var x = 0; x < $scope.catalogueDonne.catalogue_thematiques[objet.key_couche].length; x++) {
                               
                                if ($scope.catalogueDonne.catalogue_thematiques[objet.key_couche][x].champ == champZ) {
                                    delete  nouveau_champ[champZ]
                                    nouveau_champ[$scope.catalogueDonne.catalogue_thematiques[objet.key_couche][x]["aliase"]] =val
                                    if ($scope.catalogueDonne.catalogue_thematiques[objet.key_couche][x].champ_principal == "true") {
                                        nouveau_champ["keyRequete__78"] =val
                                    }
                                     

                                }
                            }
                        k++
                    })

                }else{
                        angular.forEach(objet, function (val,champZ) {
                            if (champZ != 'sous_thematique' && champZ != 'key_couche') {
                                 nouveau_champ[champZ] = val
                            }
                            

                        })
                    }
            }
           
            return nouveau_champ
          
        }


        function fd_aliase_add() {

            $scope.objects = []

            var layer =  $scope.couche.id_couche;
            var shema = $scope.couche.shema;
            var geom = $scope.couche.geom;
            var images_theme = $scope.couche.image_src;
            var contour = $scope.couche.contour;
            var remplir = $scope.couche.remplir;
            var opacity = $scope.couche.opacity;
            
           
            document.getElementById("SlideAddEntite").style.top = "0px";
            map.removeInteraction(draw);

            map.getLayers().forEach(function (layer) {
                if (layer.get('name') == $scope.couche.id_couche) {

                    if (layer.getSource().getFeatures()[0].getGeometry().getType() == "Polygon" || layer.getSource().getFeatures()[0].getGeometry().getType() == "LineString" ) {
                        var properties = layer.getSource().getFeatures()[0].getProperties() .champ_catalogue
                    } else if(layer.getSource().getFeatures()[0].getGeometry().getType() == "Point") {
                         var properties = layer.getSource().getFeatures()[0].getProperties().features[0].getProperties().champ_catalogue
                    }

                    console.log( layer.getSource().getFeatures()[0].getGeometry().getType() , layer.getSource().getFeatures()[0].getProperties() )


                   angular.forEach( properties, function (val,index) {
                         if (index != 'sous_thematique' && index != 'key_couche' && index != 'keyRequete__78') {
                             properties[index] = ''
                         }
                        
                   })

                   fd_aliase(properties)

                }

            });

            /*myfactory.data("api/v1/RestFull/Catalog/aliase/" + shema + "/" + layer).then(function (data) {

                for (var i = 0; i < data.length; i++) {

                    if (data[i]["champ"] != "id" && data[i]["champ"] != "geom" && data[i]["champ"] != "geometry") {

                        $scope.objects.push({ 'index': data[i]["champ"], 'val': null, 'als': data[i]["aliase"] })

                    }

                }
                if ($scope.objects.length == 0) {

                    myfactory.data("api/v1/RestFull/column_name/" + shema + "/" + layer).then(function (datax) {

                        for (var i = 0; i < datax.length; i++) {

                            if (datax[i]["column_name"] != "id" && datax[i]["column_name"] != "geom" && datax[i]["column_name"] != "geometry") {

                                $scope.objects.push({ 'index': datax[i]["column_name"], 'val': null, 'als': datax[i]["column_name"] })

                            }
                        }

                        document.getElementById("SlideAddEntite").style.top = "0px";
                        map.removeInteraction(draw);
                    }, function (msg) {
                        map.removeInteraction(draw);
                        $scope.Msg = "Réssayer,le serveur ne répond pas";
                        document.getElementById("FourmErrs").style.top = "0px";

                    });
                }

            }, function (msg) {
                map.removeInteraction(draw);
                $scope.add_active = false;
                $scope.Msg = "Réssayer,le serveur ne répond pas";
                document.getElementById("FourmErrs").style.top = "0px";

            });

            $scope.$apply()*/
        }





        function fd(objet) {
            $scope.objects = []


            $.each(objet, function (index, val) {

                $scope.objects.push({ 'index': index, 'val': val })

            });

            $scope.$apply()
        }


        var scale = new ol.control.ScaleLine({
            target: document.getElementById("scaleline"),
            units: 'metric'
        });
        map.addControl(scale);
        var mousePosition = new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(4),
            projection: 'EPSG:4326',
            target: document.getElementById('mouse-position'),
            className: 'custom-mouse-position',
            undefinedHTML: 'WGS84'
        });

        map.addControl(mousePosition);

        $scope.zoomIN = function () {
            var zoom = ol.animation.zoom({
                resolution: map.getView().getResolution()
            });
            map.beforeRender(zoom);

            map.getView().setResolution(map.getView().getResolution() * 0.5);



        }
        $scope.zoomOUT = function () {

            var zoom = ol.animation.zoom({
                resolution: map.getView().getResolution()
            });
            map.beforeRender(zoom);

            map.getView().setResolution(map.getView().getResolution() * 2);


        }
        $scope.extend = function () {

            map.getView().setCenter(ol.proj.transform([12.59521, 7.02479], 'EPSG:4326', 'EPSG:3857'));
            map.getView().setZoom(6);

        }



        function menu() {

            if ($('.menu-active').css('left') == '0px') {
                $('.menu-active').css('right', 'unset')
                $('.menu-active').css('left', '-400%')
                $('.menu-active').css('display', 'none')
                $('.barniere-menu-img').css('transform', 'rotate(90deg)')
                $('.zooms').css('left', '60px')
                $('.ol-scale-line').css('left', '220px')
                $('#mouse-position').css('left', '60px')
            }

        }

        $scope.active_delete = function () {
            console.log('0')

            if ($scope.delete_active) {

                map.removeInteraction(draw)
                map.removeInteraction(select)
                map.removeInteraction(modify)

            }

        }

        function desactivate_an_icon() {

            map.getLayers().forEach(function (layer) {
                if (layer.get('name') == "activate_icon") {
                    map.removeLayer(layer)
                }

            });
        }

        function activate_an_icon(coordinate,type) {

            desactivate_an_icon()

            if (type == 'Point') {

                var features = []
                var newMarker = new ol.Feature({
                    geometry: new ol.geom.Point(coordinate),
                });
                features[0] = newMarker;


                var markerSource = new ol.source.Vector({
                    features: features
                });

                var LayTheCopy = new ol.layer.Vector({
                    source: markerSource,
                    style: function (feature) {
                        style = new ol.style.Style({
                            image: new ol.style.Circle({
                                radius: 24,
                                //fill: new ol.style.Fill({color: 'red'}),
                                stroke: new ol.style.Stroke({
                                    color: '#1CAC77',
                                    width: 5,
                                    //lineCap :'butt',
                                    //lineDash :[4],
                                })
                            })
                        });

                        return style;
                    },
                })

            } else {

                var features = []

                if (type == 'Polygon'){
                    var newMarker = new ol.Feature({
                        geometry: new ol.geom.LineString(coordinate[0]),
                    }); 
                }else{
                    var newMarker = new ol.Feature({
                        geometry: new ol.geom.LineString(coordinate),
                    });
                }
                
                features[0] = newMarker;


                var markerSource = new ol.source.Vector({
                    features: features
                });

                 var myStyle = new ol.style.Style({
                       
                        stroke: new ol.style.Stroke({
                            color: '#1CAC77',
                            width: 5
                        }),
                        
                    });

                var LayTheCopy = new ol.layer.Vector({
                    source: markerSource,
                    style : myStyle
                })
            }
           
             LayTheCopy.set('name', "activate_icon");
                map.addLayer(LayTheCopy);
        }

         var popup_lot = new ol.Overlay({
          element: document.getElementById('popup_lot'),
          stopEvent: true
        });
        map.addOverlay(popup_lot); 


        $(map.getViewport()).on('mousemove', function (e) {
            
             var pixel = map.getEventPixel(e.originalEvent);

            var feature = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
              
                 return feature;
            });
            
            if (feature && feature.U.hasOwnProperty("features")) {
                 obj = feature.U["features"][0].U;
                 if (obj.hasOwnProperty("pointAttributes")) {
                    if (feature.U["features"][0].U["pointAttributes"]["name"] != "SearchGps4326" || feature.U["features"][0].U["pointAttributes"]["name"] != "locationGps4326") {
                        if (feature.U["features"].length == 1) {
                            if (feature.U["features"][0].U['champ_catalogue']) {
                                donne = feature.U["features"][0].U['champ_catalogue']
                            } else {
                                 donne = feature.U["features"][0].U['data']
                            }
                            if(donne['keyRequete__78']){
                                 $('#popup_infos_contain').text(donne['keyRequete__78'])
                                 map.addOverlay(popup_lot);
                                  var coordinate = feature.getGeometry().getCoordinates() ;
                                  popup_lot.setPosition(coordinate);
                            }
                           

                        }
                    }
                 }
            }else{
                $('#popup_infos_contain').text('')
                map.removeOverlay(popup_lot);
            }

        })

        map.on('click', function (evt) {
            map.removeOverlay(popup_adressage)
            //console.log(map.getView().getResolution())
            var feature = map.forEachFeatureAtPixel(evt.pixel,
                function (feature, layer) {
                    return feature;
                });

            var layer = map.forEachFeatureAtPixel(evt.pixel,
                function (feature, layer) {
                    return layer;
                });
            if ($scope.delete_active == false) { 

                if ($scope.attribute_active == false && $scope.edit_active == false) {

                    if (feature && feature.U.hasOwnProperty("features")) {
                        obj = feature.U["features"][0].U;
                        if (obj.hasOwnProperty("pointAttributes")) {


                            if (feature.U["features"][0].U["pointAttributes"]["name"] != "SearchGps4326" || feature.U["features"][0].U["pointAttributes"]["name"] != "locationGps4326") {

                                if (feature.U["features"].length == 1) { 
                                   
                                    if (feature.U["features"][0].U["champ_catalogue"].type && feature.U["features"][0].U["champ_catalogue"].type =="couche_adresse" ) {
                                        map.addOverlay(popup_adressage);
                                        popup_adressage.setPosition(feature.getGeometry().getCoordinates());
                                        $scope.details_result_adresse = feature.U["features"][0].U["champ_catalogue"]
                                    }else{

                                    
                                        $scope.shema = layer.get("shema");
                                        $scope.table = layer.get("name");
                                        fd_aliase(feature.U["features"][0].U["champ_catalogue"])

                                        //$scope.catalogue_donnes =feature.U["features"][0].U["data"]
                                        
                                        menu();
                                        $("#disabled_div").css("left", "0px")
                                        document.getElementById("SlideFourm").style.top = "0px";

                                        $scope.editer_la_couche = {
                                            'id_thematique':layer.get("id_thematique"),
                                            'sous_thematique':layer.get("sous_thematique"),
                                            'id_couche':feature.U["features"][0].U["champ_catalogue"].key_couche
                                        }

                                        $scope.feature = feature.U["features"][0]
                                        activate_an_icon(feature.getGeometry().getCoordinates(),feature.getGeometry().getType())
                                        
                                    }
                                    
                                    $scope.$apply()
                                   
                                } else {


                                    var zoom = ol.animation.zoom({
                                        resolution: map.getView().getResolution()
                                    });
                                    map.beforeRender(zoom);

                                    map.getView().setResolution(map.getView().getResolution() * 2);

                                    map.getView().setCenter(evt.coordinate);
                                    map.getView().setZoom(map.getView().getZoom() + 3);
                                }
                            }
                        }

                    } else {

                        if (feature && $scope.add_active == false && layer) {

                            if (layer.get("name") != 'vect_point' && layer.get("name") != 'vect_polygon' && layer.get("name") != 'vect_line') {

                            
                                $scope.shema = layer.get("shema");
                                $scope.table = layer.get("name"); 
                                fd_aliase(feature.U["champ_catalogue"]);
                              //  $scope.catalogue_donnes =feature.U["data"]
                                menu();

                                $scope.editer_la_couche = {
                                            'id_thematique':layer.get("id_thematique"),
                                            'sous_thematique':layer.get("sous_thematique"),
                                            'id_couche':feature.U["champ_catalogue"].key_couche 
                                }
                                   $scope.feature = feature         
                                 activate_an_icon(feature.getGeometry().getCoordinates(),feature.getGeometry().getType())

                                document.getElementById("SlideFourm").style.top = "0px";
                            }
                        }

                    }

                } else if ($scope.edit_active == false) { 

                    var feature = map.forEachFeatureAtPixel(evt.pixel,
                        function (feature, layer) {

                            return feature;

                        });

                    var layer = map.forEachFeatureAtPixel(evt.pixel,
                        function (feature, layer) {
                            return layer;
                        });


                    if (feature && feature.U.hasOwnProperty("features")) {

                        obj = feature.U["features"][0].U;

                        if (obj.hasOwnProperty("pointAttributes")) {

                            if (feature.U["features"][0].U["pointAttributes"]["name"] != "SearchGps4326" || feature.U["features"][0].U["pointAttributes"]["name"] != "locationGps4326") {

                                if (feature.U["features"].length == 1 && layer.get("name") == $scope.couche.id_couche) {
                                    $scope.shema = layer.get("shema"); 
                                    $scope.table = layer.get("name");
                                    $scope.id = feature.U["features"][0].U["data"]["id"];
                                    fd_aliase(feature.U["features"][0].U["champ_catalogue"])
                                    // $scope.catalogue_donnes =feature.U["features"][0].U["data"]
                                    menu();
                                    $scope.editer_la_couche = {
                                        'id_thematique':layer.get("id_thematique"),
                                        'sous_thematique':layer.get("sous_thematique"),
                                        'id_couche':feature.U["features"][0].U["data"]["key_couche"]
                                    }
                                    $scope.feature = feature.U["features"][0]   
                                    activate_an_icon(feature.getGeometry().getCoordinates(),feature.getGeometry().getType())
                                    document.getElementById("SlideEditAttribute").style.top = "0px";
                                } else if (feature.U["features"].length == 1 && layer.get("name") != $scope.couche.id_couche) {
                                    $scope.shema = layer.get("shema");
                                    $scope.table = layer.get("name");
                                    $scope.id = feature.U["features"][0].U["data"]["id"];
                                    fd_aliase(feature.U["features"][0].U["champ_catalogue"])
                                    // $scope.catalogue_donnes =feature.U["features"][0].U["data"]
                                    menu();

                                    document.getElementById("SlideFourm").style.top = "0px";

                                } else {

                                    var zoom = ol.animation.zoom({
                                        resolution: map.getView().getResolution()
                                    });
                                    map.beforeRender(zoom);

                                    map.getView().setResolution(map.getView().getResolution() * 2);

                                    map.getView().setCenter(evt.coordinate);
                                    map.getView().setZoom(map.getView().getZoom() + 3);


                                }
                            }
                        }
                    } else {

                        if (feature && layer.get("name") == $scope.couche.id_couche) {
                            $scope.shema = layer.get("shema");
                            $scope.table = layer.get("name");
                            $scope.id = feature.U["data"]["id"];
                            fd_aliase(feature.U["champ_catalogue"]);
                            // $scope.catalogue_donnes =feature.U["data"]
                            menu();

                            document.getElementById("SlideEditAttribute").style.top = "0px";

                        }

                        if (feature && layer.get("name") != $scope.couche.id_couche) {
                            $scope.shema = layer.get("shema");
                            $scope.table = layer.get("name");
                            $scope.id = feature.U["data"]["id"];
                            fd_aliase(feature.U["champ_catalogue"]);
                            //$scope.catalogue_donnes =feature.U["data"]
                            menu();
                            document.getElementById("SlideFourm").style.top = "0px";

                        }
                    }
                }

            } else {
                if (feature && feature.U.hasOwnProperty("features")) {

                    if (feature.U["features"].length == 1) {
                        $scope.shema = layer.get("shema");
                        $scope.table = layer.get("name");
                        $scope.id = feature.U["features"][0].U["data"]["id"];

                      

                        

                  
                        bootbox.confirm("Confirmez la suppression", function (result) {

                            if (result == true) {

                                $("#loading").show();
                                myfactory.post_data("deleteEntite", { "id": $scope.id, "shema": $scope.shema, "table": $scope.table }).then(function (resp) {
                                   
                                    Updatelayer($scope.shema, $scope.table);
                                    $scope.Msg = "Entité est supprimée avec succès";
                                    document.getElementById("FourmSuc").style.top = "0px";
                                    $("#loading").hide();
                                    setTimeout(function () { document.getElementById("FourmSuc").style.top = "-150px"; }, 3000);

                                }, function (msg) {
                                    $("#loading").hide();
                                    $scope.Msg = "Ressayer,le serveur ne répond pas";
                                    document.getElementById("FourmErrs").style.top = "0px";

                                });

                            }
                        });
                    } else {

                        var zoom = ol.animation.zoom({
                            resolution: map.getView().getResolution()
                        });
                        map.beforeRender(zoom);

                        map.getView().setResolution(map.getView().getResolution() * 2);

                        map.getView().setCenter(evt.coordinate);
                        map.getView().setZoom(map.getView().getZoom() + 3);


                    }

                } else {

                    $scope.shema = layer.get("shema");
                    $scope.table = layer.get("name");
                    $scope.id = feature.U["data"]["id"];

                    

                    bootbox.confirm("Confirmez la suppression", function (result) {

                        if (result == true) {

                            $("#loading").show();
                            myfactory.post_data("deleteEntite", { "id": $scope.id, "shema": $scope.shema, "table": $scope.table }).then(function (resp) {

                                Updatelayer($scope.shema, $scope.table);
                                $scope.Msg = "Entité est supprimée avec succès";
                                document.getElementById("FourmSuc").style.top = "0px";
                                $("#loading").hide();
                                setTimeout(function () { document.getElementById("FourmSuc").style.top = "-150px"; }, 3000);

                            }, function (msg) {
                                $("#loading").hide();
                                $scope.Msg = "Ressayer,le serveur ne répond pas";
                                document.getElementById("FourmErrs").style.top = "0px";

                            });
                        }
                    });
                }
            }
        });

        $scope.fermerFicheAttributs = function () {

            document.getElementById("SlideEditAttribute").style.top = "-450px";
            desactivate_an_icon()
           
        }


        /*--------------------------------mbtiles--------------------------------------------------*/
        /*-----------------------------------------------------------------------------------------*/

        var mbTiles_sat = new ol.layer.Tile({
            visible: false,
            source: new ol.source.XYZ({

                url: "tiles/{z}/{x}/{y}.png",
                tileLoadFunction: function (imageTile, src) {
                    imageTile.getImage().src = src;
                },
                crossOrigin: "anonymous"
            })
        })

        map.addLayer(mbTiles_sat);
        mbTiles_sat.set("name", "mbTiles_sat");



        var mbTiles_topo = new ol.layer.Tile({
            visible: true,
            source: new ol.source.XYZ({

                url: "tuiles_yaounde/{z}/{x}/{y}.png",
                tileLoadFunction: function (imageTile, src) {
                    imageTile.getImage().src = src;
                },
                crossOrigin: null
            })
        })
         mbTiles_topo.setZIndex(0);
        map.addLayer(mbTiles_topo);
        mbTiles_topo.set("name", "mbTiles_topo");

        var style = new ol.style.Style({
        text: new ol.style.Text({
          font: 'bold 11px "Open Sans", "Arial Unicode MS", "sans-serif"',
          placement: 'line',
          fill: new ol.style.Fill({
            color: '#000'
          })
        })
      });

      var labels =  new ol.layer.Vector({
          declutter: true,
          source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: 'assets/adressage.geojson'
          }),
          style: function(feature) {
            style.getText().setText(feature.get('nom'));
            return style;
          }
      })
       labels.setZIndex(10);
        labels.set("name", "mbTiles_topo");
       //map.addLayer(labels);

        var clip =  new ol.layer.Vector({
          declutter: true,
          source: new ol.source.Vector({
            format: new ol.format.GeoJSON(),
            url: 'assets/bb.geojson'
          }),
          /*style: function(feature) {
            style.getText().setText(feature.get('nom'));
            return style;
          }*/
      })
       clip.setZIndex(10);

       clip.setStyle(new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: "#434343"
                            }), stroke: new ol.style.Stroke({
                                color: '#434343',
                                width: 0
                            })
                        }));
        clip.setOpacity(0.5)

        clip.set("name", "mbTiles_topo");
       map.addLayer(clip);


       /*myfactory.data("assets/Bbox.geojson").then(function (data) {
           
       var markerSource = new ol.source.Vector();
       var geom = data.features[0].geometry; console.log(geom.coordinates)
                                        var newMarker = new ol.Feature({
                                            geometry: new ol.geom.Polygon(convertepolygon(geom.coordinates[0][1])),
                                            pointAttributes: { 'name': 'data' },
                                        });
            markerSource.addFeature(newMarker);
        var LayThe = new ol.layer.Vector({
                                        source: markerSource,
                                        visible: true
                                    });
        LayThe.setZIndex(10);
        map.addLayer(LayThe);

        })*/

        /*--------------------------------end mbtiles--------------------------------------------------*/
        /*---------------------------------------------------------------------------------------------*/


        /*-- -------------------------------------Tools---------------------------------------------*/
        //*-----------------------------------------------------------------------------------------*/
        $(".projection").change(function () {

            var pro = $(".projection").val();
            if (pro == "84") {

                $(".x").text("longitude");
                $(".y").text("latitude");

            } else if (pro == "33") {

                $(".x").text("X");
                $(".y").text("Y");
            } else {

                $(".x").text("X");
                $(".y").text("Y");
            }

        });

        $('input.float').on('input', function () {
            this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        });


        $scope.fonds = function (select, fond) {
            if (select) {


                map.getLayers().forEach(function (tile) {



                    if (tile.get('name') == fond.tuile_nom) {

                        tile.setVisible(true);

                    }
                });

            } else {

                map.getLayers().forEach(function (tile) {

                    if (tile.get('name') == fond.tuile_nom) {

                        tile.setVisible(false);
                    }
                });
            }
        }

        $scope.supprimer_point = function () {

            map.getLayers().forEach(function (layer) {
                if (layer.get('name') == "search-ll") {
                    map.removeLayer(layer)
                }

            });
        }


        $scope.ouverire = function () {

            $("#modal-sm").modal();

        }

        var EPSG32632 = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
        var EPSG32633 = "+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
        var EPSG3857 = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs";


        $scope.reherche_point = function () {
            map.getLayers().forEach(function (layer) {
                if (layer.get('name') == "search-ll") {
                    map.removeLayer(layer)
                }

            });
            var markerS = new ol.source.Vector();
            var Style = new ol.style.Style({
                image: new ol.style.Icon({
                    src: 'assets/images/settings/map-marker.png'
                })
            });
            Layer = new ol.layer.Vector({
                source: markerS,
                style: Style
            });
            map.addLayer(Layer);
            Layer.set('name', "search-ll");



            var lon = $(".lon").val();
            var lat = $(".lat").val();
            if (lon == "" || lat == "") {
                setTimeout('$("#err").hide()', 5000);
                $('#err').fadeIn();
                $("#err").html('<div class="alert alert-danger" role="alert" style="height:20px; padding-top:0px;"><center>Remplir les champs vides</center></div>');

            } else {
                var pro = $(".projection").val();
                if (pro == "84") {

                    Marker = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.transform([parseFloat(lon), parseFloat(lat)], 'EPSG:4326', 'EPSG:3857')),
                        pointAttributes: { name: 'SearchGps4326' }
                    });
                    markerS.addFeature(Marker);
                    var extent = Layer.getSource().getExtent();
                    map.getView().fit(extent, map.getSize());
                    $(".lon").val("");
                    $(".lat").val("");
                    $("#modal-sm").modal('hide');
                    map.getView().setZoom(14);


                } else if (pro == "33") {

                    Marker = new ol.Feature({
                        geometry: new ol.geom.Point(proj4(EPSG32633, EPSG3857, [parseFloat(lon), parseFloat(lat)])),
                        pointAttributes: { name: 'SearchGps4326' }
                    });
                    markerS.addFeature(Marker);
                    var extent = Layer.getSource().getExtent();
                    map.getView().fit(extent, map.getSize());
                    $(".lon").val("");
                    $(".lat").val("");
                    $("#modal-sm").modal('hide');
                    map.getView().setZoom(14);

                } else if (pro == "32") {

                    Marker = new ol.Feature({
                        geometry: new ol.geom.Point(proj4(EPSG32632, EPSG3857, [parseFloat(lon), parseFloat(lat)])),
                        pointAttributes: { name: 'SearchGps4326' }
                    });
                    markerS.addFeature(Marker);
                    var extent = Layer.getSource().getExtent();
                    map.getView().fit(extent, map.getSize());
                    $(".lon").val("");
                    $(".lat").val("");
                    $("#modal-sm").modal('hide');
                    map.getView().setZoom(14);


                }
            }

        }





        var markerclose;

        $scope.fermer = function ($event) {


            $("#vienna").hide();
            map.getLayers().forEach(function (layer) {
                if (layer.get('name') == "locate") {
                    map.removeLayer(layer)
                }

            });

            $event.preventDefault();

        }

        function reset_layers() {

            map.getLayers().forEach(function (layer) {

                if (layer.get('name') != 'itineraire' && layer.get('name') != 'depart' && layer.get('name') != 'arrive' && layer.get('name') != "mbTiles_topo" && layer.get('name') != "mbTiles_sat" && layer.get('name') != "vect_polygon" && layer.get('name') != "vect_line" && layer.get('name') != "vect_point" && layer.get('name') != "locate" && layer.get('name') != "mesure") {
                    layer.setVisible(false)
                }

            });
            $(".check_all").prop("checked", false);
        }

        $scope.reset_layers = function () {
            reset_layers()
        } 

        function removeAllEdition() {
            $scope.geometry_modify = false
            $scope.attribute_active = false;
            $scope.add_active = false;
            $scope.delete_active = false;
            $scope.edit_active = false;
            

            map.removeInteraction(select)
            map.removeInteraction(modify)
            map.removeInteraction(draw);
        }

        $scope.show_btn_edit = function (couche) {
            $scope.couche = JSON.parse(couche)

            if ($scope.couche.sous_thematique ==  false) {
                $scope.couche.sous_thematique= null
            }else{
                $scope.couche.sous_thematique = true
            }

           removeAllEdition() 

            $scope.div_edit = true;
            
            var leyer =  $scope.couche.id_couche;
            var shema = $scope.couche.shema;
            var geom = $scope.couche.geom;
            var images_theme = $scope.couche.image_src || $scope.couche.images_theme;
            var contour = $scope.couche.contour || $scope.couche.contour_couleur;
            var remplir = $scope.couche.remplir || $scope.couche.remplir_couleur;
            var opacity = $scope.couche.opacity;

           if ($scope.couche.image_src) {
                $scope.couche.images_theme = $scope.couche.image_src
           } 

           if ($scope.couche.contour) {
                $scope.couche.contour_couleur = $scope.couche.contour
           }

            $("#loading").show();
            var json = myfactory.data("/api/v1/RestFull/datajson/" + shema + "/" + leyer + "").then(function (data) {

                reset_layers()

                 var champ_catalogue = []

                        for (var i = 0; i < data.length; i++) {
                            champ_catalogue[i]={}
                            data[i].key_couche = $scope.couche.key_couche
                            data[i].sous_thematique = $scope.couche.sous_thematique  
                            
                            champ_catalogue[i] = fd_aliase_return(data[i])
                            champ_catalogue[i].key_couche = $scope.couche.key_couche
                            champ_catalogue[i].sous_thematique = $scope.couche.sous_thematique  

                        }


                gestion_carto(data,$scope.couche.geom,champ_catalogue,$scope.couche,$scope.couche.sous_thematique,shema,event,'modification')


                $("#loading").hide();

            }, function (msg) {
                $("#loading").hide();
                alert("service non disponible")
            });

        }


        $scope.edit = function () {
            menu();
            document.getElementById("SlideEdition").style.top = "0px";
            $("#disabled_div").css("left", "0px")
        }


        $scope.localisation = function () {



            map.getLayers().forEach(function (layer) {
                if (layer.get('name') == "locate") {
                    map.removeLayer(layer)
                }

            });

            var markerS = new ol.source.Vector();
            var Style = new ol.style.Style({
                image: new ol.style.Icon({
                    src: 'assets/images/settings/localiisation.png'
                })
            });
            Layer = new ol.layer.Vector({
                source: markerS,
                style: Style
            });
            map.addLayer(Layer);

            Layer.set('name', "locate");

            markerclose = new ol.Overlay({

                positioning: 'center-center',
                element: document.getElementById('vienna'),
                stopEvent: false
            });

            map.addOverlay(markerclose);

            $("#vienna").show();

            geolocation = new ol.Geolocation({
                projection: view.getProjection()
            });
            geolocation.setTracking(true)
            geolocation.on('change:position', function () {
                var coordinate = geolocation.getPosition();
                markerclose.setPosition(coordinate);
                Marker = new ol.Feature({
                    geometry: new ol.geom.Point([coordinate[0], coordinate[1]]),
                    pointAttributes: { name: 'locationGps4326' }
                });
                markerS.addFeature(Marker);
                var extent = Layer.getSource().getExtent();
                map.getView().fit(extent, map.getSize());
                map.getView().setZoom(19);
                geolocation.setTracking(false);

            });



        }

        /*-- -------------------------------------End Tools---------------------------------------------*/
        //*-----------------------------------------------------------------------------------------*/


        /*-- -------------------------------------Login---------------------------------------------*/
        //*-----------------------------------------------------------------------------------------*/


        $scope.deconnect = function () {

            myfactory.data("deconnect").then(function (resp) {
                $window.location.reload()

            }, function (msg) {

                alert("service non disponible")


            })


        }



        function isEmail(email) {
            var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return regex.test(email);
        }


        $scope.connecte = function (email, mdp) {

            if (email == "" || mdp == "") {

                $scope.MsgErr = "Svp remplir les champs vides";

            } else {

                if (!isEmail(email)) {

                    $scope.MsgErr = "Adresse mail non valide";

                } else {

                    myfactory.post_data("login", { "email": email, "mdp": mdp }).then(function (resp) {

                        if (resp == "ok") {
                            $window.location.reload();

                        } else {
                            $scope.MsgErr = "Email ou mot de passe incorrect";
                        }

                    }, function (msg) {

                        $scope.Msg = "Réssayer,le serveur ne répond pas";
                        document.getElementById("FourmErrs").style.top = "0px";


                    })
                }
            }
        }



        function Updatelayer(shema, leyer) {
           

            var leyer =  $scope.couche.id_couche;
            var shema = $scope.couche.shema;
            var geom = $scope.couche.geom;
            var images_theme = $scope.couche.image_src;
            var contour = $scope.couche.contour;
            var remplir = $scope.couche.remplir;
            var opacity = $scope.couche.opacity;



            var json = myfactory.data("/api/v1/RestFull/datajson/" + shema + "/" + leyer + "").then(function (data) {

                var champ_catalogue = []

                        for (var i = 0; i < data.length; i++) {
                            champ_catalogue[i]={}
                            data[i].key_couche = $scope.couche.key_couche
                            data[i].sous_thematique = $scope.couche.sous_thematique  
                            
                            champ_catalogue[i] = fd_aliase_return(data[i])
                            champ_catalogue[i].key_couche = $scope.couche.key_couche
                            champ_catalogue[i].sous_thematique = $scope.couche.sous_thematique  

                        }

            gestion_carto(data,$scope.couche.geom,champ_catalogue,$scope.couche,$scope.couche.sous_thematique,shema,event,'update')

               
                $("#loading").hide();

            }, function (msg) {
                $("#loading").hide();
                $scope.Msg = "Réessayer,une erreur s'est produite ";
                document.getElementById("FourmErrs").style.top = "0px";
            });



        }

        var sourceline = new ol.source.Vector();
        var sourcepoint = new ol.source.Vector();
        var sourcepolygon = new ol.source.Vector();

        var vectorline = new ol.layer.Vector({
            source: sourceline,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: '#E40E2F'
                }),
                stroke: new ol.style.Stroke({
                    color: '#E40E2F',
                    width: 3
                })
            })
        });
        map.addLayer(vectorline);
        //vectorline.set('name', "vect_line");

        var vectorpolygon = new ol.layer.Vector({
            source: sourcepolygon,
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: '#E40E2F',
                    width: 3
                })
            })
        });
        map.addLayer(vectorpolygon);
        //vectorpolygon.set('name', "vect_polygon");



        var vectorpoint = new ol.layer.Vector({
            source: sourcepoint,
            style: new ol.style.Style({

                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: '#E40E2F'
                    }),
                    fill: new ol.style.Fill({
                        color: '#E40E2F'
                    })
                })
            })
        });

        map.addLayer(vectorpoint);
        //vectorpoint.set('name', "vect_point");


        var draw = null;


        function addInteractionline() {

            var value = 'LineString';
            if (value !== 'None') {
                draw = new ol.interaction.Draw({
                    source: sourceline,
                    type: ('LineString'),
                    style: new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: '#E40E2F'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#E40E2F',
                            lineDash: [10, 10],
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 5,
                            stroke: new ol.style.Stroke({
                                color: '#E40E2F'
                            }),
                            fill: new ol.style.Fill({
                                color: '#E40E2F'
                            })
                        })
                    })
                });
                map.addInteraction(draw);
            }
            $scope.coord = null
            draw.on("drawend", function (e) {

                $scope.coord = e.feature.getGeometry().getCoordinates();
                fd_aliase_add();

            });

        }


        function addInteractionpoint() {

            var value = 'Point';
            if (value !== 'None') {
                draw = new ol.interaction.Draw({
                    source: sourcepoint,
                    type: ('Point'),
                    style: new ol.style.Style({

                        image: new ol.style.Circle({
                            radius: 5,
                            stroke: new ol.style.Stroke({
                                color: '#E40E2F'
                            }),
                            fill: new ol.style.Fill({
                                color: '#E40E2F'
                            })
                        })
                    })
                });
                map.addInteraction(draw);
            }

            $scope.coord = null
            draw.on("drawend", function (e) {

                $scope.coord = e.feature.getGeometry().getCoordinates();
                fd_aliase_add();
            });
        }


        function addInteractionpolygon() {

            var value = 'Polygon';
            if (value !== 'None') {
                draw = new ol.interaction.Draw({
                    source: sourcepolygon,
                    type: ('Polygon'),
                    style: new ol.style.Style({

                        stroke: new ol.style.Stroke({
                            color: '#E40E2F',
                            lineDash: [10, 10],
                            width: 2
                        }),
                        image: new ol.style.Circle({
                            radius: 5,
                            stroke: new ol.style.Stroke({
                                color: '#E40E2F'
                            }),
                            fill: new ol.style.Fill({
                                color: '#E40E2F'
                            })
                        })
                    })
                });
                map.addInteraction(draw);

            }

            $scope.coord = null;
            draw.on("drawend", function (e) {

                $scope.coord = e.feature.getGeometry().getCoordinates();
                fd_aliase_add();

            });

        }


        $scope.active_attribute = function () {

            if ($scope.attribute_active) {

                map.removeInteraction(draw);
                map.removeInteraction(select)
                map.removeInteraction(modify)
            }

        }

        $scope.undo_add = function () {

            document.getElementById("SlideAddEntite").style.top = "-450px";
            map.addInteraction(draw)
            vectorpoint.getSource().clear();
            vectorline.getSource().clear();
            vectorpolygon.getSource().clear();

        }




        $scope.AddEntite = function () {

            var table =  $scope.couche.id_couche;
            var shema = $scope.couche.shema;
            var geom = $scope.couche.geom;
            var images_theme = $scope.couche.image_src;
            var contour = $scope.couche.contour;
            var remplir = $scope.couche.remplir;
            var opacity = $scope.couche.opacity;

            var data = [];
            $("#loading").show();
            for (i = 0; i < $scope.objects.length; i++) {

                if ($scope.objects[i].index != "id" && $scope.objects[i].index != "geom" && $scope.objects[i].index != "geometry" && $scope.objects[i].index != "keyRequete__78") {

                    data.push({ "ind": $scope.objects[i].index, "val": $("#" + $scope.objects[i].index + "vall").val() })
                }

            }


            myfactory.post_data("addEntite", { "data": data, "coordinates": $scope.coord, "table": table, "shema": shema, "geom": geom }).then(function (resp) {
                vectorpolygon.getSource().clear();
                vectorpoint.getSource().clear();
                vectorline.getSource().clear();
                Updatelayer(shema, table);
                map.addInteraction(draw)
                $scope.Msg = "Entité est ajoutée avec succès";
                document.getElementById("FourmSuc").style.top = "0px";
                document.getElementById("SlideAddEntite").style.top = "-450px";
                $("#loading").hide();
                setTimeout(function () { document.getElementById("FourmSuc").style.top = "-150px"; }, 3000);



            }, function (msg) {
                $("#loading").hide();
                $scope.Msg = "Réessayer,une erreur s'est produite ";
                document.getElementById("FourmErrs").style.top = "0px";


            })

        }

        $scope.updateEntiteGeometry = function (donne) {

            var table =  $scope.couche.id_couche;
            var shema = $scope.couche.shema;
            var geom = $scope.couche.geom;
            var images_theme = $scope.couche.image_src;
            var contour = $scope.couche.contour;
            var remplir = $scope.couche.remplir;
            var opacity = $scope.couche.opacity;
           
            var data = [];
            //console.log(table,shema,donne)

            $("#loading").show();
            


            myfactory.post_data("updateEntite", {"coordinates": donne.coordinates, "table": table, "shema": shema, "type_geometry": donne.type_geometry,"id": donne.id }).then(function (resp) {
                vectorpolygon.getSource().clear();
                vectorpoint.getSource().clear();
                vectorline.getSource().clear();
                Updatelayer(shema, table);
               // map.addInteraction(draw)

              
               $scope.edit_active=false
                $scope.geometry_modify=false
               map.removeInteraction(select)
               map.removeInteraction(modify)

                $scope.Msg = "Entité a ete modifiée avec succès";
                document.getElementById("FourmSuc").style.top = "0px";
                document.getElementById("SlideAddEntite").style.top = "-450px";
                $("#loading").hide();
                setTimeout(function () { document.getElementById("FourmSuc").style.top = "-150px"; }, 3000);



            }, function (msg) {
                $("#loading").hide();
                $scope.Msg = "Réessayer,une erreur s'est produite ";
                document.getElementById("FourmErrs").style.top = "0px";


            })

        }


        $scope.active_add = function () {

           
            var geom = $scope.couche.geom;
            

            if ($scope.add_active) {
                map.removeInteraction(select)
                map.removeInteraction(modify)
                if (geom == "LineString") {

                    addInteractionline();


                } else if (geom == "Polygon") {

                    addInteractionpolygon();

                } else {

                    addInteractionpoint();

                }
            } else {

                map.removeInteraction(draw);

            }



        }



        var select = null;
        var modify = null;

        function MofifyInteracionpoint() {

            select = new ol.interaction.Select({
                wrapX: false,
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#F9B70F',
                        width: 4
                    }),
                    image: new ol.style.Circle({
                        radius: 11,
                        fill: new ol.style.Fill({
                            color: '#E40E2F'
                        })
                    })
                })
            });

            modify = new ol.interaction.Modify({
                features: select.getFeatures(),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#F9B70F',
                        width: 4
                    }),
                    image: new ol.style.Circle({
                        radius: 6,
                        fill: new ol.style.Fill({
                            color: '#E40E2F'
                        })
                    })
                })
            })

            modify.once("modifystart",function(e){

                e.features.forEach(function(feature){
                    
                   $scope.geometry_modify_start= feature.getGeometry().getCoordinates()
                    
                })

                
            })

            modify.on("modifyend",function(e){
                
                e.features.forEach(function(feature){
                    
                    $scope.geometry_modify_end = feature

                    
                })

                $scope.geometry_modify = true
                $scope.$apply()
                
            })

            select.on('select',function(e){
                console.log(78,select)
                select.setActive(false)
            })

            map.addInteraction(select)
            map.addInteraction(modify)
        }
        //$scope.geometry_modify = false
        function MofifyInteracion() {


            select = new ol.interaction.Select({
                wrapX: false,
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#F41414',
                        width: 4
                    }),
                    image: new ol.style.Circle({
                        radius: 6,
                        fill: new ol.style.Fill({
                            color: '#F41414'
                        })
                    })
                })
            });

            modify = new ol.interaction.Modify({
                features: select.getFeatures(),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#000',
                        width: 4
                    }),
                    image: new ol.style.Circle({
                        radius: 6,
                        fill: new ol.style.Fill({
                            color: '#000'
                        })
                    })
                })
            });
            //console.log(select.getFeatures().getArray()[0].getGeometry().getCoordinates())
           
            modify.once("modifystart",function(e){

                e.features.forEach(function(feature){
                    
                   $scope.geometry_modify_start= feature.getGeometry().getCoordinates()
                    
                })

                
            })

            modify.on("modifyend",function(e){
                
                e.features.forEach(function(feature){
                    
                    $scope.geometry_modify_end = feature
                    console.log(feature)
                   // feature.U["features"][0].U["data"]["id"]
                })

                $scope.geometry_modify = true
                $scope.$apply()
                
            })

            select.on('select',function(e){
                console.log(78,select)
                select.setActive(false)
            })

            map.addInteraction(select)
            map.addInteraction(modify)

        }

        $scope.modify_finish = function(){
           
            var id;

            if ($scope.geometry_modify_end.getGeometry().getType() == "Point") {
                id = $scope.geometry_modify_end.U["features"][0].U["data"]["id"];
            }else{
                id = $scope.geometry_modify_end.U["data"]["id"]
            }
             console.log(id)
            $scope.updateEntiteGeometry({
                "coordinates":$scope.geometry_modify_end.getGeometry().getCoordinates(),
                "type_geometry":$scope.geometry_modify_end.getGeometry().getType(),
                "id":id
            })
        }

        $scope.modify_reset = function(){
            

            if ($scope.geometry_modify_end.getGeometry().getType() == 'Polygon') {
                 $scope.geometry_modify_end.setGeometry( new ol.geom.Polygon($scope.geometry_modify_start)  )
            } else if($scope.geometry_modify_end.getGeometry().getType() == 'LineString') {
                 $scope.geometry_modify_end.setGeometry( new ol.geom.LineString($scope.geometry_modify_start)  )
            }else if($scope.geometry_modify_end.getGeometry().getType() == 'Point'){
                $scope.geometry_modify_end.setGeometry( new ol.geom.Point($scope.geometry_modify_start)  )
            }
          

           $scope.geometry_modify = false
        }

        $scope.active_modify = function () {
         
            var geom = $scope.couche.geom;
            

            map.removeInteraction(draw)
            //$scope.geometry_modify =false

            if (geom != "point") {
                if ($scope.edit_active) { 

                    MofifyInteracion();
                    map.removeInteraction(draw)

                } else { 

                    if ($scope.geometry_modify_end) {
                        $scope.modify_reset()
                    }
                     
                    map.removeInteraction(select)
                    map.removeInteraction(modify)


                }
            } else {


                if ($scope.edit_active) {
                    MofifyInteracionpoint();

                } else { 
                     if ($scope.geometry_modify_end) {
                        $scope.modify_reset()
                    }
                    map.removeInteraction(select)
                    map.removeInteraction(modify)

                }
            }
        }


        $scope.UpdateEntite = function () { //fd_aliase_reverse

            var data = [];
           // $("#loading").show();

            console.log($scope.objects)

           for (i = 0; i < $scope.objects.length; i++) { 

                if ($scope.objects[i].index != "remplir_couleur" && $scope.objects[i].index != "contour_couleur" && $scope.objects[i].index != "id" && $scope.objects[i].index != "geom" && $scope.objects[i].index != "geometry" && $scope.objects[i].index != "keyRequete__78") {

                    data.push({ "ind": $scope.objects[i].index, "val": $("#" + $scope.objects[i].index + "val").val() })
                }

            }
             console.log($scope.objects)
           

            myfactory.post_data("updateAttribute", { "data": data, "id": $scope.id, "shema": $scope.shema, "table": $scope.table }).then(function (resp) {
                Updatelayer($scope.shema, $scope.table);
                $scope.Msg = "Entité est modifiée avec succès";
                document.getElementById("FourmSuc").style.top = "0px";
                document.getElementById("SlideEditAttribute").style.top = "-450px";
                desactivate_an_icon()
                $("#loading").hide();
                setTimeout(function () { document.getElementById("FourmSuc").style.top = "-150px"; }, 3000);
            }, function (msg) {
                $("#loading").hide();
                $scope.Msg = "Réessayer,une erreur s'est produite ";
                document.getElementById("FourmErrs").style.top = "0px";


            })


        }



        $scope.fermerErr = function () {
            document.getElementById("FourmErrs").style.top = "-150px";
            document.getElementById("FourmSuc").style.top = "-150px";
        }

        


        $scope.data = "";

        myfactory.data("check").then(function (resp) {

            $scope.data = resp;

            if ($scope.data.session != false ) {
                if ($scope.data.droit != "administrateur") {

                    myfactory.data("/api/v1/RestFull/rolles/" + $scope.data.id).then(function (thematiques) {
                        
                        $scope.thematiques = thematiques;
                        
                    }, function (msg) {

                        $scope.Msg = "Réessayer,une erreur s'est produite ";
                        document.getElementById("FourmErrs").style.top = "0px";


                    });


                    myfactory.data("/api/v1/RestFull/LayerNameEdit/" + $scope.data.id).then(function (thematiques) {

                        a = thematiques
                        $scope.modifiablecouches = thematiques;

                        var i = 0;
                               
                                while (i < $scope.modifiablecouches.length) {
                                    if ($scope.modifiablecouches[i].sous_thematiques != false) {
                                        if ($scope.modifiablecouches[i].sous_thematiques.length == 0) {
                                            $scope.modifiablecouches.splice(i,1)
                                            i=0 
                                        }else{
                                           var j = 0;
                                            while (j < $scope.modifiablecouches[i].sous_thematiques.length) {

                                                if ($scope.modifiablecouches[i].sous_thematiques[j].couches.length == 0) {
                                                    $scope.modifiablecouches[i].sous_thematiques.splice(j,1)
                                                    j=0 
                                                }else{
                                                    j++
                                                }

                                                if ($scope.modifiablecouches[i].sous_thematiques.length == 0) {
                                                    $scope.modifiablecouches.splice(i,1)
                                                }
                                               
                                            }
                                             i++; 
                                        }
                                        
                                    }else{
                                        i++; 
                                    }
                                  
                                }
                       
                                
                    }, function (msg) {

                        alert("service non disponible")


                    });

                } else {
                    
                    myfactory.data("/api/v1/RestFull/Catalog").then(function (thematiques) {
                        
                        $scope.thematiques = thematiques;
                         $scope.modifiablecouches = thematiques;

                    }, function (msg) {

                        alert("service non disponible")


                    });

                }

            }else if ($scope.data.session == false) {

                myfactory.data("/api/v1/RestFull/Catalog").then(function (thematiques) {
                    console.log(thematiques)
                    $scope.thematiques = thematiques;

                }, function (msg) {

                    alert("service non disponible")


                });

            } 


        }, function (msg) {

            $scope.Msg = "Réessayer,une erreur s'est produite ";
            document.getElementById("FourmErrs").style.top = "0px";


        })

        //**-----------------------------------End  Data catalog ------------------------------**//
        //*-----------------------------------------------------------------------------------------*/



        //**------------------------------- show layer----------------------------------------**//
        //*-----------------------------------------------------------------------------------------*/

        $scope.id_couche = null;

        $scope.theme_to_edit_function = function (a) {
            removeAllEdition()
            reset_layers()
            $scope.div_edit=false
            $scope.theme_to_edit =JSON.parse(a)
           console.log($scope.theme_to_edit)
        }
        $scope.affiche_couches = function (event, couche, selectall, shema) {
            console.log(couche, selectall, shema)

            angular.forEach(couche, function (item) {

                $scope.id_couche = item.id_couche;

                var data_loaded = $("#" + item.id_couche).attr('data_loaded');



                if (selectall == true) {

                    item.selected = selectall;



                    if (event.target.checked == true) {

                        if (data_loaded == "false") {
                            $("#loading").show();


                            var json = myfactory.data("/api/v1/RestFull/datajson/" + shema + "/" + $scope.id_couche + "").then(function (data) {

                                /*for (var i = 0; i < data.length; i++) {

                                    data[i].key_couche = item.key_couche
                                    data[i].sous_thematique = true
                                    data[i] = fd_aliase_return(data[i])

                                }*/


                                var champ_catalogue = []

                                for (var i = 0; i < data.length; i++) {
                                    champ_catalogue[i]={}
                                    data[i].key_couche = item.key_couche
                                    data[i].sous_thematique = true  
                                    
                                    champ_catalogue[i] = fd_aliase_return(data[i])
                                    champ_catalogue[i].key_couche = item.key_couche
                                    champ_catalogue[i].sous_thematique = true  

                                }


                                if (item.geom == "point") {


                                    var k = 0
                                    var features = []
                                    $.each(data, function (index, val) {


                                        var geom = JSON.parse(data[index].geometry);

                                         data[index].key_couche = item.key_couche
                                         data[index].sous_thematique = true

                                        var newMarker = new ol.Feature({
                                            geometry: new ol.geom.Point(ol.proj.transform([geom.coordinates[0][0], geom.coordinates[0][1]], 'EPSG:4326', 'EPSG:3857')),
                                            pointAttributes: { 'name': 'data' },
                                            data: data[index],
                                            champ_catalogue: champ_catalogue[index]
                                        });
                                        features[k] = newMarker;
                                        k++


                                    });


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
                                                        scale: 0.22,
                                                        src: 'assets/images/icones-couches/' + item.id_couche + '.png'
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
                                                        scale: 0.22,
                                                        src: 'assets/images/icones-couches/' + item.id_couche + '.png'
                                                    })
                                                });
                                                styleCacheCopy[size] = style;
                                            }

                                            return style;
                                        },
                                        visible: true
                                    });



                                    map.addLayer(LayTheCopy);
                                    var extent = markerSource.getExtent();
                                    map.getView().fit(extent, map.getSize());
                                    LayTheCopy.set('name', item.id_couche);
                                    LayTheCopy.set('nametable', item.id_couche);
                                    LayTheCopy.set('shema', shema);

                                    map.addLayer(LayThe);
                                    var extent = markerSource.getExtent();
                                    map.getView().fit(extent, map.getSize());
                                    LayThe.set('name', item.id_couche);
                                    LayThe.set('nametable', item.id_couche);
                                    LayThe.set('shema', shema);
                                    angular.element(event.target).attr('data_loaded', 'true');

                                }


                                if (item.geom == "LineString") {




                                    
                                    var markerSource = new ol.source.Vector();
                                    $.each(data, function (index, val) {

                                        data[index].key_couche = item.key_couche
                                         data[index].sous_thematique = true
                                         data[index].contour_couleur = item.contour_couleur
                                        var geom = JSON.parse(data[index].geometry);
                                        var newMarker = new ol.Feature({
                                            geometry: new ol.geom.LineString(converteline(geom.coordinates[0])),
                                            pointAttributes: { 'name': 'data' },
                                            data: data[index],
                                            champ_catalogue: champ_catalogue[index]
                                        });
                                        markerSource.addFeature(newMarker);
                                    });

                                    var LayThe = new ol.layer.Vector({
                                        source: markerSource,
                                        style: styleLigne,
                                        visible: true
                                    });

                                    // for (var i = 0; i < LayThe.getSource().getFeatures().length; i++) {

                                    //       styleLigne(LayThe.getSource().getFeatures()[i],item) 
                                    // }

                                    map.addLayer(LayThe);
                                    LayThe.set('name', item.id_couche);
                                    LayThe.set('shema', shema);
                                    $("#" + item.id_couche).attr('data_loaded', 'true');
                                }/*End line*/

                                if (item.geom == "Polygon") {

                                    var markerSource = new ol.source.Vector();

                                    $.each(data, function (index, val) {


                                        data[index].key_couche = item.key_couche
                                         data[index].sous_thematique = true

                                        var geom = JSON.parse(data[index].geometry);
                                        var newMarker = new ol.Feature({
                                            geometry: new ol.geom.Polygon([convertepolygon(geom.coordinates[0][0])]),
                                            pointAttributes: { 'name': 'data' },
                                            data: data[index],
                                            champ_catalogue: champ_catalogue[index]
                                        });
                                        markerSource.addFeature(newMarker);
                                    });

                                    var LayThe = new ol.layer.Vector({
                                        source: markerSource,
                                        visible: true
                                    });

                                    for (var i = 0; i < LayThe.getSource().getFeatures().length; i++) {
                                        stylePolygon(LayThe.getSource().getFeatures()[i], item) 
                                    }
                                    if (couche.opacity) {
                                        LayThe.setOpacity(item.opacity)
                                    }

                                    map.addLayer(LayThe);
                                    LayThe.set('name', item.id_couche);
                                    LayThe.set('shema', shema);
                                    $("#" + item.id_couche).attr('data_loaded', 'true');


                                }/*End polygon*/


                                $("#loading").hide();


                            }, function (msg) {
                                $("#loading").hide();
                                $scope.Msg = "Réessayer,une erreur s'est produite ";
                                document.getElementById("FourmErrs").style.top = "0px";
                            });

                        } else {

                            map.getLayers().forEach(function (layer) {
                                if (layer.get('name') == $scope.id_couche) {
                                    layer.setVisible(true);

                                }
                            });
                        }

                    } else {

                        map.getLayers().forEach(function (layer) {
                            if (layer.get('name') == $scope.id_couche) {
                                layer.setVisible(false);
                            }
                        });
                    }



                } else {

                    item.selected = selectall;
                    map.getLayers().forEach(function (layer) {
                        if (layer.get('name') == $scope.id_couche) {
                            layer.setVisible(false);
                        }
                    });
                }
            });
        }


        //converte Feature coordinate polygon

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


        $scope.fermerFiche = function () {

             desactivate_an_icon()
            document.getElementById("SlideFourm").style.top = "-450px";
            $("#disabled_div").css("left", "-40px")
        }

        $scope.fermerEdition = function () {

            document.getElementById("SlideEdition").style.top = "-275px";
            $("#disabled_div").css("left", "-40px")
            $scope.div_edit = false;
            $scope.couche = undefined;
            $scope.theme_to_edit =undefined
            map.removeInteraction(draw)
            $scope.add_active = false;
            $scope.active_attribute = false;
            $scope.attribute_active = false;

            removeAllEdition()
            reset_layers()
        }

 String.prototype.trunc = String.prototype.trunc ||
          function(n) {
            return this.length > n ? this.substr(0, n - 1) + '...' : this.substr(0);
          };


      // http://stackoverflow.com/questions/14484787/wrap-text-in-javascript
      function stringDivider(str, width, spaceReplacer) {
        if (str.length > width) {
          var p = width;
          while (p > 0 && (str[p] != ' ' && str[p] != '-')) {
            p--;
          }
          if (p > 0) {
            var left;
            if (str.substring(p, p + 1) == '-') {
              left = str.substring(0, p + 1);
            } else {
              left = str.substring(0, p);
            }
            var right = str.substring(p + 1);
            return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
          }
        }
        return str;
      }

 var getText = function(donne) {
    if (donne.keyRequete__78 == null || donne.keyRequete__78 == undefined || donne.keyRequete__78 == '') {
        return ''
    } else {
        return String(donne.keyRequete__78)
    }
     
};



function getFont( resolution){
   

        var font ;

        if (resolution > 4.8 ) {
          font = '0px Calibri,sans-serif';
        }else if (resolution < 0.7) {
            font = '17px Calibri,sans-serif';
        }else{
            font = 10/resolution + 'px Calibri,sans-serif'
        } 


        return font;
}

function getFontPolygon( resolution){
   

        var font ;

        if (resolution > 20 ) {
          font = '0px Calibri,sans-serif';
        }else if (resolution < 5) {
            font = '25px Calibri,sans-serif';
        }else{
            font = 110/resolution + 'px Calibri,sans-serif'
        } 


        return font;
}

var createTextStyle = function(features, resolution) {

             var geometry = features.getGeometry();
   
            if (!features.getProperties().champ_catalogue) {
                        donne = features.getProperties().data
            } else{
                        donne = features.getProperties().champ_catalogue
            }

            // var rotation ;

            // geometry.forEachSegment(function(start, end) {
            //   var dx = end[0] - start[0];
            //   var dy = end[1] - start[1];
            //    rotation = Math.atan2(dy, dx);
                
            // });

            return new ol.style.Text({
              font: getFont(resolution),
              text:getText(donne), 
              fill: new ol.style.Fill({ color: '#000' }),
              stroke: new ol.style.Stroke({color: '#000', width: 1 }),
              offsetX: 0,
              offsetY: 0,
              //rotation: rotation
            });

};

var createTextStylePolygon = function(features, resolution) {

             var geometry = features.getGeometry();
   
            if (!features.getProperties().champ_catalogue) {
                        donne = features.getProperties().data
            } else{
                        donne = features.getProperties().champ_catalogue
            }


            return new ol.style.Text({
              font:getFontPolygon (resolution),
              text: stringDivider(getText(donne), 16, '\n'), 
              fill: new ol.style.Fill({ color: '#000' }),
              stroke: new ol.style.Stroke({color: '#000', width: 1 }),
              offsetX: 0,
              offsetY: 0,
            });

};


 function styleLigne(feature,resolution){
            
            if (!feature.getProperties().champ_catalogue) {
                couche = feature.getProperties().data
           } else{
                couche = feature.getProperties().champ_catalogue
           }
            
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
                                text:createTextStyle(feature, map.getView().getResolution())
                                 /*text: new ol.style.Text({
                                          font: '15px Calibri,sans-serif',
                                               text: String(donne.keyRequete__78) ,
                                              offsetX: 0,
                                              offsetY: 0,
                                              fill: new ol.style.Fill({ color: '#000' }),
                                          stroke: new ol.style.Stroke({
                                            color: '#000', width: 1
                                          })
                                })*/

             });

             //feature.setStyle(myStyle)
        }

        function stylePolygon(feature) { 
           //  console.log(map.getView().getResolution())
           // var textsize = 10 / map.getView().getResolution()

           // var zoom = map.getView().getZoom();
           //  var dsize = (100 / map.getView().getResolution()) * zoom;
           //  var textsize = Math.round(dsize) + "px"


          

           var donne = {}

           if (!feature.getProperties().champ_catalogue) {
                donne = feature.getProperties().data
           } else{
                donne = feature.getProperties().champ_catalogue
           }
           // console.log(donne)
           // if (donne.image_src !== '' || donne.image_src !== null || donne.image_src !== undefined) {
           //      donne.images_theme = donne.image_src
           //  }
            // else  if (donne.image_src){
           //       donne.images_theme = donne.image_src
           // }else{
           //      donne.images_theme = null
           // }

           
            if (donne.images_theme !== null && donne.images_theme !== undefined) {
                            //console.log(donne)
                             var styles = [
                              new ol.style.Style({
                                            stroke: new ol.style.Stroke({
                                                color: '#434343',
                                                width: 4
                                            }),
                                            fill: new ol.style.Fill({
                                                    color:  donne.images_theme
                                            }),
                                             text: createTextStylePolygon(feature, map.getView().getResolution())
                                            
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
                                         text: createTextStylePolygon(feature, map.getView().getResolution())
                                        
                                    })
                                
                            }


                    
        }

        $scope.coucheEnCours = {}        
        $scope.affiche_couche = function (event, couche, shema, sous_thematique, couches,id_thematique) {

             

            var data_loaded = angular.element(event.target).attr('data_loaded');


            if (event.target.checked == true) {

                if (data_loaded == "false") {
                    $("#loading").show();

                    var json = myfactory.data("/api/v1/RestFull/datajson/" + shema + "/" + couche.id_couche + "").then(function (data) {

                        var champ_catalogue = []

                        for (var i = 0; i < data.length; i++) {
                            champ_catalogue[i]={}
                            data[i].key_couche = couche.key_couche
                            data[i].sous_thematique = sous_thematique 

                            champ_catalogue[i] = fd_aliase_return(data[i])
                            champ_catalogue[i].key_couche = couche.key_couche
                            champ_catalogue[i].sous_thematique = sous_thematique 
                            champ_catalogue[i].remplir_couleur = couche.remplir_couleur 
                            

                        }

                       
                        
                        gestion_carto(data,couche.geom,champ_catalogue,couche,sous_thematique,shema,event,'consultation',id_thematique)

                        $("#loading").hide();

                    }, function (msg) {
                        $("#loading").hide();
                        $scope.Msg = "Réessayer,une erreur s'est produite ";
                        document.getElementById("FourmErrs").style.top = "0px";
                    });
                    var bool = verification(couches);

                    if (bool == false) {

                        $("." + sous_thematique).prop("checked", true);

                    }

                } else {

                    map.getLayers().forEach(function (layer) {
                        if (layer.get('name') == couche.id_couche) {
                            layer.setVisible(true);

                        }
                    });

                    var bool = verification(couches);

                    if (bool == false) {

                        $("." + sous_thematique).prop("checked", true);

                    }
                }

            } else {

                map.getLayers().forEach(function (layer) {

                    if (layer.get('name') == couche.id_couche) {
                        layer.setVisible(false);
                        couche.selected = false;
                    }
                });

                $("." + sous_thematique).prop("checked", false);

            }
        }

    gestion_carto = function (data,type_geometry,champ_catalogue,couche,sous_thematique,shema,event,type,id_thematique) {
        // console.log(id_thematique,sous_thematique,couche.key_couche)
        
        if (type == 'update') {
            map.getLayers().forEach(function (layer) {
                if(layer.get('name') == couche.id_couche) {
                    map.removeLayer(layer)
                }
            });

            map.getLayers().forEach(function (layer) {
                if(layer.get('name') == couche.id_couche) {
                    map.removeLayer(layer)
                }
            });
         }

       if (type_geometry== "point") {


                            var k = 0
                            var features = []
                            $.each(data, function (index, val) {
                                data[index].key_couche = couche.key_couche
                                data[index].sous_thematique = sous_thematique

                                var geom = JSON.parse(data[index].geometry);

                                var newMarker = new ol.Feature({
                                    geometry: new ol.geom.Point(ol.proj.transform([geom.coordinates[0][0], geom.coordinates[0][1]], 'EPSG:4326', 'EPSG:3857')),
                                    pointAttributes: { 'name': 'data' },
                                    data: data[index],
                                    champ_catalogue: champ_catalogue[index]
                                });
                               
                                features[k] = newMarker;
                                k++


                            });


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
                                                scale: 0.22,
                                                src: 'assets/images/icones-couches/' + couche.id_couche + '.png'
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
                                                scale: 0.22,
                                                src: 'assets/images/icones-couches/' + couche.id_couche + '.png'
                                            })
                                        });
                                        styleCacheCopy[size] = style;
                                    }

                                    return style;
                                },
                                visible: true
                            });



                            map.addLayer(LayTheCopy);
                            var extent = markerSource.getExtent();

                            LayTheCopy.set('name', couche.id_couche);
                            LayTheCopy.set('nametable', couche.id_couche);
                            LayTheCopy.set('shema', shema);

                            LayTheCopy.set('id_thematique', id_thematique);
                            LayTheCopy.set('sous_thematique', sous_thematique);
                            LayTheCopy.set('id_couche', couche.key_couche);

                            
                            LayThe.set('name', couche.id_couche);
                            LayThe.set('nametable', couche.id_couche);
                            LayThe.set('shema', shema);

                            LayThe.set('id_thematique', id_thematique);
                            LayThe.set('sous_thematique', sous_thematique);
                            LayThe.set('id_couche', couche.key_couche);

                            map.addLayer(LayThe);
                            var extent = markerSource.getExtent();
                             if (type != 'update') {
                                    map.getView().fit(extent, map.getSize(),{maxZoom:17});
                             }


                            if (event) {
                                angular.element(event.target).attr('data_loaded', 'true');
                            }

                            if (type == 'modification') {
                                if ($scope.add_active) {
                                    map.removeInteraction(draw);
                                    addInteractionpoint();

                                }

                                if ($scope.edit_active) {
                                    map.removeInteraction(select);
                                    map.removeInteraction(modify);
                                    MofifyInteracionpoint();

                                }
                            }


                            

        }

        if (type_geometry == "Polygon") { 

                                if (couche.images_theme ) {
                                     var cnv = document.createElement('canvas');
                                    var ctx = cnv.getContext('2d');
                                    var img = new Image();
                                    img.src =couche.images_theme;
                                    var style;
                                    img.onload = function () {

                                         var markerSource = new ol.source.Vector();

                                        $.each(data, function (index, val) {

                                            champ_catalogue[index].images_theme =  ctx.createPattern(img, 'repeat')
                                            
                                            var geom = JSON.parse(data[index].geometry);

                                            data[index].sous_thematique = sous_thematique
                                             data[index].key_couche = couche.key_couche
                                            var newMarker = new ol.Feature({
                                                geometry: new ol.geom.Polygon([convertepolygon(geom.coordinates[0][0])]),
                                                pointAttributes: { 'name': 'data' },
                                                data: data[index],
                                                champ_catalogue: champ_catalogue[index]
                                            });


                                            markerSource.addFeature(newMarker);


                                        });

                                        var LayThe = new ol.layer.Vector({
                                            source: markerSource,
                                            visible: true,
                                            style:stylePolygon
                                           
                                        });
                                        
                                        if (couche.opacity) {
                                            LayThe.setOpacity(couche.opacity)
                                        }
                                        

                                        map.addLayer(LayThe);
                                        LayThe.set('name', couche.id_couche);
                                        LayThe.set('shema', shema);

                                        LayThe.set('id_thematique', id_thematique);
                                        LayThe.set('sous_thematique', sous_thematique);
                                        LayThe.set('id_couche', couche.key_couche);
                                       

                                        var extent = markerSource.getExtent();
                                         if (type != 'update') {
                                            map.getView().fit(extent, map.getSize(),{maxZoom:17});
                                        }

                                       
                                    }
                                }else{

                                    var markerSource = new ol.source.Vector();

                                        $.each(data, function (index, val) {

                                            var geom = JSON.parse(data[index].geometry);

                                            data[index].sous_thematique = sous_thematique
                                             data[index].key_couche = couche.key_couche
                                            var newMarker = new ol.Feature({
                                                geometry: new ol.geom.Polygon([convertepolygon(geom.coordinates[0][0])]),
                                                pointAttributes: { 'name': 'data' },
                                                data: data[index],
                                                champ_catalogue: champ_catalogue[index]
                                            });


                                            markerSource.addFeature(newMarker);


                                        });

                                        var LayThe = new ol.layer.Vector({
                                            source: markerSource,
                                            visible: true,
                                            style:stylePolygon
                                           
                                        });
                                        
                                        if (couche.opacity) {
                                            LayThe.setOpacity(couche.opacity)
                                        }
                                        

                                        map.addLayer(LayThe);
                                        LayThe.set('name', couche.id_couche);
                                        LayThe.set('shema', shema);

                                        LayThe.set('id_thematique', id_thematique);
                                        LayThe.set('sous_thematique', sous_thematique);
                                        LayThe.set('id_couche', couche.key_couche);
                                       

                                        var extent = markerSource.getExtent();
                                        if (type != 'update') {
                                            map.getView().fit(extent, map.getSize(),{maxZoom:17});
                                        }

                               }
                                                              

                                if (event) {
                                     angular.element(event.target).attr('data_loaded', 'true');
                                }

                                if (type == 'modification') {
                                    if ($scope.add_active) {
                                        map.removeInteraction(draw);
                                        addInteractionpolygon();

                                    }

                                    if ($scope.edit_active) {
                                        map.removeInteraction(select);
                                        map.removeInteraction(modify);
                                        MofifyInteracion();

                                    }
                                }
        }

        if (type_geometry == "LineString") { 


                                var markerSource = new ol.source.Vector();

                                $.each(data, function (index, val) {

                                    var geom = JSON.parse(data[index].geometry);

                                     champ_catalogue[index].contour_couleur = couche.contour_couleur
                                     data[index].key_couche = couche.key_couche
                                     data[index].sous_thematique = sous_thematique
                                    var newMarker = new ol.Feature({
                                        geometry: new ol.geom.LineString(converteline(geom.coordinates[0])),
                                        pointAttributes: { 'name': 'data' },
                                        data: data[index],
                                        champ_catalogue: champ_catalogue[index]
                                    });


                                    markerSource.addFeature(newMarker);


                                });

                                var LayThe = new ol.layer.Vector({
                                    source: markerSource,
                                    style:  styleLigne ,
                                    visible: true
                                });


                                map.addLayer(LayThe);
                                LayThe.set('name', couche.id_couche);
                                LayThe.set('shema', shema);

                                LayThe.set('id_thematique', id_thematique);
                            LayThe.set('sous_thematique', sous_thematique);
                            LayThe.set('id_couche', couche.key_couche);
                                
                                var extent = markerSource.getExtent();
                                if (type != 'update') {
                                    map.getView().fit(extent, map.getSize(),{maxZoom:17});
                                }
                                

                                if (event) {
                                     angular.element(event.target).attr('data_loaded', 'true');
                                }

                                if (type == 'modification') {
                                    if ($scope.add_active) {
                                        map.removeInteraction(draw);
                                        addInteractionline();

                                    }

                                    if ($scope.edit_active) {
                                        map.removeInteraction(select);
                                        map.removeInteraction(modify);
                                        MofifyInteracion();

                                    }
                                }
        }

    }


       /* $scope.mode_modifier_entite = function(colonnes){
            

            map.getView().fit($scope.feature.getGeometry().getExtent(),map.getSize(), { 'maxZoom': 17, 'duration': 500 });

            $scope.mode_modifier_fiche = true

            $scope.div_edit=true

            for (var i = 0; i < $scope.thematiques.length; i++) {
                if ($scope.thematiques[i].key == $scope.editer_la_couche.id_thematique){
                    if ($scope.editer_la_couche.sous_thematique) {
                        for (var j = 0; j < $scope.thematiques[i].sous_thematiques.length; j++) {
                            if($scope.thematiques[i].sous_thematiques[j].key == $scope.editer_la_couche.sous_thematique){
                                for (var k = 0; k < $scope.thematiques[i].sous_thematiques[j].couches.length; k++) {
                                    if($scope.thematiques[i].sous_thematiques[j].couches[k].key_couche == $scope.editer_la_couche.id_couche){
                                        $scope.couche = $scope.thematiques[i].sous_thematiques[j].couches[k]
                                        $scope.couche.shema = $scope.thematiques[i].shema
                                    }
                                }
                            }
                        }
                    }else{
                        for (var k = 0; k < $scope.thematiques[i].couches.length; k++) {
                            if($scope.thematiques[i].couches[k].key_couche == $scope.editer_la_couche.id_couche){
                                $scope.couche = $scope.thematiques[i].couches[k]
                            }
                        }
                    }
                }
            }
            console.log($scope.editer_la_couche,colonnes,$scope.couche)

            if ($scope.feature.getGeometry().getType() == 'Point') {
                if ($scope.add_active) {
                                    map.removeInteraction(draw);
                                    addInteractionpoint();

                                }

                                if ($scope.edit_active) {
                                    map.removeInteraction(select);
                                    map.removeInteraction(modify);
                                    MofifyInteracionpoint();

                                }
            } else if($scope.feature.getGeometry().getType() == 'Polygon') {
                 if ($scope.add_active) {
                                        map.removeInteraction(draw);
                                        addInteractionpolygon();

                                    }

                                    if ($scope.edit_active) {
                                        map.removeInteraction(select);
                                        map.removeInteraction(modify);
                                        MofifyInteracion();

                                    }
            }else if ($scope.feature.getGeometry().getType() == 'LineString') {
                 if ($scope.add_active) {
                                        map.removeInteraction(draw);
                                        addInteractionline();

                }

                if ($scope.edit_active) {
                                        map.removeInteraction(select);
                                        map.removeInteraction(modify);
                                        MofifyInteracion();

                }
            }

             $scope.fermerFiche()
                    $scope.edit()


        }*/

         $scope.choisir_theme_requete = function(theme){

            $scope.theme_requete = JSON.parse(theme)

        } 


         $scope.couche_requete = false
        $scope.choisir_couche_requete = function(couche){
            $scope.couche_requete = false
             $scope.option_recherche = undefined
            $timeout(function () {
                $scope.couche_requete = JSON.parse(couche)
            },250)            
           
            // console.log(JSON.parse(couche))
             
        }


        $scope.choisir_requete = function (option) {
           

            $('#loading_requete').show()
            if ( option == 0) {
                  myfactory.data("/api/v1/RestFull/datajson/" + $scope.theme_requete.shema + "/" + $scope.couche_requete.id_couche + "").then(function (data) {

                    for (var i = 0; i < data.length; i++) {

                          data[i].key_couche = $scope.couche_requete.key_couche 
                          data[i].id_couche = $scope.couche_requete.id_couche 
                          if ($scope.theme_requete.sous_thematiques) {
                                data[i].sous_thematique = true  
                          } else {
                            data[i].sous_thematique = false 
                          }

                          data[i] = fd_aliase_return(data[i])
                    }
                     

                    $scope.donne_de_requete= data
                     $('#loading_requete').hide()

                     if ($scope.donne_de_requete && $scope.option_recherche == 0) {
                        $scope.option_recherche = undefined
                        $timeout(function () {
                            $scope.option_recherche = 0
                            tablequ_verification_requete.splice(0,1)
                        },250)
                    }

                    $scope.option_recherche = option
             })

            }else if (option == 1) {
                 myfactory.data("/api/v1/RestFull/datajson/referentiels/LIM_communes/").then(function (data) {
                    
                    $scope.donne_de_requete = data

                     $('#loading_requete').hide()

                     $scope.resultat_requete = {}
                      $scope.option_recherche = option
                 })
            }else if (option == 2) {
                 myfactory.data("/api/v1/RestFull/datajson/referentiels/LIM_quartiers/").then(function (data) {
                    
                    $scope.donne_de_requete = data

                     $('#loading_requete').hide()

                     $scope.resultat_requete = {}
                      $scope.option_recherche = option
                 })
            }
           
        }

        function display_result_requete(couche,type_geometry) { 
               if (type_geometry == "point") {
                  
                                var features = []

                                var geom = JSON.parse(couche.geometry);

                                var newMarker = new ol.Feature({
                                        geometry: new ol.geom.Point(ol.proj.transform([geom.coordinates[0][0], geom.coordinates[0][1]], 'EPSG:4326', 'EPSG:3857')),
                                        pointAttributes: { 'name': 'data' },
                                        data: couche,
                                        champ_catalogue: couche
                                });
                                   
                                features[0] = newMarker;
                                  

                                var markerSource = new ol.source.Vector({
                                    features: features
                                });

                                var clusterSource = new ol.source.Cluster({
                                    distance: 80,
                                    source: markerSource
                                });


                                
                                var LayTheCopy = new ol.layer.Vector({
                                    source: clusterSource,
                                    style: function (feature) {
                                        
                                         style = new ol.style.Style({
                                            image: new ol.style.Icon({
                                                scale: 0.22,
                                                src: 'assets/images/icones-couches/' + couche.id_couche + '.png'
                                            })
                                         });
                                           
                                        return style;
                                    },
                                    visible: true
                                });


                                 LayTheCopy.setZIndex(2);
                                map.addLayer(LayTheCopy);
                                var extent = markerSource.getExtent();
                                map.setView(new ol.View({
                                      center: ol.proj.transform([geom.coordinates[0][0], geom.coordinates[0][1]], 'EPSG:4326', 'EPSG:3857'),
                                      zoom: 18
                                    }))
                                LayTheCopy.set('name', couche.id_couche);
                                LayTheCopy.set('nametable', couche.id_couche);
                                LayTheCopy.set('shema', couche.shema);

                                
               }else if (type_geometry == "Polygon") {

                     var markerSource = new ol.source.Vector();
                    
                          //champ_catalogue[i].remplir_couleur = couche.remplir_couleur 

                            if (couche.images_theme ) {
                                 var cnv = document.createElement('canvas');
                                var ctx = cnv.getContext('2d');
                                var img = new Image();
                                img.src =couche.images_theme;
                               
                                img.onload = function () {
                                    console.log(ctx.createPattern(img, 'repeat'))
                                    
                                     couche.images_theme =  ctx.createPattern(img, 'repeat');
                                    var geom = JSON.parse(couche.geometry);

                                   
                                    var newMarker = new ol.Feature({
                                        geometry: new ol.geom.Polygon([convertepolygon(geom.coordinates[0][0])]),
                                        pointAttributes: { 'name': 'data' },
                                        data: couche,
                                        champ_catalogue: couche
                                    });


                                    markerSource.addFeature(newMarker);


                               

                                    var LayThe = new ol.layer.Vector({
                                        source: markerSource,
                                        visible: true,
                                        style :stylePolygon
                                    });

                                    
                                    if (couche.opacity) {
                                        LayThe.setOpacity(couche.opacity)
                                    }

                                    

                                    LayThe.setZIndex(1);
                                    map.addLayer(LayThe);
                                    LayThe.set('name', couche.id_couche);
                                    LayThe.set('shema', couche.shema);

                                    var extent = markerSource.getExtent();
                                    map.getView().fit(extent, map.getSize(),{maxZoom:17});
                                   
                                }

                               
                            }else{

                                var geom = JSON.parse(couche.geometry);

                                   
                                    var newMarker = new ol.Feature({
                                        geometry: new ol.geom.Polygon([convertepolygon(geom.coordinates[0][0])]),
                                        pointAttributes: { 'name': 'data' },
                                        data: couche,
                                        champ_catalogue: couche
                                    });


                                    markerSource.addFeature(newMarker);


                               

                                    var LayThe = new ol.layer.Vector({
                                        source: markerSource,
                                        visible: true,
                                        style :stylePolygon
                                    });

                                    
                                    if (couche.opacity) {
                                        LayThe.setOpacity(couche.opacity)
                                    }

                                    

                                    LayThe.setZIndex(1);
                                    map.addLayer(LayThe);
                                    LayThe.set('name', couche.id_couche);
                                    LayThe.set('shema', couche.shema);

                                    var extent = markerSource.getExtent();
                                    map.getView().fit(extent, map.getSize(),{maxZoom:17});

                            }

                           

                                
 

               }else if (type_geometry == "LineString") {


                    
                            var markerSource = new ol.source.Vector();

                            

                                var geom = JSON.parse(couche.geometry);

                                // data.contour_couleur = couche.contour_couleur
                                var newMarker = new ol.Feature({
                                    geometry: new ol.geom.LineString(converteline(geom.coordinates[0])),
                                    pointAttributes: { 'name': 'data' },
                                    data: couche,
                                    champ_catalogue: couche
                                });


                                markerSource.addFeature(newMarker);


                           



                            var LayThe = new ol.layer.Vector({
                                source: markerSource,
                                style: styleLigne,
                                visible: true
                            });

                            // for (var i = 0; i < LayThe.getSource().getFeatures().length; i++) {

                            //     styleLigne(LayThe.getSource().getFeatures()[i],couche) 
                            // }

                            map.addLayer(LayThe);
                            LayThe.set('name', couche.id_couche);
                            LayThe.set('shema', couche.shema);
                            angular.element(event.target).attr('data_loaded', 'true');
                            var extent = markerSource.getExtent();
                            map.getView().fit(extent,map.getSize(),{maxZoom:18 } );

               } 

               $scope.selected_requete = ''
               $('#requete_input').val("")
        }

        var tablequ_verification_requete = []
        $scope.effectuer_requete =function (donne) {
            
            if (tablequ_verification_requete[0] && donne.id ) {
                if(tablequ_verification_requete[0].id != donne.id){
                     
                     tablequ_verification_requete[0]= donne
                      
                      if ($scope.couche_requete.geom == "Polygon") {
                        donne.images_theme = $scope.couche_requete.images_theme
                        donne.opacity = $scope.couche_requete.opacity
                        donne.remplir_couleur = $scope.couche_requete.remplir_couleur
                      }else if ($scope.couche_requete.geom == "LineString") {
                         donne.contour_couleur = $scope.couche_requete.contour_couleur
                      }
                      reset_layers()
                      display_result_requete(donne,$scope.couche_requete.geom)
                       

                       $scope.mode_requete = true
                }
            } else if (donne){
                if (donne.id) {
                    tablequ_verification_requete[0]= donne
                    
                    if ($scope.couche_requete.geom == "Polygon") {
                        donne.images_theme = $scope.couche_requete.images_theme
                        donne.opacity = $scope.couche_requete.opacity
                        donne.remplir_couleur = $scope.couche_requete.remplir_couleur
                    }else if ($scope.couche_requete.geom == "LineString") {
                         donne.contour_couleur = $scope.couche_requete.contour_couleur
                    }
                      reset_layers()
                      display_result_requete(donne,$scope.couche_requete.geom)
                    
                    $scope.mode_requete = true
                }
                
            }
            
            
        }

        $scope.effectuer_requete_commune = function (commune) { reset_layers()
           donne_commune = JSON.parse(commune)
            donne = {
                "table":$scope.couche_requete.id_couche,
                "shema":$scope.theme_requete.shema,
                "geom":donne_commune.geom,
            }

            myfactory.post_data("/thematique/queryLimite/", donne).then(function (data) {
                    
                 reset_layers()
                for (var i = 0; i < data.length; i++) {

                          data[i].key_couche = $scope.couche_requete.key_couche 
                          data[i].id_couche = $scope.couche_requete.id_couche 
                          if ($scope.theme_requete.sous_thematiques) {
                                data[i].sous_thematique = true  
                          } else {
                            data[i].sous_thematique = false 
                          }

                          data[i] = fd_aliase_return(data[i])

                    display_result_requete(data[i],'point')

                }
                donne_commune.images_theme = null
                donne_commune.opacity =1
                donne_commune.remplir_couleur = 'rgba(0,0,0,0)'

                display_result_requete(donne_commune,'Polygon')
                $scope.mode_requete = true

                
                $scope.resultat_requete.result = data.length
                $scope.resultat_requete.nom = donne_commune.name

                $scope.formatForDownload(data,$scope.couche_requete.nom +'_dans_'+$scope.resultat_requete.nom)
                
            })

        }

        $scope.effectuer_requete_quartier = function (quartier) {reset_layers()
           donne_quartier = JSON.parse(quartier)
            donne = {
                "table":$scope.couche_requete.id_couche,
                "shema":$scope.theme_requete.shema,
                "geom":donne_quartier.geom,
            }

            myfactory.post_data("/thematique/queryLimite/", donne).then(function (data) {
                    
                 reset_layers()
                for (var i = 0; i < data.length; i++) {

                    data[i].key_couche = $scope.couche_requete.key_couche 
                    data[i].id_couche = $scope.couche_requete.id_couche 
                    
                    if ($scope.theme_requete.sous_thematiques) {
                                data[i].sous_thematique = true  
                    } else {
                            data[i].sous_thematique = false 
                    }

                          data[i] = fd_aliase_return(data[i])

                    display_result_requete(data[i],'point')

                }
                donne_quartier.images_theme = null
                donne_quartier.opacity =1
                donne_quartier.remplir_couleur = 'rgba(0,0,0,0)'

                display_result_requete(donne_quartier,'Polygon')
                $scope.mode_requete = true

                
                $scope.resultat_requete.result = data.length
                $scope.resultat_requete.nom = donne_quartier.name
                
                $scope.formatForDownload(data,$scope.couche_requete.nom +'_dans_'+$scope.resultat_requete.nom)
            })

        }

        $scope.formatForDownload = function (data,titre) {
           
            $scope.DataExcel=[{
                name:titre,
                data:[
                ['dla','Source','Distance du réseau ENEO','Denomination',"Secteur d'activte",'Site web','Téléphone','Email','Longitude','Latitude']
                ]
            }];
            champ = []
            valeur = []
            angular.forEach(data[0], function (val,champZ) {
                if (champZ != 'id' && champZ != 'keyRequete__78' && champZ != 'geom' && champZ != 'geometry' && champZ != 'coord_x' && champZ != 'coord_y' && champZ != 'id_couche') {
                   champ.push(champZ)
                }
            })
            $scope.DataExcel[0].data[0]= champ
            for (var i = 0; i < data.length; i++) { 
                 valeur = []
                angular.forEach(data[i], function (val,champZ) {
                    if (champZ != 'id' && champZ != 'keyRequete__78' && champZ != 'geom' && champZ != 'geometry' && champZ != 'coord_x' && champZ != 'coord_y' && champZ != 'id_couche') {
                         valeur.push(val)
                    }
                   
                })

                $scope.DataExcel[0].data.push(valeur)
            }

           $(".file-excel").attr("xlsfilename",titre+".xls")
            
            
        }

        $scope.reset_requete = function () {
            reset_layers()
            $scope.mode_requete = false
        }


        var popup_adressage = new ol.Overlay({
                  element: document.getElementById('popup_adressage'),
                  stopEvent: true
         });
        

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////// partie de l'adressage///////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////


        myfactory.data("/adressage/codeUsage/").then(function (data) {
                        
            $scope.usage_adressage = [];
           

            for (var i = 0; i < data.length; i++) {
                if (data[i][0]) {
                    $scope.usage_adressage.push(data[i][0]) 
                }
            }

             //console.log($scope.usage_adressage)
                        
        }, function (msg) {

            $scope.Msg = "Réessayer,une erreur s'est produite ";
            document.getElementById("FourmErrs").style.top = "0px";

        });


        $scope.open_menu_adressage = function(){
              $scope.sous_thematiques_nom = 'Donnees d\'adressage'  


               $('.sous-adressage').show()

               $('slide1').css('transform', 'translatex(-100%)')
                $('slide1').css('display', 'none')

                $('slide2').css('transform', 'translatex(0)')
                $('.slide-arriere-thematiques').css('display', '-webkit-box')

                setTimeout(function () {
                    angular.element('.sous-thematiques-child').on('mouseenter', function (e) {

                        for (var i = 0; i < e.currentTarget.classList.length; i++) {
                            if (e.currentTarget.classList[i] == 'sous-thematiques-child') {
                                var a = setInterval(function () {
                                    angular.element(e.currentTarget.children[0].children[2].children[0]).css('margin-top', '5px')
                                }, 250)
                                var b = setInterval(function () {
                                    angular.element(e.currentTarget.children[0].children[2].children[0]).css('margin-top', '-3px')
                                }, 500)

                                setTimeout(function () {
                                    clearInterval(a)
                                    clearInterval(b)
                                    angular.element(e.currentTarget.children[0].children[2].children[0]).css('margin-top', '0px')

                                }, 1000)
                                angular.element('.sous-thematiques-child').on('mouseleave', function (e) {
                                    clearInterval(a)
                                    clearInterval(b)
                                    angular.element(e.currentTarget.children[0].children[2].children[0]).css('margin-top', '0px')

                                })
                            }
                        }


                    })
                }, 500)
        }

        $scope.vider_couche_adressage = function () {
            
            map.getLayers().forEach(function (layer) {

                if (layer.get('name') == 'couche_adresse' ) {
                        map.removeLayer(layer)
                }

            });

            map.getLayers().forEach(function (layer) {

                if (layer.get('name') == 'couche_adresse' ) {
                        map.removeLayer(layer)
                }

            });

            map.removeOverlay(popup_adressage)

            $scope.couche_adresse = undefined

        } 


        function  display_couche_adressage (data) { 

            $scope.couche_adresse = data
            
            map.getLayers().forEach(function (layer) {

                if (layer.get('name') == 'couche_adresse' ) {
                        map.removeLayer(layer)
                }

            });

            map.getLayers().forEach(function (layer) {

                if (layer.get('name') == 'couche_adresse' ) {
                        map.removeLayer(layer)
                }

            });

            map.removeOverlay(popup_adressage)

             var features = []
            for (var i = 0; i < data.length; i++) {
                var coord = JSON.parse(data[i].geometry).coordinates
                var geom = new ol.geom.Point(ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857'))
                data[i].type = 'couche_adresse'
                var newMarker = new ol.Feature({
                  geometry:geom,
                  pointAttributes: { 'name': 'data' },
                  champ_catalogue: data[i]
                });
                                   
                features.push(newMarker) ;
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
                                                        color: '#fff'
                                                    })
                                                }),
                                                text: new ol.style.Text({
                                                    text: size.toString(),
                                                    fill: new ol.style.Fill({
                                                        color: '#000'

                                                    }),
                                                    font: '10px sans-serif'
                                                })
                                            });
                                            styleCache[size] = style;
                                        }

                                    } else {
                                        var style = new ol.style.Style({
                                            image: new ol.style.Icon({
                                                scale: 0.55,
                                                src: 'assets/images/icones/marker.png'
                                            })
                                        });
                                    }

                                    return style;
                                },
                                visible: true
                });

                 var styleCacheCopy = {};
                var layer = new ol.layer.Vector({
                    source: clusterSource,
                    style:  function (feature) {
                                var size = feature.get('features').length;
                                var style = styleCacheCopy[size];
                                if (!style) {
                                    style = new ol.style.Style({

                                        image: new ol.style.Icon({
                                            scale: 0.6,
                                            src: 'assets/images/icones/marker.png'
                                        })
                                    });
                                        styleCacheCopy[size] = style;
                                }
                                return style;
                            }
                });

                layer.set('name', "couche_adresse");
                LayThe.set('name', "couche_adresse");

                map.addLayer(layer)
                map.addLayer(LayThe)

                

        }

        $scope.requete_adressage = function (usage) {
            $('#spinner_couche_adresse').show()

            myfactory.post_data("/adressage/getData/",{"usage":usage}).then(function (data) {

                display_couche_adressage (data)

                $('#spinner_couche_adresse').hide()
                            
            }, function (msg) {

                $('#spinner_couche_adresse').hide()
                $scope.Msg = "Réessayer,une erreur s'est produite ";
                document.getElementById("FourmErrs").style.top = "0px";

            });

        }




        $scope.display_result_adresse = function(couche,type){

            var geom = JSON.parse(couche.geometry); 

            $scope.details_result_adresse =   couche         

            for (var i = 0; i < $scope.resultat_adresse.length; i++) {
                    $scope.resultat_adresse[i].active =false
            }

            if (type == "properties") {
                couche.active =true
                map.addOverlay(popup_adressage);
                popup_adressage.setPosition(ol.proj.transform([geom.coordinates[0], geom.coordinates[1]], 'EPSG:4326', 'EPSG:3857'));
                
            }else{
                map.removeOverlay(popup_adressage);
            }
            

            map.getLayers().forEach(function (layer) {

                    if (layer.get('name') == "savoir" ) {
                        map.removeLayer(layer)
                    }

            });

                var features = []

                                var geom = JSON.parse(couche.geometry);

                                if (type != "properties") {
                                    var newMarker = new ol.Feature({
                                        geometry: new ol.geom.Point(ol.proj.transform([geom.coordinates[0], geom.coordinates[1]], 'EPSG:4326', 'EPSG:3857')),
                                        pointAttributes: { 'name': 'data' },
                                        champ_catalogue:{'keyRequete__78':couche.adresse}
                                    });
                                } else{
                                    var newMarker = new ol.Feature({
                                        geometry: new ol.geom.Point(ol.proj.transform([geom.coordinates[0], geom.coordinates[1]], 'EPSG:4326', 'EPSG:3857')),
                                        pointAttributes: { 'name': 'data' },
                                    });
                                }
                                
                                
                               

                                features[0] = newMarker;
                                  

                                var markerSource = new ol.source.Vector({
                                    features: features
                                });

                                var clusterSource = new ol.source.Cluster({
                                    distance: 80,
                                    source: markerSource
                                });


                                
                                var LayTheCopy = new ol.layer.Vector({
                                    source: clusterSource,
                                    style: function (feature) {
                                        
                                         style = new ol.style.Style({
                                            image: new ol.style.Icon({
                                                scale: 0.1,
                                                src: "assets/images/icones/map-position.svg"
                                            })
                                         });
                                           
                                        return style;
                                    },
                                    visible: true
                                });


                                /* LayTheCopy.setZIndex(20);*/
                                map.setView(new ol.View({
                                      center: ol.proj.transform([geom.coordinates[0], geom.coordinates[1]], 'EPSG:4326', 'EPSG:3857'),
                                      zoom: 18
                                    }))
                                map.addLayer(LayTheCopy);
                                var extent = markerSource.getExtent();
                                 // map.getView().fit(geometry.getExtent(), { 'maxZoom': 20, 'duration': 500 })
                                //map.getView().fit(extent, { 'maxZoom': 19, 'duration': 500 });
                                LayTheCopy.set('name', "savoir");

        }

        $('#resultat_adresse').hide() 
        $scope.getAdresse =function (adresse) {
            if (adresse) {
                donne = {
                    "adresse":adresse
                }
                $scope.resultat_adresse = undefined
                $('#resultat_adresse').show()

                myfactory.post_data("/adressage/getPosition/", donne).then(function (couche) {

                    
                    couche = couche[0]
                    var geom = JSON.parse(couche.geometry);
                    couche.adresse = adresse
                    $scope.donne_adresse = couche
                    coord = {
                        "coord": geom.coordinates,
                        "nom_rue":adresse.substring(adresse.indexOf(' ') +1)
                    }

                    myfactory.post_data("/adressage/getPoints/", coord).then(function (data) {
                        
                        $scope.resultat_adresse = data
                        console.log($scope.resultat_adresse)
                    })
                    
                    
                })
            }
        }

        $scope.clear_adress =  function () {
            $('#resultat_adresse').hide() 
             map.removeOverlay(popup_adressage);
            map.getLayers().forEach(function (layer) {

                    if (layer.get('name') == "savoir" ) {
                        map.removeLayer(layer)
                    }

            });
             $scope.resultat_adresse = undefined
        }


        ////////////////////////////////////////////////////////////////////////////////////
        ////////////////////////////// partie du calcul d itineraire////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////

        $('#spinner_depart').hide()
        $('#spinner_arrive').hide()

        $scope.itineraire = {
           "depart":{},
           "arrive":{},
           "itineraire":{}
        }

        function positionMarquer(geom,type){ 

            map.getLayers().forEach(function (layer) {

                if (layer.get('name') == type ) {
                        map.removeLayer(layer)
                }

            });

            var features = []

               var newMarker = new ol.Feature({
                  geometry:geom,
                  pointAttributes: { 'name': 'data' },
                  champ_catalogue: {"keyRequete__78": "Point de "+type}
                });
                                   
                features[0] = newMarker;
                                  

                var markerSource = new ol.source.Vector({
                    features: features
                });

                var layer = new ol.layer.Vector({
                    source: markerSource,
                    style: function (feature) {
                        style = new ol.style.Style({
                                image: new ol.style.Icon({
                                          scale: 1,
                                          src: 'assets/images/icones/'+type+'.png'
                                       })
                                });
                                           
                        return style;
                    }
                });

                layer.set('name', type);

                map.addLayer(layer)

                

                $scope.itineraire[type].geometry = ol.proj.transform(geom.getCoordinates(), 'EPSG:3857', 'EPSG:4326')

                if ($scope.itineraire['itineraire'].geometry) {
                     $scope.create_itineraire()
                }

                if ($scope.itineraire['depart'].geometry && $scope.itineraire['arrive'].geometry) {

                    $('.settings-itineraire-btn').show()
                }

                $('.itineraire-supprimer').show()
                
        }

         var draw; 
        $scope.positioner_marker = function(type){

            if (type == "depart") {
                var color = "rgb(0, 158, 255)"
            }else{
                var color = "rgb(255, 107, 0)"
            }
             map.removeInteraction(draw);
             var source = new ol.source.Vector({wrapX: false});

              var vector = new ol.layer.Vector({
                source: source
              });

             

              function addInteraction() {
                
                  draw = new ol.interaction.Draw({
                    source: source,
                    type: 'Point',
                    style: new ol.style.Style({
    
                      image: new ol.style.Circle({
                        radius: 5,
                        fill: new ol.style.Fill({
                          color: color
                        })
                      })
                    })
                  });
                  map.addInteraction(draw);
              }

              addInteraction()

              draw.on("drawend",function(e){ 
 
               var coord = e.feature.getGeometry().getCoordinates();
               var geom = new ol.geom.Point(e.feature.getGeometry().getCoordinates())
               
               positionMarquer(geom,type)

               map.removeInteraction(draw);

            });


        }

        $scope.positioner_marker_adresse = function(adresse,type){


            if (adresse) {

                donne = {
                    "adresse":adresse
                }
                 $('#spinner_'+type).show()

                myfactory.post_data("/adressage/getPosition/", donne).then(function (couche) {
                    couche = couche[0]
                    var coord = JSON.parse(couche.geometry).coordinates;
                    var geom = new ol.geom.Point( ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857'))
                    positionMarquer(geom,type)

                     $('#spinner_'+type).hide()
                    
                })
            }


        }


        function display_itineraire (itineraire) {

            map.getLayers().forEach(function (layer) { 

                if (layer.get('name') == 'itineraire' ) {
                        map.removeLayer(layer)
                }

            });
            
            var source = new ol.source.Vector({wrapX: false});

            var vector = new ol.layer.Vector({
                source: source,
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                    width: 6, 
                    color: '#1CAC77'
                       })
                    })
            });

            var route = new ol.format.Polyline({
                 factor: 1e5
            }).readGeometry(itineraire.routes[0].geometry, {
                        dataProjection: 'EPSG:4326',
                        featureProjection: 'EPSG:3857'
              });

            var feature = new ol.Feature({
                type: 'route',
                geometry: route

            });

            vector.getSource().addFeature(feature);

            vector.set('name', 'itineraire');
            map.addLayer(vector)

            var extent = vector.getSource().getExtent();

            if (!$scope.itineraire['itineraire'].geometry) {
                 map.getView().fit(extent, map.getSize());
            }
           

            $scope.itineraire['itineraire'].geometry = itineraire.routes[0].geometry

            map.getLayers().forEach(function (layer) { console.log(layer.get('name'))

                // if (layer.get('name') == 'itineraire' || layer.get('name') == 'depart' || layer.get('name') == 'arrive') {
                //         map.removeLayer(layer)
                // }
               
            });
        }

        $scope.create_itineraire = function(){

            $('#spinner_itineraire').show()
            var a = $scope.itineraire['depart'].geometry
            var b = $scope.itineraire['arrive'].geometry

            myfactory.data("http://127.0.0.1:5000/route/v1/driving/"+a[0]+","+a[1]+";"+b[0]+","+b[1]+"?steps=false&overview=full").then(function (itineraire) {
                console.log(itineraire)

                display_itineraire(itineraire) 

                $('#spinner_itineraire').hide()

                

            })
        }

        $scope.destroy_itineraire =function(){

            map.getLayers().forEach(function (layer) {

                if (layer.get('name') == 'itineraire' || layer.get('name') == 'depart' || layer.get('name') == 'arrive') {
                        map.removeLayer(layer)
                }
               
            });

             map.getLayers().forEach(function (layer) { 

                if (layer.get('name') == 'itineraire' || layer.get('name') == 'depart' || layer.get('name') == 'arrive') {
                        map.removeLayer(layer)
                }
               
            });

             $('.itineraire-supprimer').hide()
             
                $('.settings-itineraire-btn').hide()

                $scope.itineraire = {
                   "depart":{},
                   "arrive":{},
                   "itineraire":{}
                }

            
        }

    })

    
})

function verification(couches) {

    var bool = false;

    angular.forEach(couches, function (item) {

        if ($("#" + item.id_couche).prop('checked') === false) {

            bool = true;

        }

    });
    return bool;
}


/*-- -------------------------------------End show layer---------------------------------------------*/
//*-------------------------------------------------------------------------------------------------*/

app.factory('myfactory', function ($http, $q) {
    var factory = {
        data: function (url) {
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
        }
    }
    return factory;
})

app.directive('cartesDirective', function () {
    return {
        restrict: 'E',
        templateUrl: 'assets/views/cartes.html',
        link: function (scope, element, attrs) {

            scope.open_sousfonds = function (id) {
                scope.sous_fonds = scope.fonds_cartes[id].fonds
                scope.sous_fonds_nom = scope.fonds_cartes[id].nom


                $('slide1_fonds').css('transform', 'translatex(-100%)')
                $('slide1_fonds').css('display', 'none')

                $('slide2_fonds').css('transform', 'translatex(0)')
                $('.menu-sous-fonds').css('display', 'block')
                $('.slide-arriere-fonds').css('display', '-webkit-box')

                setTimeout(function () {
                    // slider
                    $('.rzslider .rz-bar').css('background', scope.black)
                    $('.rzslider .rz-selection').css('background', "#1CAC77")
                    $('.rzslider .rz-pointer').css('background', "#1CAC77")
                    $('style').append('.rzslider .rz-pointer:after {background:' + scope.black + ';}')

                }, 100)

            }

            scope.close_sousfonds = function () {
                $('slide2_fonds').css('transform', 'translatex(100%)')
                $('.menu-sous-fonds').css('display', 'none')
                $('.slide-arriere-fonds').css('display', 'none')

                $('slide1_fonds').css('transform', 'translatex(0%)')
                $('slide1_fonds').css('display', 'block')
            }

            scope.slide_on = function (sliderId, modelValue) {

                scope.fonds_cartes[sliderId.split('')[0]].fonds[sliderId.split('')[0]].value = modelValue
            }
        }
    };
})

app.directive('thematiquesDirective', function () {
    return {
        restrict: 'E',
        templateUrl: 'assets/views/thematiques.html',
        link: function (scope, element, attrs) {

            $('.menu-thematiques-child').on('mouseenter', function (e) {
                var a = setInterval(function () {
                    $('.menu-thematiques-child-next-rouge').css('margin-left', '10px')
                }, 250)
                var b = setInterval(function () {
                    $('.menu-thematiques-child-next-rouge').css('margin-left', '2px')
                }, 500)

                setTimeout(function () {
                    clearInterval(a)
                    clearInterval(b)
                    $('.menu-thematiques-child-next-rouge').css('margin-left', '2px')
                }, 1000)
                $('.menu-thematiques-child').on('mouseleave', function (e) {
                    clearInterval(a)
                    clearInterval(b)
                })

            })

            scope.open_sousThemes = function (id) {
                scope.couches = [];
                scope.sous_thematiques = [];
                scope.sous_thematiques_nom = scope.thematiques[id].nom
                scope.shema = scope.thematiques[id].shema

                if (scope.thematiques[id].sous_thematiques != false) {

                    scope.sous_thematiques = scope.thematiques[id].sous_thematiques

                } else {

                    scope.couches = scope.thematiques[id].couches


                }

                $('slide1').css('transform', 'translatex(-100%)')
                $('slide1').css('display', 'none')

                $('slide2').css('transform', 'translatex(0)')
                $('.sous-thematiques').css('display', 'block')
                $('.slide-arriere-thematiques').css('display', '-webkit-box')

                setTimeout(function () {
                    angular.element('.sous-thematiques-child').on('mouseenter', function (e) {

                        for (var i = 0; i < e.currentTarget.classList.length; i++) {
                            if (e.currentTarget.classList[i] == 'sous-thematiques-child') {
                                var a = setInterval(function () {
                                    angular.element(e.currentTarget.children[0].children[2].children[0]).css('margin-top', '5px')
                                }, 250)
                                var b = setInterval(function () {
                                    angular.element(e.currentTarget.children[0].children[2].children[0]).css('margin-top', '-3px')
                                }, 500)

                                setTimeout(function () {
                                    clearInterval(a)
                                    clearInterval(b)
                                    angular.element(e.currentTarget.children[0].children[2].children[0]).css('margin-top', '0px')

                                }, 1000)
                                angular.element('.sous-thematiques-child').on('mouseleave', function (e) {
                                    clearInterval(a)
                                    clearInterval(b)
                                    angular.element(e.currentTarget.children[0].children[2].children[0]).css('margin-top', '0px')

                                })
                            }
                        }


                    })
                }, 500)

            }

            scope.close_sousThemes = function () {

                // adressage
                $('.sous-adressage').hide()
                // adressage
                $('slide2').css('transform', 'translatex(100%)')
                $('.sous-thematiques').css('display', 'none')
                $('.slide-arriere-thematiques').css('display', 'none')

                $('slide1').css('transform', 'translatex(0%)')
                $('slide1').css('display', 'block')
            }

            scope.toogle_couches = function (id) {
                scope.sous_thematiques[id].active = !scope.sous_thematiques[id].active
            }
        }
    };
})

app.directive('settingsDirective', function () {
    return {
        restrict: 'E',
        templateUrl: 'assets/views/settings.html',
        link: function (scope, element, attrs) {

        }
    }

})



