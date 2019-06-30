#! /usr/lib/python3/  python3
# -*- coding: utf-8 -*-
import sys
import os

sys.path.append('/usr/lib/python3/dist-packages/qgis/')
sys.path.append('/usr/lib/python3/dist-packages/')
from qgis.core import *
from qgis.PyQt.QtCore import QSettings, QTranslator, qVersion, QCoreApplication,QFileInfo
from qgis.PyQt.QtGui import QIcon


#"/var/www/smartworld/smartworld4.qgs"
#/var/www/smartworld/gpkg/cours_deau_false_9_78.zip
#print 'Number of arguments:', len(sys.argv), 'arguments.'
#print 'Argument List:', str(sys.argv)

pathqgisproject = "/var/www/smartworld/occitanie_icon.qgs"
# pathqgisproject = sys.argv[1]
#layername = sys.argv[2]
layername = "Banque"


 

# layer.setCustomProperty("labeling", "pal")
# layer.setCustomProperty("labeling/enabled", "true")
# layer.setCustomProperty("labeling/fontFamily", "Arial")
# layer.setCustomProperty("labeling/fontSize", "10")
# layer.setCustomProperty("labeling/fieldName", "name")
# layer.setCustomProperty("labeling/placement", "2")

# layer = QgsMapLayerRegistry.instance().mapLayersByName(communes)
# layer = project.mapLayers()
# print(layer)
# for lay in layer:
    # print (lay,lay.id())
    #QgsMapLayerRegistry.instance().removeMapLayers( [lay.id()] )
    # svgStyle = {}
    # svgStyle['name'] = '/var/www/smartworld/svg/occitanie/add-user.svg'
    # svgStyle['outline'] = '#000000'
    # svgStyle['size'] = '5'
    # symbolLayer = QgsSvgMarkerSymbolLayerV2.create(svgStyle)
    # symbol = QgsSymbolV2.defaultSymbol(lay.geometryType()) 
    # symbol.changeSymbolLayer(0, symbolLayer)
    # renderer = QgsRuleBasedRendererV2(symbol)
    # root_rule = renderer.rootRule()
    # lay.setRendererV2(renderer)

#succes = project.write()
# print ("ok")


# ,QgsRasterMarkerSymbolLayer('/var/www/smartworld/svg/occitanie/mairies.png',50)
def run():
    os.environ["QT_QPA_PLATFORM"] = "offscreen"
    # supply path to qgis install location
    QgsApplication.setPrefixPath("/usr", True)

    # create a reference to the QgsApplication, setting the
    # second argument to False disables the GUI
    qgs = QgsApplication([], False)

    # load providers
    qgs.initQgis()
    # print (QgsMarkerSymbol,QgsSvgMarkerSymbolLayer,QgsRasterMarkerSymbolLayer)
    pathqgisproject = "/var/www/smartworld/occitanie.qgs"

    project = QgsProject()
    project.read(pathqgisproject)
    print ('finish',project.mapLayers())
    # layer = project.mapLayersByName("Association_false_54_198_gpkg")

    # for lay in layer:
    #     print (lay,lay.id())
    #     # project.removeMapLayer(lay.id())
    # print ('ok')
    # qgs.exitQgis()    

run()