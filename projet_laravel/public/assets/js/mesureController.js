app.controller('mesureController',function ($scope,olData) {

olData.getMap().then(function(map) {

var wgs84Sphere = new ol.Sphere(6378137);
var x=null,y=null,x1=null,helpTooltip=null;
var draw=null;


var source = new ol.source.Vector();
var source1 = new ol.source.Vector();


vector = new ol.layer.Vector({
  source: source,
  style: new ol.style.Style({
    fill: new ol.style.Fill({
      color: 'rgba(28, 172, 119, 0.65)'
    }),
    stroke: new ol.style.Stroke({
      color: '#434343',
      width: 2
    }),
    image: new ol.style.Circle({
      radius: 7,
      fill: new ol.style.Fill({
        color: 'rgba(28, 172, 119, 0.65)'
      })
    })
  })
});

map.addLayer(vector);
vector.set("name","mesure")
/**
 * Currently drawn feature.
 * @type {ol.Feature}
 */
var sketch;


/**
 * The help tooltip element.
 * @type {Element}
 */
var helpTooltipElement;




/**
 * The measure tooltip element.
 * @type {Element}
 */
var measureTooltipElement;


/**
 * Overlay to show the measurement.
 * @type {ol.Overlay}
 */
var measureTooltip;


/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
var continuePolygonMsg = 'Cliquez pour continuer à dessiner le polygone';


/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
var continueLineMsg = 'Cliquez pour continuer à dessiner la ligne';


/**
 * Handle pointer move.
 * @param {ol.MapBrowserEvent} evt
 */
var pointerMoveHandler = function(evt) {

  if (evt.dragging) {
    return;
  }
  /** @type {string} */
  var helpMsg = 'Cliquez pour commencer le dessin';
  /** @type {ol.Coordinate|undefined} */
  var tooltipCoord = evt.coordinate;

  if (sketch) {
    var output;
    var geom = (sketch.getGeometry());
    if (geom instanceof ol.geom.Polygon) {
      output = formatArea(/** @type {ol.geom.Polygon} */ (geom));
      helpMsg = continuePolygonMsg;
      tooltipCoord = geom.getInteriorPoint().getCoordinates();
    } else if (geom instanceof ol.geom.LineString) {
      output = formatLength( /** @type {ol.geom.LineString} */ (geom));
      helpMsg = continueLineMsg;
      tooltipCoord = geom.getLastCoordinate();
    }
    measureTooltipElement.innerHTML = output;
    measureTooltip.setPosition(tooltipCoord);
  }

  helpTooltipElement.innerHTML = helpMsg;
  helpTooltip.setPosition(evt.coordinate);
};

//pointer move circle


var pointerMovecircle = function(evt) {
if (sketch) {
 var tooltipCoord = evt.coordinate;
 measureTooltip.setPosition(tooltipCoord);
 var geomline=new ol.geom.LineString([[centre[0],centre[1]],[evt.coordinate[0],evt.coordinate[1]]]);
 output = formatLength((geomline));
   measureTooltipElement.innerHTML = output;
   xx=evt.coordinate[0];
   yy=evt.coordinate[1];
}

  
};





function addInteractionline() {
  var type = 'LineString';
  draw = new ol.interaction.Draw({
    source: source,
    type: /** @type {ol.geom.GeometryType} */ (type),
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(28, 172, 119, 0.65)'
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
          color: 'rgba(28, 172, 119, 0.65)'
        })
      })
    })
     })
 }




function addInteractioncircle() {
  var type = 'Circle';
  draw = new ol.interaction.Draw({
    source: source,
    type: /** @type {ol.geom.GeometryType} */ (type),
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(28, 172, 119, 0.65)'
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
          color: 'rgba(28, 172, 119, 0.65)'
        })
      })
    })
     })
 }

function addInteractionpoly() {
  var type = 'Polygon';
  draw = new ol.interaction.Draw({
    source: source,
    type: /** @type {ol.geom.GeometryType} */ (type),
    style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(28, 172, 119, 0.65)'
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
          color: 'rgba(28, 172, 119, 0.65)'
        })
      })
    })
     })
 }


/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'tooltip';
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  });
  map.addOverlay(helpTooltip);

}


/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
  if (measureTooltipElement) {
    //measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'tooltip tooltip-measure';
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  map.addOverlay(measureTooltip);
}




var formatLength = function(line) {
  var length;
  
    length = Math.round(line.getLength() * 100) / 100;
  
  var output;
  if (length > 100) {
    output = (Math.round(length / 1000 * 100) / 100) +
        ' ' + 'km';
  } else {
    output = (Math.round(length * 100) / 100) +
        ' ' + 'm';
  }
  return output;
};


/**
 * format length output
 * @param {ol.geom.Polygon} polygon
 * @return {string}
 */
