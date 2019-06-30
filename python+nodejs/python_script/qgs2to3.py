#! /usr/lib/python3/  python3
# -*- coding: utf-8 -*-
import sys
import os

from qgis.core import *
from qgis.PyQt.QtCore import QSettings, QTranslator, qVersion, QCoreApplication,QFileInfo
from qgis.PyQt.QtGui import QIcon
import xml.etree.ElementTree
from xml.etree import ElementTree as et


#"/var/www/smartworld/smartworld4.qgs"
#/var/www/smartworld/gpkg/cours_deau_false_9_78.zip
#print 'Number of arguments:', len(sys.argv), 'arguments.'
#print 'Argument List:', str(sys.argv)


pathqgisproject = "/var/www/smartworld/projet_qgis_2/occitanie.qgs"
pathqgisproject3 = "/var/www/smartworld/occitanie.qgs"
# pathqgisproject = sys.argv[1]
#layername = sys.argv[2]

def run():
    os.environ["QT_QPA_PLATFORM"] = "offscreen"
    # supply path to qgis install location
    QgsApplication.setPrefixPath("/usr", True)

    # create a reference to the QgsApplication, setting the
    # second argument to False disables the GUI
    qgs = QgsApplication([], False)

    # load providers
    qgs.initQgis()


    project = QgsProject()
    project.read(pathqgisproject3)

    layers = []
    tree1 = xml.etree.ElementTree.parse(pathqgisproject)
    for element in tree1.getiterator('layer-tree-layer'):
        layers.append(element.attrib)
    b = []
    for layer in layers:
        if layer["providerKey"] == 'ogr':
            filename, file_extension = os.path.splitext(layer['source'])
            if file_extension != ".zip":
                vLayer = QgsVectorLayer(os.path.normpath(layer['source']), layer['name'], "ogr")
            else:
                source_path = os.path.normpath(layer['source']).replace("/vsizip","")
                # print (source_path)
                vLayer = QgsVectorLayer(source_path, layer['name'], "ogr")
            # print (vLayer.isValid(),layer['name'])
            project.addMapLayer(vLayer)
            b.append(u'%s' % vLayer.id()) 
        elif layer["providerKey"] == 'gdal':
            rLayer = QgsRasterLayer(layer['source'], layer['name'])
            # print (rLayer.isValid())
            project.addMapLayer(rLayer)

    project.writeEntry('WFSLayers', '',  b) 
    print ('ok',project.write(pathqgisproject3))
    # qgs.exitQgis()

run()