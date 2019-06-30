#! /usr/lib/python2.7/  python
# -*- coding: utf-8 -*-
import sys
import os



from qgis.core import *
from qgis.PyQt.QtCore import QFileInfo


pathqgisproject = sys.argv[1]
rasterFile = sys.argv[2]
layername = sys.argv[3]


# print pathqgisproject
# print rasterFile
# print layername

# pathqgisproject = '/var/www/smartworld/africa.qgs'
# rasterFile = '/var/www/smartworld/raster/ocsol_2016_esa/ESACCI-LC-L4-LC10-Map-20m-P1Y-2016-v1.0.tif'
# layername = 'OCSOL 2016 ESA'

def run():
    os.environ["QT_QPA_PLATFORM"] = "offscreen"
    QgsApplication.setPrefixPath("/usr", True)
    qgs = QgsApplication([], False)
    qgs.initQgis()

    project = QgsProject()
    project.read(pathqgisproject)

    layer = QgsRasterLayer(rasterFile, layername)
    if not layer: print ("Layer failed to load!")

    project.addMapLayer(layer) 

    succes = project.write()

    if succes :print ('ok')

    if not layer: print ("ko")

run()