#! /usr/lib/python3/  python3
# -*- coding: utf-8 -*-
import sys
import os

from qgis.core import *
from qgis.PyQt.QtCore import QFileInfo
from qgis.analysis import QgsNativeAlgorithms

from shapely.geometry import shape
import json
# pour avoir les outils de processing
sys.path.append('/usr/share/qgis/python/plugins/')

pathqgisproject = sys.argv[1] 
layername =  sys.argv[2] 
path_roi = sys.argv[3]
path_to_save = sys.argv[4]
layernames = [layername]

def run():
    os.environ["QT_QPA_PLATFORM"] = "offscreen"
    QgsApplication.setPrefixPath("/usr", True)
    qgs = QgsApplication([], False)
    qgs.initQgis()

    import processing
    from processing.core.Processing import Processing 
    Processing.initialize()
    QgsApplication.processingRegistry().addProvider(QgsNativeAlgorithms())

    
    project = QgsProject()
    project.read(pathqgisproject) 

    layer_roi = QgsVectorLayer(path_roi, "temporary_roi", "ogr")
    # print (layer_roi.isValid())
    if layer_roi.isValid():
        for lay_name in layernames:
            layer = project.mapLayersByName(lay_name)
            if layer[0]:
                alg_params_dissolve = {
                    'INPUT': layer[0],
                    'OVERLAY': layer_roi,
                    'OUTPUT': path_to_save+lay_name+'.gpkg'
                }
                result = processing.run('native:clip', alg_params_dissolve)
                layer_filtrer = QgsVectorLayer(result['OUTPUT'], lay_name, "ogr")
                # print (result['OUTPUT'],layer_filtrer.featureCount())
                print(layer_filtrer.featureCount())
    else :
        print ('KO')
run ()