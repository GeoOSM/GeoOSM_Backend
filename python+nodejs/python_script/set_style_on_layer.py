#! /usr/lib/python3/  python3
# -*- coding: utf-8 -*-
import sys
#print sys.path
import os


from qgis.core import *
from qgis.PyQt.QtCore import QFileInfo

#"/var/www/smartworld/smartworld4.qgs"
#/var/www/smartworld/gpkg/cours_deau_false_9_78.zip
#print 'Number of arguments:', len(sys.argv), 'arguments.'
#print 'Argument List:', str(sys.argv)

#pathqgisproject = sys.argv[1]
pathqgisproject =  sys.argv[1] #"/var/www/smartworld/smartworld4.qgs"
style_file = sys.argv[2] #'/var/www/smartworld/style/styles_communes.qml'
layername = sys.argv[3] #'communes'

# pathqgisproject = '/var/www/smartworld/africa.qgs'
# style_file = '/var/www/smartworld/raster/ocsol_2016_esa/ESACCI-LC_S2_Prototype_ColorLegend.qml'
# layername = 'OCSOL 2016 ESA'    
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


    layer = project.mapLayersByName(layername)
    #print layer
    for lay in layer:
        lay.loadNamedStyle(style_file)
    succes1 = project.write()
    if succes1 :print ('ok')

run()