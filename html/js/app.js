/**основной модуль приложения**/
var App = {};
App.iface = {};
App.cityPoly = null;  //мультиполигон(полигон) города
App.point = null;//маркер произвольной точки
App.city_list = [];//список городов (массив объектов)
App.city = null; //объект города
App.iface.boundaryIcon = L.icon({ //иконка флажка для обозначения границы
    iconUrl: 'img/flag32.png',
    iconRetinaUrl: 'img/flag32.png',
    iconSize: [32, 32],
    iconAnchor: [0, 32],
    popupAnchor: [0, 32]
});

App.tempPolygonStyle = {
    "color": "#ff7800",
    "weight": 2,
    "opacity": 0.65
};

App.boundaryMarkers = [];//массив для хранения объектов маркеров обозначающих границу
App.tempPolygonGeoJSON = null; //объект для хранения GeoJSON временного полигона
App.tempPolygon = null; //объект для хранения временного полигона

App.init = function(){
    App.map = Map;
    App.map.init([56.605, 47.9]);
    
    App.iface.btnDelCity = document.getElementById('del-city');
    App.iface.btnSaveCity = document.getElementById('save-city');
    App.iface.btnDelMarkers = document.getElementById('del-markers');
    App.iface.inputCityName = document.getElementById('city-name');
    App.iface.inputCityLastname = document.getElementById('city-lastname');
    App.iface.inputCityCountry = document.getElementById('city-country');
    App.iface.selectCityList = document.getElementById('city-list');
    App.iface.btnSaveCity.onclick = Handler.btnSaveCityClick;
    App.iface.btnDelCity.onclick = Handler.btnDelCityClick;
    App.iface.btnDelMarkers.onclick = Handler.btnDelMarkersClick;
    App.iface.selectCityList.onchange = App.getCity;
    App.map.addListener('click', Handler.mapClick);
    App.iface.addRadioListener('task', App.switchMode);
    App.switchMode();
    App.iface.preloader = document.getElementById('preloader');
    App.iface.time = document.getElementById('time');
    App.getList();
   
};


/**
* показ элемента
**/
App.iface.showElem = function(el){
    el.style.display = 'inline-block';
};

/**
* скрытие элемента
**/
App.iface.hideElem = function(el){
    el.style.display = 'none';
};

/**
 * удаление маркеров обозначающих границу
 * */
App.delBoundaryMarkers = function(){
    for (var i = 0; i < App.boundaryMarkers.length; i++){
        App.map.removeLayer(App.boundaryMarkers[i]);
    }
    App.boundaryMarkers = [];
};

/**
* Получение значение радио переключателя вида задачи
* @param name атрибут name радиокнопки 
* @return значение
**/
App.iface.getRadio = function(name){
    var inputs = document.getElementsByTagName('input');
    for ( var i = 0; i < inputs.length; i++ ){
        if ( inputs[i].attributes.name.value == name )
            if ( inputs[i].attributes.type.value == 'radio' )
                if( inputs[i].checked ) return inputs[i].value;
    }
    return null;
};


/**
 * установка обработчиков на переключение радиокнопки
 **/
App.iface.addRadioListener = function(name, handler){
    var inputs = document.getElementsByTagName('input');
    for ( var i = 0; i < inputs.length; i++ ){
        if ( inputs[i].attributes.name.value == name )
            if ( inputs[i].attributes.type.value == 'radio' )
                inputs[i].addEventListener('change', handler);
    }
};


App.switchMode = function(){
    var radio = App.iface.getRadio('task');
    //console.log(radio);
    if (radio == 'view'){
        document.getElementById('buttons').style.display = 'none';
        App.delBoundaryMarkers();
        App.hideTempPolygon();
        App.showCityPolygon();
    }else{
        document.getElementById('buttons').style.display = 'block';
        App.hideCityPolygon();
        App.createMarkersFromCity();
        App.showTempPolygon(App.boundaryMarkers);
    }
};


