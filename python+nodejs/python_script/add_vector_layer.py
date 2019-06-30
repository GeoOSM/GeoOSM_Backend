#! /usr/lib/python3/  python3
# -*- coding: utf-8 -*-
import sys
#print sys.path
import os
#/usr/lib/python2.7/dist-packages/qgis/__init__.pyc'

#import qgis


from qgis.core import *
from qgis.PyQt.QtCore import QFileInfo


#"/var/www/smartworld/smartworld4.qgs"
#/var/www/smartworld/gpkg/cours_deau_false_9_78.zip
#print 'Number of arguments:', len(sys.argv), 'arguments.'
#print 'Argument List:', str(sys.argv)
# pathqgisproject ="/var/www/smartworld/occitanie_icon3.qgs"
pathqgisproject = sys.argv[1]
zipfile = sys.argv[2]
layername = sys.argv[3]

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


    layer = QgsVectorLayer(zipfile, layername, "ogr")
    if not layer: print ("Layer failed to load!")

    # layer.setCustomProperty("labeling", "pal")
    # layer.setCustomProperty("labeling/enabled", "true")
    # layer.setCustomProperty("labeling/fontFamily", "Arial")
    # layer.setCustomProperty("labeling/fontSize", "10")
    # layer.setCustomProperty("labeling/fieldName", "name")
    # layer.setCustomProperty("labeling/placement", "2")

    project.addMapLayer(layer)

    WFSLayers = project.readListEntry('WFSLayers','')
    b = list(WFSLayers)[0]
    b.append(u'%s' % layer.id())
    ff = project.writeEntry('WFSLayers', '',  b) 

    succes = project.write()
    
    if succes :print ('ok')

    if not layer: print ("ko")

run()

#QgsApplication.exitQgis()


