/** модуль запросов к серверу **/

var Request = {
    server: 'http://cityboundary.py:8080',
    
     /**
    * определение принадлежности точки городу
    * @param start заданная точка {lat:lat, lng:lng}
    * @param callback функция обратного вызова в которую передается результат
    **/
    
    searchCity: function(start, callback){
        var params = 'data=' + [start.lat,start.lng].join(',');
        console.log(params);
        var url = Request.server+'/searchcity';
        console.log(url)
        Ajax.sendRequest('GET', url, params, function(result) {
            callback(result);
        });
    },
    
    /**
    * получение списка городов
    * @param callback функция обратного вызова в которую передается результат
    **/
    getList: function(callback){
        var url = Request.server+'/listcity';
         Ajax.sendRequest('GET', url, null, function(result) {
            callback(result);
        });
    },
    
    /**
    * получение города по его id
    * @param id id города
    * @param callback функция обратного вызова в которую передается результат
    **/
    getCity: function(id, callback){
        var params = 'data=' + id;
        var url = Request.server+'/getcity';
        Ajax.sendRequest('GET', url, params, function(result) {
            callback(result);
        });
    },
    
    /**
     * редактирование записи о городе
     * */
    editCity: function(id, name, lastname, country, geometry, callback){
        var params = 'data=' + [id, name, lastname, country, JSON.stringify(geometry)].join('|');
        console.log(params);
        var url = Request.server+'/editcity';
        Ajax.sendRequest('POST', url, params, function(result) {
            callback(result);
        });
    },
    
     /**
     * создание записи о городе
     * */
    addCity: function(name, lastname, country, geometry, callback){
        var params = 'data=' + [name, lastname, country, JSON.stringify(geometry)].join('|');
        var url = Request.server+'/addcity';
        Ajax.sendRequest('POST', url, params, function(result) {
            callback(result);
        });
    },
    
     /**
     * удаление записи о городе
     * */
    delCity: function(id, callback){
        var params = 'data=' + id;
        var url = Request.server+'/delcity';
        Ajax.sendRequest('GET', url, params, function(result) {
            callback(result);
        });
    }
    
       
};

