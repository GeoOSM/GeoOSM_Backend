#! /usr/lib/python3/  python3
# -*- coding: utf-8 -*-
import sys
#print sys.path
import os


#import qgis

from qgis.core import *
from qgis.PyQt.QtCore import QFileInfo

pathqgisproject =  sys.argv[1] #"/var/www/smartworld/smartworld4.qgs"
layername = sys.argv[2] #'/var/www/smartworld/style/styles_communes.qml'


def run():
    os.environ["QT_QPA_PLATFORM"] = "offscreen"
    QgsApplication.setPrefixPath("/usr", True)
    qgs = QgsApplication([], False)
    qgs.initQgis()

    project = QgsProject()
    project.read(pathqgisproject)

    layer = project.mapLayersByName(layername)
    number_features = layer[0].featureCount()

    print (layer[0].source())
    print (number_features)

run()