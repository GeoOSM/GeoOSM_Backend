#! /usr/lib/python3/  python3
# -*- coding: utf-8 -*-
import sys
import os

from qgis.core import *
from qgis.PyQt.QtCore import QFileInfo


#"/var/www/smartworld/smartworld4.qgs"
#/var/www/smartworld/gpkg/cours_deau_false_9_78.zip
#print 'Number of arguments:', len(sys.argv), 'arguments.'
# print 'Argument List:', str(sys.argv)

pathqgisproject = sys.argv[1]

# print pathqgisproject
# print zipfile
# print layername

def run():
    os.environ["QT_QPA_PLATFORM"] = "offscreen"
    QgsApplication.setPrefixPath("/usr", True)
    qgs = QgsApplication([], False)
    qgs.initQgis()

    project = QgsProject()
    project.read(pathqgisproject)

    project.reloadAllLayers()

    succes = project.write()

    if succes :print ('ok')

    QgsApplication.exitQgis()

run()