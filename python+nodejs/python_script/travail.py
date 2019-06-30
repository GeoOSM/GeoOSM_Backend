#! /usr/lib/python2.7/  python
# -*- coding: utf-8 -*-
import string
import os
import sys
#/usr/lib/python2.7/dist-packages/qgis/__init__.pyc'
from xml.dom.minidom import Document
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
from PyQt4.QtGui import *
from qgis.gui import *
from PyQt4.QtCore import *
#import qgis.core
from qgis.core import *
from qgis.gui import *
from PyQt4.QtCore import *
from PyQt4.QtGui import QApplication
from PyQt4.QtXml import *
import xml.etree.ElementTree
from xml.etree import ElementTree as et


strProjetNameSave = "/var/www/smartworld/smartworld5_temp.qgs"

strProjetName = sys.argv[1]
# strProjetName = "/var/www/smartworld/smartworld4.qgs"
strTempFile1 = "/var/www/smartworld/Temp1.xml"
strTempFile2 = "/var/www/smartworld/Temp2.xml"

myLayers =[]
pWfsLayer =[]
pLayers =[]
pLayerIDs =[]

from PyQt4.QtCore import QFileInfo

qgs = QgsApplication([], False)
QgsApplication.setPrefixPath("/usr/", False)

def get_Layers(): 
    QgsApplication.initQgis()
    project = QgsProject.instance()
    project.read(QFileInfo(strProjetName))
    render = QgsMapRenderer()
    #canvas = QgsMapCanvas() writePath
    mapLayers_ = QgsMapLayerRegistry.instance().mapLayers()
    for lay in mapLayers_:
        layer = QgsMapLayerRegistry.instance().mapLayer(lay)
        lst = [ layer.id() ] # add ID of every layer

        if layer.type()==0:
            pWfsLayer.append(u'%s' % layer.id())

        pLayers.append(u'%s' % layer.name())
        pLayerIDs.append(layer.id())
        render.setLayerSet(lst)
        rect = QgsRectangle(render.fullExtent())            
        rect.scale(1.1)
        
    project.writeEntry('WFSLayers', '', pWfsLayer)      
    project.writeEntry('WMSServiceCapabilities', "/", "True")    
    project.writeEntry('WMSServiceTitle', '', u'GEOCAMEROUN')
    project.writeEntry('WMSContactMail', '', u'nelsontayou1@gmail.com')

    # check if a bbox has been given in the project OWS tab configuration
    pWmsExtentLe = project.readListEntry('WMSExtent','')
    pWmsExtent = pWmsExtentLe[0]
    
    if len(pWmsExtent) < 1 :
       pWmsExtent.append(u'%s' % rect.xMinimum())
       pWmsExtent.append(u'%s' % rect.yMinimum())
       pWmsExtent.append(u'%s' % rect.xMaximum())
       pWmsExtent.append(u'%s' % rect.yMaximum())
       project.writeEntry('WMSExtent', '', pWmsExtent)
    else:
       if not pWmsExtent[0] or not pWmsExtent[1] or not pWmsExtent[2] or not pWmsExtent[3]:
           pWmsExtent[0] = u'%s' % rect.xMinimum()
           pWmsExtent[1] = u'%s' % rect.yMinimum()
           pWmsExtent[2] = u'%s' % rect.xMaximum()
           pWmsExtent[3] = u'%s' % rect.yMaximum()
           project.writeEntry('WMSExtent', '', pWmsExtent)

    crsList = project.readListEntry('WMSCrsList','')
    pmFound = False
    for i in crsList[0]:
        if i == 'EPSG:3857':
            pmFound = True
    if not pmFound:
        crsList[0].append('EPSG:3857')
        project.writeEntry('WMSCrsList', '', crsList[0])
        crsList[0].append('EPSG:4326')
        project.writeEntry('WMSCrsList', '', crsList[0])
   
    project.writeEntry('WMSAddWktGeometry', "/", "True")
    project.write(QFileInfo(strProjetNameSave))
    # print "termine ici"


def legend_func():
    if os.path.isfile(strTempFile2):
        os.remove(strTempFile2)
    
    f = open(strTempFile2, "w")
    doc = Document()

    # Create the <legend> element
    legend = doc.createElement("legend")
    doc.appendChild(legend)
    legend.setAttribute("updateDrawingOrder", "true")

    
    #for lyr in pWfsLayer:
    for lyr,lyrID in zip(pLayers,pLayerIDs):
         print lyr
         print "\n"
         # Create the <legendlayer> element
         legendlayer = doc.createElement("legendlayer")
         legendlayer.setAttribute("open", "true")
         legendlayer.setAttribute("checked", "Qt::Checked")
         legendlayer.setAttribute("name",lyr)
         legendlayer.setAttribute("showFeatureCount","0")
         
         legend.appendChild(legendlayer)

         # Create the <filegroup> element
         filegroup = doc.createElement("filegroup")
         filegroup.setAttribute("open", "true")
         filegroup.setAttribute("hidden", "false")
         legendlayer.appendChild(filegroup)

         # Create the <legendlayerfile> element
         legendlayerfile = doc.createElement("legendlayerfile")
         legendlayerfile.setAttribute("isInOverview", "0")
         legendlayerfile.setAttribute("layerid", str(lyrID))
         legendlayerfile.setAttribute("visible", "1")
         filegroup.appendChild(legendlayerfile)
         
    f.write(doc.toprettyxml())
    f.close()  


def generate_QGSFile():
   print 'Merge Tags'
   #Open Legend File
   tree1 = xml.etree.ElementTree.parse(strTempFile2)
   root1 = tree1.getroot()
   #Open Original File
   tree2 = xml.etree.ElementTree.parse(strProjetNameSave)
   root2 = tree2.getroot()
   #Insert Legend in main file
   root2.insert(1,root1)
   tree2.write(strProjetName)

get_Layers()
legend_func()
generate_QGSFile()

QgsApplication.exitQgis()


