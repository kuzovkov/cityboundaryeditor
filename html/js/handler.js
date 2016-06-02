/*модуль обработки событий интерфейса*/

var Handler = {};

Handler.init = function(app){
    Handler.app = app;
};

/**
 * Отправка запроса на сервер для сохранения изменений в базу
 * */
Handler.btnSaveCityClick = function(){
    Handler.app.saveChange();
};


/**
 * удаление текущего города из базы
 **/    
Handler.btnDelCityClick = function(){
    Handler.app.delCity();
};
    
/**
 * удаление маркеров с карты 
 **/
Handler.btnDelMarkersClick = function(){
    App.delBoundaryMarkers();
    App.hideTempPolygon();
    App.hideCityPolygon();
};
    

/**
* обработка клика на карте
**/
Handler.mapClick = function(e){
    if (Handler.app.iface.getRadio('task') == 'view'){
        if (Handler.app.point != null){
            Handler.app.map.removeLayer(Handler.app.point);
            Handler.app.point = null;
        }
        var point = {lat:e.latlng.lat, lng:e.latlng.lng};
        Handler.app.point = L.marker(L.latLng(point.lat, point.lng), {draggable:true}).addTo(Handler.app.map.map);
        //clearAllNodes();
        //clearAllRoads();
        Handler.app.searchCity(point);
        Handler.app.point.on('dragend',function(e){
            var point = {lat:0, lng: 0};
            point.lat = Handler.app.point.getLatLng().lat;
            point.lng = Handler.app.point.getLatLng().lng;
            Handler.app.searchCity(point);
        });
        
    }else{
         if (Handler.app.point != null){
            Handler.app.map.removeLayer(Handler.app.point);
            Handler.app.point = null;
        }
        var point = {lat:e.latlng.lat, lng:e.latlng.lng};
        Handler.app.addBoundaryMarker(point);
        Handler.app.showTempPolygon(Handler.app.boundaryMarkers);
    }         
};