/**
* определение принадлежности заданной точки к городу 
* @param point заданная точка {lat:lat, lng:lng}
**/
App.searchCity = function(point){
    App.iface.showElem(App.iface.preloader);
    Time.start();
    Request.searchCity(point, function(result){
        App.iface.hideElem(App.iface.preloader);
        App.iface.time.textContent = Time.stop() + ' мс';
        App.iface.time.innerText = Time.stop() + ' мс';
        //console.log(JSON.stringify(result));
        if ( result.incity == true ){
            App.hideCity();
            App.showCity(result);
            
        }else{
            App.hideCity();
        }
        App.getList();
    });
};

/**
 * получения города по его id
 **/
App.getCity = function(){
    var id = App.iface.selectCityList.value;
    App.iface.showElem(App.iface.preloader);
    Request.getCity(id, App.showCity2);
};

/**
 * Показать границы города на карте 
 **/
App.showCity = function(result){
    App.hideCity();
    App.city = result;
    App.cityPoly = L.geoJson(result.city_geometry).addTo(Map.map);
    App.iface.inputCityName.value = result.city_name;
    App.iface.inputCityLastname.value = result.city_lastname;
    App.iface.inputCityCountry.value = result.city_country;
};

/**
 * Показать границы города на карте 
 **/
App.showCity2 = function(result){
    App.iface.hideElem(App.iface.preloader);
    App.hideCity();
    App.map.setCenter([result.avg_lat, result.avg_lng]);
    App.city = result;
    if (App.iface.getRadio('task') == 'view'){
        App.cityPoly = L.geoJson(result.city_geometry).addTo(Map.map);
    }
    App.iface.inputCityName.value = result.city_name;
    App.iface.inputCityLastname.value = result.city_lastname;
    App.iface.inputCityCountry.value = result.city_country;
};


/**
 * Скрыть границы города на карте и очистить текущий город
 **/
App.hideCity = function(){
    if (App.cityPoly != null){
        Map.map.removeLayer(App.cityPoly);
        App.city = null;
        App.cityPoly = null;
    }
    App.iface.inputCityName.value = "";
    App.iface.inputCityLastname.value = "";
    App.iface.inputCityCountry.value = "";
};


/**
 * Скрыть только полигон текущего города с карты
 **/
App.hideCityPolygon = function(){
    if (App.cityPoly != null){
        Map.map.removeLayer(App.cityPoly);
        App.cityPoly = null;
    }
};


/**
 * Показать полигон текущего города на карте
 **/
App.showCityPolygon = function(){
    if (App.cityPoly == null && App.city != null){
        App.map.setCenter([App.city.avg_lat, App.city.avg_lng]);
        App.cityPoly = L.geoJson(App.city.city_geometry).addTo(Map.map);
    }
};


/**
 * Запрос списка городов
 **/
App.getList = function(){
    Request.getList(App.fillList);
};

/**
 * Заполнение списка городов
 * */
App.fillList = function(result){
    
    App.city_list = result.city_list;
    App.iface.destroyChildren(App.iface.selectCityList);
    
    for (var i = 0; i < result.city_list.length; i++){
        var opt = document.createElement('option');
        opt.value = result.city_list[i].id;
        opt.innerText = result.city_list[i].city_name;
        opt.textContent = result.city_list[i].city_name;
        if (App.city != null && result.city_list[i].id == App.city.id){
            opt.selected = 'selected';
        }
        App.iface.selectCityList.appendChild(opt);
    }
        
};

/**
* удаление дочерних узлов у DOM элемента
* @param node DOM элемент
**/
App.iface.destroyChildren = function(node){
  if (!node) return;
  node.innerHTML = '';
  while (node.firstChild)
      node.removeChild(node.firstChild);
}

/**
 * отображение временного полигона на карте
 * @param markers массив объектов маркеров границы
 * */
