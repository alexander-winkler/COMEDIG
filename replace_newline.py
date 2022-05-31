from lxml import etree
from glob import glob
import re
from collections import defaultdict

xml_files = glob('xml/*.xml')

res_dict = {}

for xml in xml_files:
    res_dict[xml] = {}
    tree = etree.parse(xml)
    title = tree.findall('{*}TEI//{*}titleStmt//{*}title')
    # for t in title:
    #     t.text = re.sub('\s+',' ',t.text)
    #     print(t.text)
    for t in title:
        norm_title = re.sub('\s+',' ',t.text)
        lan = t.find('../../../{*}profileDesc/{*}langUsage/{*}language').attrib['ident']
        res_dict[xml].update( { lan : norm_title } )

for k,v in res_dict.items():
    print(k,v.get('ru',""),v.get('ge',""), v.get('ita',""),sep='\t')