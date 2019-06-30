#! /usr/lib/python2.7/  python
# -*- coding: utf-8 -*-
import sys
#print sys.path
import os
#/usr/lib/python2.7/dist-packages/qgis/__init__.pyc'

sys.path.append('/usr/lib/python2.7/dist-packages/qgis/')
sys.path.append('/usr/lib/python2.7/dist-packages/')

sys.path.insert(0, '/usr/lib/python2.7/dist-packages/qgis/')
sys.path.insert(0, '/usr/lib/python2.7/dist-packages/qgis/PyQt/')
sys.path.insert(0, '/usr/lib/python2.7/dist-packages/PyQt4/')
sys.path.insert(0, '/usr/lib/python2.7/dist-packages/qgis/gui/')
sys.path.insert(0, '/usr/lib/python2.7/dist-packages/qgis/core')

#import qgis


from PyQt import *
from qgis.core import *
#from PyQt.QtCore import *
from PyQt4.QtCore import QFileInfo
#import qgis.core


#"/var/www/smartworld/smartworld4.qgs"
#/var/www/smartworld/gpkg/cours_deau_false_9_78.zip
#print 'Number of arguments:', len(sys.argv), 'arguments.'
#print 'Argument List:', str(sys.argv)

#pathqgisproject = sys.argv[1]
pathqgisproject =  sys.argv[1] #"/var/www/smartworld/smartworld4.qgs"
#layername = sys.argv[2] #'/var/www/smartworld/style/styles_communes.qml'

#pathqgisproject =  "/var/www/smartworld/smartworld4.qgs"
#layername = 'communes'

print pathqgisproject
# print zipfile
# print layername

from PyQt4.QtCore import QFileInfo

qgs = QgsApplication([], False)
QgsApplication.setPrefixPath("/usr/", False)

QgsApplication.initQgis() 

project = QgsProject.instance()
project.read(QFileInfo(pathqgisproject))


layer = QgsMapLayerRegistry.instance().mapLayers().values()
print "layer"
for lay in layer:
    print lay.name()
    #if lay.source().endswith(".zip"):
        #print lay.source()

#QgsMapLayerRegistry.instance().reloadAllLayers()



QgsApplication.exitQgis()