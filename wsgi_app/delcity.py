#coding=utf-8
from cgi import parse_qs, escape
# importing pyspatialite
from pyspatialite import dbapi2 as db
import time
import os
import math

import sys
abspath = os.path.dirname(__file__)
sys.path.append(abspath)
os.chdir(abspath)
import config

DB_DIR = config.DB_DIR
PLACES_DB_FILE = 'places.sqlite'
CITY_DB_FILE = 'city.sqlite'
MIN_RAST = 0.05

def application(environ, start_response):
    status = '200 OK'
    d = parse_qs(environ['QUERY_STRING'])
    print d
    data = d['data'][0].split(',')
    id = int(data[0])
    db_file = CITY_DB_FILE
    res = delCity(id, db_file)
    if res != None:
        response = '{"incity":true}'
        #response = '{"incity":true, "city_name":"' + city[0] + '", "city_lastname":"' + city[1] + '"}'
    else:
        response = '{"incity":false}'
    response_headers = [('Content-type', 'text/html; charset=utf-8'), ('Access-Control-Allow-Origin', '*')]
    start_response(status, response_headers)
    return [response]

#удаление города из базы по id
def delCity(id, db_file):
    conn = db.connect(DB_DIR + db_file)
    cur = conn.cursor()
    sql = "DELETE FROM city WHERE id=" + str(id)
    res = cur.execute(sql)
    conn.commit()
    cur.close()
    conn.close()
    return res
