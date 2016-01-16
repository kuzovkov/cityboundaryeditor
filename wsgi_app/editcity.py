#coding=utf-8
from cgi import parse_qs, escape
# importing pyspatialite
from pyspatialite import dbapi2 as db
import time
import os
import math

DB_DIR = '/home/user1/game1/db/'
PLACES_DB_FILE = 'places.sqlite'
CITY_DB_FILE = 'city.sqlite'
MIN_RAST = 0.05

def application(environ, start_response):
    status = '200 OK'
    d = parse_qs(environ['QUERY_STRING'])
    data = d['data'][0].split('|')
    id = int(data[0]) 
    name = data[1]
    lastname = data[2]
    country = data[3]
    geometry = data[4]
    db_file = CITY_DB_FILE
    city = editCity(id, name, lastname, country, geometry, db_file)
    if city != None:
        response = '{"result":true, "city_name":"' + city[0] + '", "city_lastname":"' + city[1] + '","city_geometry":' + city[2] + ', "city_country":"' + city[3] + '", "id":' + str(city[4])+ ', "avg_lat":'+str(city[5])+', "avg_lng":'+str(city[6])+'}'
        #response = '{"incity":true, "city_name":"' + city[0] + '", "city_lastname":"' + city[1] + '"}'
    else:
        response = '{"result":false}'
    response_headers = [('Content-type', 'text/html; charset=utf-8'), ('Access-Control-Allow-Origin', '*')]
    start_response(status, response_headers)
    return [response]

#редактирование города в базе
def editCity(id, city_name, city_lastname, city_country, city_geometry, db_file):
    conn = db.connect(DB_DIR + db_file)
    cur = conn.cursor()
    sql = "SELECT MbrMinX(GeomFromGeoJSON('"+ city_geometry +"')) as min_lng, MbrMinY(GeomFromGeoJSON('"+ city_geometry +"')) as min_lat, MbrMaxX(GeomFromGeoJSON('"+ city_geometry +"')) as max_lng, MbrMaxY(GeomFromGeoJSON('"+ city_geometry +"')) as max_lat"
    res = cur.execute(sql)
    for rec in res:
        min_lng = rec[0]
        min_lat = rec[1]
        max_lng = rec[2]
        max_lat = rec[3]
    sql = "UPDATE city SET city_name='"+city_name+"',city_lastname='"+city_lastname+"', country='"+city_country+"',geometry='"+city_geometry+"',min_lng="+str(min_lng)+",min_lat="+str(min_lat)+",max_lng="+str(max_lng)+",max_lat="+str(max_lat)+ " WHERE id=" + str(id)
    cur.execute(sql)
    conn.commit()
    sql = "SELECT id, geometry, city_name, city_lastname, country, min_lat, min_lng, max_lat, max_lng FROM city WHERE id=" + str(id)
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
    if id == -1:
        return None
    else:
        return (city_name, city_lastname, city_geometry, city_country, id, (min_lat+max_lat)/2, (min_lng+max_lng)/2)
