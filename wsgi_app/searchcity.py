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
    data = d['data'][0].split(',')
    print data
    point_lat = float(data[0])
    point_lng = float(data[1])
    db_file = CITY_DB_FILE
    city = searchCity(point_lat, point_lng, db_file)
    print city
    if city != None:
        response = '{"incity":true, "city_name":"' + city[0] + '", "city_lastname":"' + city[1] + '","city_geometry":' + city[2] + ', "city_country":"' + city[3] + '", "id":' + str(city[4])+ ', "avg_lat":'+str(city[5])+', "avg_lng":'+str(city[6])+'}'
		#response = '{"incity":true, "city_name":"' + city[0] + '", "city_lastname":"' + city[1] + '"}'
    else:
        response = '{"incity":false}'
    response_headers = [('Content-type', 'text/html; charset=utf-8'), ('Access-Control-Allow-Origin', '*')]
    start_response(status, response_headers)
    return [response]

#определение пересечения точки с полигоном города и возврат в случае пересечения имени города и его полигона
def searchCity(point_lat, point_lng, db_file):
    conn = db.connect(DB_DIR + db_file)
    cur = conn.cursor()
    sql = "SELECT id, geometry, city_name, city_lastname, country, min_lat, min_lng, max_lat, max_lng FROM city WHERE min_lng <= " + str(point_lng) + " AND min_lat <= " + str(point_lat) + " AND max_lng  >= " + str(point_lng) + " AND max_lat >= " + str(point_lat)
    id = -1
    res = cur.execute(sql)
    for rec in res:
        id = rec[0]
        city_geometry = rec[1].strip().encode('utf-8')
        city_name = rec[2].encode('utf-8')
        city_lastname = rec[3].encode('utf-8')
        city_country = rec[4].encode('utf-8')
        min_lat = rec[5]
        min_lng = rec[6]
        max_lat = rec[7]
        max_lng = rec[8]
        point_geometry = '{"type":"Point","coordinates":[' + str(point_lng) + ',' + str(point_lat) + ']}'
    if id == -1:
        return None
    sql = "SELECT Intersects(GeomFromGeoJSON('" + city_geometry + "'),GeomFromGeoJSON('" + point_geometry + "'))"
    res = cur.execute(sql)
    in_city = 0
    for rec in res:
        print 'rec=' + str(rec)
        in_city = rec[0]
    cur.close()
    conn.close()
    if in_city == 1:
        return (city_name, city_lastname, city_geometry, city_country, id, (min_lat+max_lat)/2, (min_lng+max_lng)/2)
    else:
        return None
