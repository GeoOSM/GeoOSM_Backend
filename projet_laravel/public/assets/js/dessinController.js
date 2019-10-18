app.controller('dessinController', function ($scope, olData, myfactory) {

  var style;
  var draw;
  var vectorpoint;
  var color = "#1CAC77";
  $scope.update = false;
  var rgb = hexToRgb(color);
  var sourcepoint = new ol.source.Vector();
  var sourcepolygon = new ol.source.Vector();
  var sourceline = new ol.source.Vector();
  var singleClick;
  var point = [];
  var polygon = [];
  var line = [];


  style = new ol.style.Style({
    fill: new ol.style.Fill({
      color: [rgb.r, rgb.g, rgb.b, 0.1]
    }),
    stroke: new ol.style.Stroke({
      color: color,
      width: 4
    }),
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
        color: color
      })
    })
  })

  function StyleFeature(colorxx) {

    var rgb = hexToRgb(colorxx);
    style = new ol.style.Style({
      fill: new ol.style.Fill({
        color: [rgb.r, rgb.g, rgb.b, 0.1]
      }),
      stroke: new ol.style.Stroke({
        color: colorxx,
        width: 4
      }),
      image: new ol.style.Circle({
        radius: 6,
        fill: new ol.style.Fill({
          color: colorxx
        })
      })
    })

  }

  $('.color').css('color', color);

  var palette = $('#palette');

  $('.color-fill-icon', $(this)).removeClass('colorpicker-color');
  $('.color-fill-icon').css('background-color', "#1CAC77");

  palette.colorpickerplus();

  palette.on('changeColor', function (e, colorx) {

    color = colorx

    if (color == null) {
      $('.color-fill-icon', $(this)).addClass('colorpicker-color');
      $('.color-fill-icon', $(this)).css('background-color', "#1CAC77");
    } else {
      $('.color-fill-icon', $(this)).removeClass('colorpicker-color');
      $('.color-fill-icon', $(this)).css('background-color', color);
      $('.color').css('color', color);

    }
  });


  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  $('#palette').click(function () {

    $('.colorpicker-element').hide()
    $('.colorpickerplus span').hide()

  });


  //polygon
  var vectorpolygon = new ol.layer.Vector({
    source: sourcepolygon,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: '#801b59',
        width: 3
      })
    })
  });



  //point
  var vectorpoint = new ol.layer.Vector({
    source: sourcepoint,
    style: style
  });


  //line
  var vectorline = new ol.layer.Vector({
    source: sourceline,
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: '#1CAC77'
      }),
      stroke: new ol.style.Stroke({
        color: '#00a740',
        width: 3
      })
    })
  });





  olData.getMap().then(function (map) {


    function ajout_couche() {

      var boolpoint = false;
      var boolline = false;
      var boolpolygone = false;

      map.getLayers().forEach(function (layer) {

        if (layer.get('name') == "vect_point") {
          boolpoint = true;
        }

        if (layer.get('name') == "vect_line") {
          boolline = true;
        }

        if (layer.get('name') == "vect_polygon") {

          boolpolygone = true;
        }


      });


      if (boolpolygone == false) {

        map.addLayer(vectorpolygon);
        vectorpolygon.set('name', "vect_polygon");
      }

      if (boolline == false) {

        map.addLayer(vectorline);
        vectorline.set('name', "vect_line");
      }

      if (boolpoint == false) {

        map.addLayer(vectorpoint);
        vectorpoint.set('name', "vect_point");
      }

    }




    //Overlay comment
    var extent = map.getView().calculateExtent(map.getSize());
    var cor = getCenterOfExtent(extent);
    var comment = new ol.Overlay({
      position: [cor[0], cor[1]],
      element: document.getElementById('comment')
    });
    map.addOverlay(comment);
    $("#comment").hide();

    function getCenterOfExtent(Extent) {
      var X = Extent[0] + (Extent[2] - Extent[0]) / 2;
      var Y = Extent[1] + (Extent[3] - Extent[1]) / 2;
      return [X, Y];
    }


    //close comment
    $("#comment").on("click", ".close-comment", function () {
      $("#comment").hide();
      $("#text-comment").val(null);
    });

    var idpoint = 0;
    function addInteractionpoint() {

      var value = value;
      if (value !== 'None') {
        draw = new ol.interaction.Draw({
          source: sourcepoint,
          type: ('Point'),
          style: new ol.style.Style({

            image: new ol.style.Circle({
              radius: 5,
              stroke: new ol.style.Stroke({
                color: '#434343'
              }),
              fill: new ol.style.Fill({
                color: '#1CAC77'
              })
            })
          })
        });
        map.addInteraction(draw);
      }
      draw.on("drawend", function (e) {
        $('#resultMap').show();
        var coord = e.feature.getGeometry().getCoordinates();
        comment.setPosition(coord);
        $("#comment").show();
        $("#text-comment").val(null);
        f = e.feature;
        f.set('descripion', "");
        f.set('id', idpoint);

       // point.push({ "id": idpoint, "description": null, "type": "point", "geometry": coord, "hexa_code": color });
        StyleFeature(color);
        f.setStyle(style)
        idpoint++;
        $scope.pointCoord = ol.proj.transform([coord[0],coord[1]], 'EPSG:3857', 'EPSG:4326').toString() 
        console.log(coord,$scope.pointCoord)

        $scope.extent = undefined
        $scope.$apply()
      });

      draw.on("drawstart", function (e) { 
            $scope.pointCoord = undefined
            sourcepoint.clear();
            $scope.$apply()
      })

    }

    var idpolygon = 0;
    function addInteractionpolygon() {

      var value = value;
      if (value !== 'None') {
        draw = new ol.interaction.Draw({
          source: sourcepolygon,
          type: ('Polygon'),
          style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: '#1CAC77'
            }),
            stroke: new ol.style.Stroke({
              color: '#434343',
              lineDash: [10, 10],
              width: 2
            }),
            image: new ol.style.Circle({
              radius: 5,
              stroke: new ol.style.Stroke({
                color: '#434343'
              }),
              fill: new ol.style.Fill({
                color: '#1CAC77'
              })
            })
          })
        });
        map.addInteraction(draw);
      }


      draw.on("drawend", function (e) {
        $('#resultMap').show();
        
        var coord = e.feature.getGeometry().getCoordinates();

        comment.setPosition(coord[0][1]);
        $("#comment").show();
        $("#text-comment").val(null);
        f = e.feature;
        f.set('descripion', "");
        polygon.push({ "id": idpolygon, "description": null, "type": "polygon", "geometry": coord, "hexa_code": color });
        StyleFeature(color);
        f.setStyle(style);
        idpolygon++;

        var extend3857 = e.feature.getGeometry().getExtent()
        var Amin = ol.proj.transform([extend3857[0],extend3857[1]], 'EPSG:3857', 'EPSG:4326') 
        var Amax = ol.proj.transform([extend3857[2],extend3857[3]], 'EPSG:3857', 'EPSG:4326')

        var extend4326 = Amin[0]+','+Amin[1]+','+Amax[0]+','+Amax[1]
        $scope.extent = extend4326

        $scope.pointCoord = undefined
        
        $scope.$apply()
       
      }); 

      draw.on("drawstart", function (e) { 
            $scope.extent = undefined
            sourcepolygon.clear();

            $scope.$apply()
      })

    }

    var idline = 0;
    function addInteractionline() {

      var value = value;
      if (value !== 'None') {
        draw = new ol.interaction.Draw({
          source: sourceline,
          type: ('LineString'),
          style: new ol.style.Style({
            fill: new ol.style.Fill({
              color: '#1CAC77'
            }),
            stroke: new ol.style.Stroke({
              color: '#434343',
              lineDash: [10, 10],
              width: 2
            }),
            image: new ol.style.Circle({
              radius: 5,
              stroke: new ol.style.Stroke({
                color: '#434343'
              }),
              fill: new ol.style.Fill({
                color: '#1CAC77'
              })
            })
          })
        });
        map.addInteraction(draw);
      }

      draw.on("drawend", function (e) {

        var coord = e.feature.getGeometry().getCoordinates();
        comment.setPosition(coord[0]);
        $("#comment").show();
        $("#text-comment").val(null);
        f = e.feature;
        f.set('descripion', "");
        line.push({ "id": idline, "description": null, "type": "LineString", "geometry": coord, "hexa_code": color });
        StyleFeature(color);
        f.setStyle(style);
        idline++;

      });

    }


    //select Feature

    var selectedFeatureID;
    var f1;

    function addSelect() {

      map.removeInteraction(draw);
      map.removeInteraction(singleClick);


      singleClick = new ol.interaction.Select();

      map.addInteraction(singleClick);


      singleClick.getFeatures().on('add', function (event) {

        var properties = event.element.getProperties();
        selectedFeatureID = properties.geometry.i;
        if ($scope.update == false) {
          removeSelectedFeature(event.element);
        } else {
          singleClick.getFeatures().clear();

          if (event.element.getGeometry().getType() == "Point") {
            var desc = event.element.U.descripion;
            coord = event.element.getGeometry().getCoordinates();
            comment.setPosition(coord);
            $("#comment").show();
            $("#text-comment").val(desc);
            f1 = event.element;
            StyleFeature(color);
            f1.setStyle(style)

          }

          if (event.element.getGeometry().getType() == "Polygon") {
            var desc = event.element.U.descripion;
            coord = event.element.getGeometry().getCoordinates();
            comment.setPosition(coord[0][1]);
            $("#comment").show();
            $("#text-comment").val(desc);
            f1 = event.element;
            StyleFeature(color);
            f1.setStyle(style)
          }

          if (event.element.getGeometry().getType() == "LineString") {
            var desc = event.element.U.descripion;
            coord = event.element.getGeometry().getCoordinates();
            comment.setPosition(coord[0]);
            $("#comment").show();
            $("#text-comment").val(desc);
            f1 = event.element;
            StyleFeature(color);
            f1.setStyle(style)
          }


        }
      });
    }

    //converte Feature coordinate polygon

    function convertepolygon(features) {




      var data = [];

      for (var i = 0; i < features[0].length; i++) {

        data.push(ol.proj.transform(features[0][i], 'EPSG:3857', 'EPSG:4326'))
      }

      return data;

    }

    //converte Feature coordinate linestring

    function converteline(features) {




      var data = [];

      for (var i = 0; i < features.length; i++) {

        data.push(ol.proj.transform(features[i], 'EPSG:3857', 'EPSG:4326'))
      }

      return data;

    }



    //remove Selected Feature
    function removeSelectedFeature(elem) {

      $scope.update = false;
      if (elem.getGeometry().getType() == "Point") {
        sourcepoint.removeFeature(elem);
        singleClick.getFeatures().clear();

        $.each(point, function (i) {
          if (point[i].id == elem.U.id) {
            point.splice(i, 1);

            return false;
          }
        });


      }



      if (elem.getGeometry().getType() == "Polygon") {
        sourcepolygon.removeFeature(elem);
        singleClick.getFeatures().clear();

        $.each(polygon, function (i) {
          if (polygon[i].id == elem.U.id) {
            polygon.splice(i, 1);

            return false;
          }
        });

      }

      if (elem.getGeometry().getType() == "LineString") {

        sourceline.removeFeature(elem);
        singleClick.getFeatures().clear();


        $.each(line, function (i) {
          if (line[i].id == elem.U.id) {
            line.splice(i, 1);

            return false;
          }
        });

      }

    }


    //point
    $scope.dessin_point = function (pointx) {
      if (pointx) {

        ajout_couche();
        map.removeInteraction(draw);
        map.removeInteraction(singleClick);
        $("#comment").hide();
        addInteractionpoint();
        $scope.update = false;

      } else {

        map.removeInteraction(draw);
        $("#comment").hide();
        $scope.update = false;

        $scope.supprimer_dessin() 

      }

    }

    //polygone
    $scope.dessin_polygon = function (polygonx) { 
      if (polygonx) {

        ajout_couche();
        map.removeInteraction(draw);
        map.removeInteraction(singleClick);
        $("#comment").hide();
        addInteractionpolygon();
        $scope.update = false;

      } else {

        map.removeInteraction(draw);
        $("#comment").hide();

        $scope.supprimer_dessin() 

      }

    }



    //line
    $scope.dessin_line = function (linex) {

      if (linex) {

        ajout_couche();
        map.removeInteraction(draw);
        map.removeInteraction(singleClick);
        $("#comment").hide();
        addInteractionline();
        $scope.update = false;
      } else {

        map.removeInteraction(draw);
        $("#comment").hide();
        $scope.update = false;

      }

    }


    //suppression
    $scope.dessin_supp = function (supp) {

      if (supp) {
        map.removeInteraction(draw);
        addSelect();
        $scope.update = false;


      } else {

        map.removeInteraction(singleClick);
        $("#comment").hide();
        $scope.update = false;
      }


    }

    //Modefication
    $scope.modifier_dessin = function (mod) {

      if (mod) {
        map.removeInteraction(draw);
        addSelect();
        $scope.update = mod;

      } else {
        map.removeInteraction(singleClick);
        $("#comment").hide();
        $scope.update = mod;

      }
    }

    $scope.supprimer_dessin = function () {

      map.removeInteraction(draw);
      map.removeInteraction(singleClick);

      map.getLayers().forEach(function (layer) {

        sourcepoint.clear();
        sourcepolygon.clear();
        sourceline.clear();
        point = [];
        polygon = [];
        line = [];

        idpoint = 0;
        idline = 0;
        idpolygon = 0;

        if (layer.get('name') == "vect_point") {
          map.removeLayer(layer)
        }

        if (layer.get('name') == "vect_line") {

          map.removeLayer(layer)
        }

        if (layer.get('name') == "vect_polygon") {

          map.removeLayer(layer)
        }
      });


    }


    $scope.ExportDXF = function () {

      map.removeInteraction(draw);
      map.removeInteraction(singleClick);
      $scope.update = false;
      var data_line = {
        "type": "FeatureCollection",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        "features": []
      }
      var data_point = {
        "type": "FeatureCollection",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        "features": []
      }
      var data_polygon = {
        "type": "FeatureCollection",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        "features": []
      }
      // point Geojson   
      if (point.length != 0) {

        for (var i = 0; i < point.length; i++) {

          data_point["features"].push({ "type": "Feature", "properties": { "commentaire": point[i].description }, "geometry": { "type": point[i].type, "coordinates": ol.proj.transform(point[i].geometry, 'EPSG:3857', 'EPSG:4326') } })
        }

      }


      // polygon Geojson 
      if (polygon.length != 0) {

        // point Geojson   
        for (var i = 0; i < polygon.length; i++) {

          data_polygon["features"].push({ "type": "Feature", "properties": { "commentaire": polygon[i].description }, "geometry": { "type": polygon[i].type, "coordinates": [convertepolygon(polygon[i].geometry)] } })
        }
      }

      // line Geojson 
      if (line.length != 0) {

        // point Geojson   
        for (var i = 0; i < line.length; i++) {

          data_line["features"].push({ "type": "Feature", "properties": { "commentaire": line[i].description }, "geometry": { "type": line[i].type, "coordinates": converteline(line[i].geometry) } })



        }


      }

      var json = myfactory.data("https://cuy.sogefi.cm:8443/dxf/" + JSON.stringify(data_point) + "/" + JSON.stringify(data_polygon) + "/" + JSON.stringify(data_line)).then(function (data) {

        var d = new Date();
        var curr_date = d.getDate(); 
        var curr_month = d.getMonth() + 1;
        var curr_year = d.getFullYear();

        var link = document.getElementById("dow");


        if (point.length != 0) {

          setTimeout(function () {
            link.href = 'assets/nodejs/Point.dxf';
            link.target = '_blank';
            link.download = 'Point.dxf';
            link.click();
            
          //   link.href = 'assets/nodejs/DessinPoint.zip';
          //  link.click();
          //   window.open('assets/nodejs/Point.dxf');
          }, 1000);

        }



        if (line.length != 0) {


          setTimeout(function () {
            link.href = 'assets/nodejs/Line.dxf';
            link.target = '_blank';
            link.download = 'Line.dxf';
            link.click();
            // window.open('assets/nodejs/Line.dxf');
          }, 2000);

        }


        if (polygon.length != 0) {

          setTimeout(function () {
            link.href = 'assets/nodejs/Polygone.dxf';
            link.target = '_blank';
            link.download = 'Polygone.dxf';
            link.click();
            // window.open('assets/nodejs/Polygone.dxf');
          }, 3000);

        }

      }, function (err) {

        console.log("err")

      });

    }


    $scope.Export = function () {
      
            map.removeInteraction(draw);
            map.removeInteraction(singleClick);
            $scope.update = false;
            var data_line = {
              "type": "FeatureCollection",
              "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
              "features": []
            }
            var data_point = {
              "type": "FeatureCollection",
              "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
              "features": []
            }
            var data_polygon = {
              "type": "FeatureCollection",
              "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
              "features": []
            }
            // point Geojson   
            if (point.length != 0) {
      
              for (var i = 0; i < point.length; i++) {
      
                data_point["features"].push({ "type": "Feature", "properties": { "commentaire": point[i].description }, "geometry": { "type": point[i].type, "coordinates": ol.proj.transform(point[i].geometry, 'EPSG:3857', 'EPSG:4326') } })
              }
      
            }
      
      
            // polygon Geojson 
            if (polygon.length != 0) {
      
              // point Geojson   
              for (var i = 0; i < polygon.length; i++) {
      
                data_polygon["features"].push({ "type": "Feature", "properties": { "commentaire": polygon[i].description }, "geometry": { "type": polygon[i].type, "coordinates": [convertepolygon(polygon[i].geometry)] } })
              }
            }
      
            // line Geojson 
            if (line.length != 0) {
      
              // point Geojson   
              for (var i = 0; i < line.length; i++) {
      
                data_line["features"].push({ "type": "Feature", "properties": { "commentaire": line[i].description }, "geometry": { "type": line[i].type, "coordinates": converteline(line[i].geometry) } })
      
      
      
              }
      
      
            }
      
            var json = myfactory.data("https://cuy.sogefi.cm:8443/shape/" + JSON.stringify(data_point) + "/" + JSON.stringify(data_polygon) + "/" + JSON.stringify(data_line)).then(function (data) {
      
              var d = new Date();
              var curr_date = d.getDate();
              var curr_month = d.getMonth() + 1;
              var curr_year = d.getFullYear();
      
              var link = document.getElementById("dow");
      
      
              if (point.length != 0) {
      
                setTimeout(function () {

                  link.href = 'assets/nodejs/DessinPoint.zip';
                  link.target = '_blank';
                  link.download = 'DessinPoint.zip';
                  link.click();
                  
                //   link.href = 'assets/nodejs/DessinPoint.zip';
                //  link.click();
                }, 1000);
      
              }
      
      
      
              if (line.length != 0) {
      
      
                setTimeout(function () {

                  link.href = 'assets/nodejs/DessinLine.zip';
                  link.target = '_blank';
                  link.download = 'DessinLine.zip';
                  link.click();

                  // link.href = 'assets/nodejs/DessinLine.zip';
                  // link.click();
                }, 2000);
      
              }
      
      
              if (polygon.length != 0) {
      
                setTimeout(function () {

                  link.href = 'assets/nodejs/DessinPolygone.zip';
                  link.target = '_blank';
                  link.download = 'DessinPolygone.zip';
                  link.click();


                  // link.href = 'assets/nodejs/DessinPolygone.zip';
                  // link.click();
                }, 3000);
      
              }
      
            }, function (err) {
      
              console.log("err")
      
            });
      
          }


    $scope.save_comment = function () {


      if ($scope.update == false) {

        var comment = $("#text-comment").val();

        //
        if (f.getGeometry().getType() == "Point") {
          point.pop();
          var coord = f.getGeometry().getCoordinates();
          $("#comment").hide();
          $("#text-comment").val(null);
          f.set('descripion', comment);
          point.push({ "id": f.U.id, "description": comment, "type": "point", "geometry": coord, "hexa_code": color });

        }

        //
        if (f.getGeometry().getType() == "Polygon") {
          polygon.pop();
          var coord = f.getGeometry().getCoordinates();
          $("#comment").hide();
          $("#text-comment").val(null);
          f.set('descripion', comment);
          polygon.push({ "id": f.U.id, "description": comment, "type": "polygon", "geometry": coord, "hexa_code": color });


        }


        if (f.getGeometry().getType() == "LineString") {
          line.pop();
          var coord = f.getGeometry().getCoordinates();
          $("#comment").hide();
          $("#text-comment").val(null);
          f.set('descripion', comment);
          line.push({ "id": f.U.id, "description": comment, "type": "LineString", "geometry": coord, "hexa_code": color });
        }


      } else {

        var comment = $("#text-comment").val();


        //
        if (f1.getGeometry().getType() == "Point") {
          $("#comment").hide();
          $("#text-comment").val(null);
          f1.set('descripion', comment);
          point.forEach(function (objet, id) {
            if (objet.id == f1.U.id) {
              objet.description = comment;
              objet.hexa_code = color;
            }
          });

        }

        //
        if (f1.getGeometry().getType() == "Polygon") {
          var coord = f1.getGeometry().getCoordinates();
          $("#comment").hide();
          $("#text-comment").val(null);
          f1.set('descripion', comment);
          polygon.forEach(function (objet, id) {
            if (objet.id == f1.U.id) {
              objet.description = comment;
              objet.hexa_code = color;

            }
          });
        }


        if (f1.getGeometry().getType() == "LineString") {
          var coord = f1.getGeometry().getCoordinates();
          $("#comment").hide();
          $("#text-comment").val(null);
          f1.set('descripion', comment);
          line.forEach(function (objet, id) {
            if (objet.id == f1.U.id) {
              objet.description = comment;
              objet.hexa_code = color;
            }
          });
        }
      }

    }


  });

});