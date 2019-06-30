import base64
import xml.etree.ElementTree
from xml.etree import ElementTree as et
from xml.dom.minidom import Document
import sys
import os
from PyQt5.QtGui import *
from qgis.core import *
from qgis.PyQt.QtCore import QFileInfo

# pathqgisproject =  sys.argv[1] #"/var/www/smartworld/smartworld4.qgs"
# icon_png = sys.argv[2] #'/var/www/smartworld/style/styles_communes.qml'
# layername = sys.argv[3] #'communes'

# pathqgisproject =  "/var/www/smartworld/occitanie_icon.qgs"
# icon_png = '/var/www/smartworld/occitanie_gpkg/img/banque.png'
# layername = 'Banque'
# folder = "/var/www/smartworld/occitanie_gpkg/img"

pathqgisproject = sys.argv[1]
icon_png = sys.argv[2]
layername = sys.argv[3]
folder =sys.argv[4]

def set_icons(img_svg):
    os.environ["QT_QPA_PLATFORM"] = "offscreen"
    QgsApplication.setPrefixPath("/usr", True)
    qgs = QgsApplication([], False)
    qgs.initQgis()

    project = QgsProject()
    project.read(pathqgisproject)

    layer = project.mapLayersByName(layername)
    vlayer = layer[0]

    # svgStyle = {}
    # svgStyle['name'] = '/var/www/smartworld/occitanie_gpkg/img/aed-2.svg'
    # svgStyle['size'] = '40'
    # svgStyle['size_unit'] = 'Pixel'
    # symbolLayer =  	QgsSvgMarkerSymbolLayer.create(svgStyle)

    # symbol = QgsSymbol.defaultSymbol(vlayer.geometryType()) 
    # symbol.changeSymbolLayer(0, symbolLayer)

    # vlayer.renderer().setSymbol(symbol)

    # class QgsPointClusterRenderer
    symbol_layer = vlayer.renderer()
    # afficher l'icone simple sans custer
    symbol_layer.symbols(QgsRenderContext())[0].symbolLayer(0).setPath(img_svg)
    # tous les symbols pour le cluster contenu dans la symbologie
    symbols = symbol_layer.clusterSymbol().symbolLayers()

    #on cherche le symbol en svg pour le changer
    for symbol in symbols:
        if  type(symbol) is QgsSvgMarkerSymbolLayer:
            # print(symbol.path(),'yess')
            symbol.setPath(img_svg)
        if  type(symbol) is QgsSimpleMarkerSymbolLayer:
            print(symbol.properties(),'yess')
            symbol.setColor(QColor.fromRgb(33,150,243))
           #,symbol_layer.symbols(QgsRenderContext())[0].symbolLayer(0).properties(),

    print('ok',project.write())


def set_style():
    os.environ["QT_QPA_PLATFORM"] = "offscreen"
    QgsApplication.setPrefixPath("/usr", True)
    qgs = QgsApplication([], False)
    qgs.initQgis()

    project = QgsProject()
    project.read(pathqgisproject)


    layer = project.mapLayersByName(layername)
    #print layer
    for lay in layer:
        lay.loadNamedStyle('/var/www/smartworld//template_point.qml')
    succes1 = project.write()
    if succes1 :print ('ok')


encoded = base64.b64encode(open(icon_png, "rb").read()).decode()

doc = Document()
svg = doc.createElement("svg")
doc.appendChild(svg)

svg.setAttribute("id", "mySvg")
svg.setAttribute("xmlns", "http://www.w3.org/2000/svg")
svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink")

image = doc.createElement("image")
svg.appendChild(image)
image.setAttribute("width", "160")
image.setAttribute("height", "160")
image.setAttribute("xlink:href", 'data:image/png;base64,{}'.format(encoded))


clean = doc.createTextNode("")
image.appendChild(clean)

f = open(folder+"/"+layername+".svg", "w")
f.write(doc.toprettyxml())
f.close()  
set_style()
set_icons(folder+"/"+layername+".svg")
print('finish')