App.showTempPolygon = function(markers){
    App.hideTempPolygon();
    if (markers.length < 3) return false;
    App.tempPolygonGeoJSON = {};
    App.tempPolygonGeoJSON.type = "Polygon";
    var coords = [];
    for (var i = 0; i < markers.length; i++){
        coords.push([markers[i].getLatLng().lng, markers[i].getLatLng().lat]);
        
    }
    App.tempPolygonGeoJSON.coordinates = [coords];
    console.log(JSON.stringify(App.tempPolygonGeoJSON));
    App.tempPolygon = L.geoJson(App.tempPolygonGeoJSON,{style:App.tempPolygonStyle}).addTo(Map.map);
    return true;
};

/**
 * создание маркеров на основе GeoJSON текущего города
 * */
App.createMarkersFromCity = function(){
    if (App.city != null){
        if (App.city.city_geometry.type == 'Polygon'){
            var coords = App.city.city_geometry.coordinates[0];
        }else if (App.city.city_geometry.type == 'MultiPolygon'){
            var coords = App.city.city_geometry.coordinates[0][0];
        }else{
            return;
        }
        for (var i = 0; i < coords.length; i++){
            var point = {lat: coords[i][1], lng: coords[i][0]};
            App.addBoundaryMarker(point);
        }
    }
};

/**
 * добавление маркера границы на карту
 * @param point объект точки вида {lat.lat, lng:lng}
 * */
App.addBoundaryMarker = function(point){
    var boundaryMarker = L.marker(L.latLng(point.lat, point.lng), {draggable:true, icon: App.iface.boundaryIcon}).addTo(App.map.map);
    App.boundaryMarkers.push(boundaryMarker);
    App.boundaryMarkers[App.boundaryMarkers.length - 1].on('dragend', function(e){
        App.showTempPolygon(App.boundaryMarkers);
    });
};

/**
 * удаление временного полигона с карты
 * */
App.hideTempPolygon = function(){
    if (App.tempPolygon != null){
        App.map.removeLayer(App.tempPolygon);
        App.tempPolygon = null;
        App.tempPolygonGeoJSON = null;
    }
};


/**
 * Отправка запроса на сервер для сохранения изменений в базу 
 * */
App.saveChange = function(){
    var name = App.iface.inputCityName.value;
    var lastname = App.iface.inputCityLastname.value;
    var country = App.iface.inputCityCountry.value;
    var geometry = null;
    
    if (name == '' || lastname == '' || country == ''){
        alert('Заполните текстовые поля!');
        return;
    }
    var id = -1;
    if (App.tempPolygon != null && App.city != null){
        geometry = App.tempPolygonGeoJSON;
        id = App.city.id;
        if (!confirm('Внести изменения в данные населенного пункта?')) return;
        Request.editCity(id, name, lastname, country, geometry, function(result){
            App.getCity();
        });
    }else if (App.city != null){
        geometry = App.city.city_geometry;
        id = App.city.id;
        if (!confirm('Внести изменения в данные населенного пункта?')) return;
        Request.editCity(id, name, lastname, country, geometry, function(result){
            App.getCity();
        });
    }else if(App.tempPolygon != null){
        geometry = App.tempPolygonGeoJSON;
        App.iface.showElem(App.iface.preloader);
        if (!confirm('Добавить населенный пункт?')) return;
        Request.addCity(name, lastname, country, geometry, function(result){
            App.hideTempPolygon();
            App.delBoundaryMarkers();
            App.showCity2(result);
            App.getList();
            App.createMarkersFromCity();
            App.showTempPolygon(App.boundaryMarkers);
        });
    }else{
        alert('Полигон не задан!');
        return;
    }    
};


/**
 * Отправка запроса на сервер для удаления города
 * */
App.delCity = function(){
    if (!confirm('Удалить данные текущего населенного пункта?')) return;
    if (App.city != null){
        var id = App.city.id;
        Request.delCity(id, function(){
            App.hideCity();
            App.city = null;
            App.getList();
            App.delBoundaryMarkers();
            App.hideTempPolygon();
        });
    }else{
        alert('Населенный пункт не выбран!');
    }
};