var formatArea = function(polygon) {
  var area;
 
    area = polygon.getArea();
  
  var output;
  if (area > 10000) {
    output = (Math.round(area / 1000000 * 100) / 100) +
        ' ' + 'km<sup>2</sup>';
  } else {
    output = (Math.round(area * 100) / 100) +
        ' ' + 'm<sup>2</sup>';
  }
  return output;
};


$scope.mesure_distance=function(distance){

if(distance){

map.removeInteraction(draw);
vector.getSource().clear();

if(x!=null){
map.unByKey(x);
x=null;
}

//
if(y!=null){
map.unByKey(y);
y=null;
}


//
if(x1!=null){
map.unByKey(x1);
x1=null;
}

addInteractionline();
createHelpTooltip();
createMeasureTooltip();

 x=map.on('pointermove', pointerMoveHandler);
map.addInteraction(draw);
draw.on('drawstart',
      function(evt) {
        // set sketch
        sketch = evt.feature;
      }, this);

  draw.on('drawend',
      function(evt) {
        measureTooltipElement.className = 'tooltip tooltip-static';
        measureTooltip.setOffset([0, -7]);
        // unset sketch
        sketch = null;
        // unset tooltip so that a new one can be created
        measureTooltipElement = null;
        createMeasureTooltip();
      }, this);


y=map.on("click",function(evt){

createMeasureTooltip();

});


}else{


map.removeInteraction(draw);
vector.getSource().clear();
//
if(x!=null){
map.unByKey(x);
x=null;
}

//
if(y!=null){
map.unByKey(y);
y=null;
}


//
if(x1!=null){
map.unByKey(x1);
x1=null;
}



$(".tooltip-measure").remove();
$(".tooltip-static").remove();
map.removeOverlay(helpTooltip);

}
}







$scope.mesure_surface=function(surface){

if(surface){

map.removeInteraction(draw);
vector.getSource().clear();
if(x!=null){
map.unByKey(x);
x=null;
}

//
if(y!=null){
map.unByKey(y);
y=null;
}


//
if(x1!=null){
map.unByKey(x1);
x1=null;
}
$(".tooltip-static").remove();
$(".tooltip-measure").remove();

map.removeOverlay(helpTooltip);

addInteractionpoly();

createHelpTooltip();

createMeasureTooltip();

x=map.on('pointermove', pointerMoveHandler);

map.addInteraction(draw);

draw.on('drawstart',function(evt) {

   sketch = evt.feature;
      
      }, this);

  draw.on('drawend',
      function(evt) {
        measureTooltipElement.className = 'tooltip tooltip-static';
        measureTooltip.setOffset([0, -7]);
        // unset sketch
        sketch = null;
        // unset tooltip so that a new one can be created
        measureTooltipElement = null;
        createMeasureTooltip();
      }, this);
}else{

map.removeInteraction(draw);
vector.getSource().clear();
//
if(x!=null){
map.unByKey(x);
x=null;
}

//
if(y!=null){
map.unByKey(y);
y=null;
}


//
if(x1!=null){
map.unByKey(x1);
x1=null;
}
$(".tooltip-static").remove();
$(".tooltip-measure").remove();
map.removeOverlay(helpTooltip);

}

   }


$scope.mesure_cercle=function(cercle){
if(cercle){

 map.removeInteraction(draw);
    vector.getSource().clear();


if(x!=null){
map.unByKey(x);
x=null;
}

//
if(y!=null){
map.unByKey(y);
y=null;
}


//
if(x1!=null){
map.unByKey(x1);
x1=null;
}
    map.removeOverlay(helpTooltip);
    $(".tooltip-measure").remove();
    $(".tooltip-static").remove();

    addInteractioncircle();
map.addInteraction(draw);
createMeasureTooltip();
x1=map.on('pointermove', pointerMovecircle);
draw.on('drawstart',
      function(evt) {
         
sketch = evt.feature;
y1=map.on("click",function(evt){
centre=evt.coordinate;
createMeasureTooltip();
map.unByKey(y1);
});
      }, this);

draw.on('drawend',
      function(evt) {
      measureTooltipElement.className = 'tooltip tooltip-static';
      measureTooltip.setOffset([0, -7]);
      sketch = null;
      measureTooltipElement = null;
      createMeasureTooltip();
      var geomline=new ol.geom.LineString([[centre[0],centre[1]],[xx,yy]]);
       var feature = new ol.Feature({
    
    geometry: geomline
});

       source.addFeature(feature);
      
      }, this);
}else{
map.removeInteraction(draw);
vector.getSource().clear();
if(x!=null){
map.unByKey(x);
x=null;
}

//
if(y!=null){
map.unByKey(y);
y=null;
}


//
if(x1!=null){
map.unByKey(x1);
x1=null;
}
$(".tooltip-static").remove();
$(".tooltip-measure").remove();
map.removeOverlay(helpTooltip);

}

}



});

});